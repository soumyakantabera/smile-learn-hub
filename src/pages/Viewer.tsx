import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Alert,
  Skeleton,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  TextField,
  Snackbar,
  IconButton,
  LinearProgress,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  OpenInNew as OpenInNewIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  ContentCopy as CopyIcon,
  Close as CloseIcon,
  Event as EventIcon,
  PictureAsPdf as PdfIcon,
  VideoLibrary as VideoIcon,
  Description as DocIcon,
  Slideshow as PptIcon,
  TableChart as SpreadsheetIcon,
  Link as LinkIcon,
  Assignment as HomeworkIcon,
  YouTube as YouTubeIcon,
  Audiotrack as AudioIcon,
  Quiz as QuizIcon,
  Forum as ConversationIcon,
  ListAlt as ListAltIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { useContent } from '@/contexts/ContentContext';
import { useAuth } from '@/contexts/AuthContext';
import { getItem, getModule, getCourse } from '@/lib/content';
import {
  getAdjacentItems,
  getVisitedItems,
} from '@/lib/contentNavigation';
import {
  markItemVisited as dbMarkVisited,
  setResume as dbSetResume,
  addTimeSpent,
} from '@/lib/progress';
import { useProgress } from '@/hooks/useProgress';
import { AppLayout } from '@/components/AppLayout';
import { ItemNavBar } from '@/components/viewer/ItemNavBar';
import { ModuleOutlineDrawer } from '@/components/viewer/ModuleOutlineDrawer';
import { CourseProgressRail } from '@/components/viewer/CourseProgressRail';
import { PageHeader } from '@/components/PageHeader';
import { appConfig } from '@/config/app.config';
import { QuizViewer } from '@/components/viewer/QuizViewer';
import { StepQuizViewer } from '@/components/viewer/StepQuizViewer';
import { ConversationViewer } from '@/components/viewer/ConversationViewer';
import type { ItemType } from '@/types/content';

const typeIcons: Record<ItemType, React.ReactNode> = {
  pdf: <PdfIcon />,
  video: <VideoIcon />,
  doc: <DocIcon />,
  ppt: <PptIcon />,
  spreadsheet: <SpreadsheetIcon />,
  link: <LinkIcon />,
  homework: <HomeworkIcon />,
  youtube: <YouTubeIcon />,
  audio: <AudioIcon />,
  quiz: <QuizIcon />,
  conversation: <ConversationIcon />,
};

const typeColors: Record<ItemType, string> = {
  pdf: '#D32F2F',
  video: '#1976D2',
  doc: '#2196F3',
  ppt: '#FF5722',
  spreadsheet: '#4CAF50',
  link: '#9C27B0',
  homework: '#FF9800',
  youtube: '#FF0000',
  audio: '#E91E63',
  quiz: '#673AB7',
  conversation: '#0F3D2E',
};

const typeLabels: Record<ItemType, string> = {
  pdf: 'PDF Document',
  video: 'Video',
  doc: 'Word Document',
  ppt: 'Presentation',
  spreadsheet: 'Spreadsheet',
  link: 'External Link',
  homework: 'Homework',
  youtube: 'YouTube Video',
  audio: 'Audio Recording',
  quiz: 'Interactive Quiz',
  conversation: 'Conversation Practice',
};

export default function ViewerPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const { content, isLoading, error } = useContent();
  const { session } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [studentName, setStudentName] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [outlineOpen, setOutlineOpen] = useState(false);

  // Compute navigation context
  const adj = content && itemId ? getAdjacentItems(content, itemId) : null;

  // Ensure progress cache loaded
  useProgress();

  // Mark item visited + set resume in DB; track time spent.
  useEffect(() => {
    if (!adj?.course || !adj?.module || !itemId) return;
    const courseId = adj.course.id;
    const moduleId = adj.module.id;
    dbMarkVisited({ itemId, courseId, moduleId });
    dbSetResume({ itemId, courseId, moduleId });
    const startedAt = Date.now();
    return () => {
      const seconds = Math.round((Date.now() - startedAt) / 1000);
      if (seconds > 2) addTimeSpent(itemId, seconds);
    };
  }, [adj?.course?.id, adj?.module?.id, itemId]);

  const visited = adj?.course ? getVisitedItems(adj.course.id) : new Set<string>();

  // Keyboard shortcuts (left/right arrows)
  useEffect(() => {
    if (!adj) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.key === 'ArrowRight' || e.key === 'j') && adj.next) {
        navigate(`/view/${adj.next.item.id}`);
      } else if ((e.key === 'ArrowLeft' || e.key === 'k') && adj.prev) {
        navigate(`/view/${adj.prev.item.id}`);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [adj, navigate]);



  if (isLoading) {
    return (
      <AppLayout>
        <Skeleton variant="text" width={300} height={40} />
        <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 3, mt: 3 }} />
      </AppLayout>
    );
  }

  if (error || !content || !itemId) {
    return (
      <AppLayout>
        <Alert severity="error">Failed to load content.</Alert>
      </AppLayout>
    );
  }

  const item = getItem(content, itemId);
  if (!item) {
    return (
      <AppLayout>
        <Alert severity="warning">Content not found.</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/courses')} sx={{ mt: 2 }}>
          Back to Courses
        </Button>
      </AppLayout>
    );
  }

  const module = getModule(content, item.moduleId);
  const course = module ? getCourse(content, module.courseId) : null;

  // Generate submission message
  const generateSubmissionMessage = () => {
    const lines = [
      `📚 Homework Submission`,
      ``,
      `Student Name: ${studentName || '[Your Name]'}`,
      `Student: ${session?.fullName || session?.email || 'Unknown'}`,
      `Course: ${course?.title || 'Unknown'}`,
      `Module: ${module?.title || 'Unknown'}`,
      `Assignment: ${item.title}`,
      ``,
      `[Please attach your completed work]`,
    ];
    return lines.join('\n');
  };

  const handleCopyMessage = () => {
    const message = generateSubmissionMessage();
    navigator.clipboard.writeText(message);
    setSnackbarMessage('Message copied to clipboard!');
    setSnackbarOpen(true);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(generateSubmissionMessage());
    window.open(`https://wa.me/${appConfig.submission.whatsappNumber}?text=${message}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Homework Submission: ${item.title}`);
    const body = encodeURIComponent(generateSubmissionMessage());
    window.open(`mailto:${appConfig.submission.email}?subject=${subject}&body=${body}`, '_blank');
  };

  const getGoogleDocsViewerUrl = (url: string) => {
    return `${appConfig.viewers.googleDocs}${encodeURIComponent(url)}&embedded=true`;
  };

  const getMicrosoftViewerUrl = (url: string) => {
    return `${appConfig.viewers.microsoftOffice}${encodeURIComponent(url)}`;
  };

  const renderViewer = () => {
    switch (item.type) {
      case 'video':
        return (
          <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: 'black', borderRadius: 2, overflow: 'hidden' }}>
            <video
              controls
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
              src={item.url}
            >
              Your browser does not support the video tag.
            </video>
          </Box>
        );

      case 'youtube':
        return (
          <Box sx={{ position: 'relative', paddingTop: '56.25%', borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
            <iframe
              src={item.embedUrl}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </Box>
        );

      case 'audio':
        return (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: `${typeColors.audio}15`,
                  color: typeColors.audio,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                {typeIcons.audio}
              </Box>
              <Typography variant="h6" gutterBottom>
                {item.title}
              </Typography>
              {item.audioDuration && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Duration: {item.audioDuration}
                </Typography>
              )}
              <Box sx={{ maxWidth: 500, mx: 'auto' }}>
                <audio
                  controls
                  style={{ width: '100%' }}
                  src={item.url}
                >
                  Your browser does not support the audio element.
                </audio>
              </Box>
            </CardContent>
          </Card>
        );

      case 'quiz':
        return item.quizMode === 'step' ? <StepQuizViewer item={item} /> : <QuizViewer item={item} />;

      case 'conversation':
        return <ConversationViewer item={item} />;


      case 'pdf':
        return (
          <Box sx={{ borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
            <iframe
              src={getGoogleDocsViewerUrl(item.url!)}
              style={{ width: '100%', height: '600px', border: 'none' }}
              title={item.title}
            />
          </Box>
        );

      case 'doc':
      case 'ppt':
      case 'spreadsheet':
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Document Preview
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  href={item.url}
                  target="_blank"
                >
                  Download
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<OpenInNewIcon />}
                  href={getGoogleDocsViewerUrl(item.url!)}
                  target="_blank"
                >
                  View in Google Docs
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<OpenInNewIcon />}
                  href={getMicrosoftViewerUrl(item.url!)}
                  target="_blank"
                >
                  View in Microsoft Office
                </Button>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
                <iframe
                  src={getGoogleDocsViewerUrl(item.url!)}
                  style={{ width: '100%', height: '500px', border: 'none' }}
                  title={item.title}
                />
              </Box>
            </CardContent>
          </Card>
        );

      case 'link':
        return (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <LinkIcon sx={{ fontSize: 48, color: typeColors.link, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                External Resource
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                This link will open in a new tab
              </Typography>
              <Button
                variant="contained"
                startIcon={<OpenInNewIcon />}
                href={item.url}
                target="_blank"
                size="large"
              >
                Open Link
              </Button>
            </CardContent>
          </Card>
        );

      case 'homework':
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Assignment Instructions
              </Typography>
              {item.dueDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <EventIcon color="warning" />
                  <Typography variant="body2" color="warning.main" fontWeight={500}>
                    Due: {new Date(item.dueDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                </Box>
              )}
              <Box
                sx={{
                  bgcolor: 'background.default',
                  p: 2,
                  borderRadius: 2,
                  mb: 3,
                  whiteSpace: 'pre-wrap',
                }}
              >
                <Typography variant="body2">
                  {item.instructions?.replace(/\\n/g, '\n')}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Submit Your Work
              </Typography>
              <TextField
                fullWidth
                label="Your Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your name"
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<WhatsAppIcon />}
                  onClick={handleWhatsApp}
                >
                  Submit via WhatsApp
                </Button>
                <Button
                  variant="contained"
                  startIcon={<EmailIcon />}
                  onClick={handleEmail}
                >
                  Submit via Email
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CopyIcon />}
                  onClick={handleCopyMessage}
                >
                  Copy Message
                </Button>
              </Box>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Alert severity="info">
            This content type is not supported for inline viewing.
            {item.url && (
              <Button
                href={item.url}
                target="_blank"
                sx={{ ml: 2 }}
              >
                Open in new tab
              </Button>
            )}
          </Alert>
        );
    }
  };

  return (
    <AppLayout>
      <PageHeader
        iconColor={typeColors[item.type]}
        icon={typeIcons[item.type]}
        title={item.title}
        subtitle={item.description}
        crumbs={[
          { label: 'Courses', to: '/courses', icon: <SchoolIcon /> },
          ...(course
            ? [{ label: course.title, to: `/courses/${course.id}`, icon: <MenuBookIcon /> }]
            : []),
          ...(module
            ? [{ label: module.title, to: course ? `/modules/${module.id}` : undefined, icon: <FolderIcon /> }]
            : []),
          { label: item.title, icon: typeIcons[item.type] },
        ]}
        meta={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={typeIcons[item.type] as React.ReactElement}
              label={typeLabels[item.type]}
              size="small"
              sx={{
                bgcolor: `${typeColors[item.type]}15`,
                color: typeColors[item.type],
                fontWeight: 600,
                '& .MuiChip-icon': { color: typeColors[item.type] },
              }}
            />
            {item.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Box>
        }
      />

      {/* Course progress rail */}
      {adj?.current && adj.sequence.length > 0 && (
        <CourseProgressRail
          sequence={adj.sequence}
          currentItemId={item.id}
          visited={visited}
          courseTitle={adj.course?.title}
          moduleTitle={adj.module?.title}
        />
      )}

      {/* Content Viewer */}
      {renderViewer()}

      {/* Prev / Next navigation */}
      {adj && adj.course && (
        <>
          <ItemNavBar
            prev={adj.prev}
            next={adj.next}
            current={adj.current}
            sequence={adj.sequence}
            visited={visited}
            courseId={adj.course.id}
            moduleId={adj.module?.id}
            currentItemId={item.id}
            onOpenOutline={() => setOutlineOpen(true)}
          />
        </>
      )}

      {/* Module outline drawer */}
      {adj && (
        <ModuleOutlineDrawer
          open={outlineOpen}
          onClose={() => setOutlineOpen(false)}
          sequence={adj.sequence}
          currentItemId={item.id}
          courseTitle={adj.course?.title}
        />
      )}


      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        action={
          <IconButton size="small" color="inherit" onClick={() => setSnackbarOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </AppLayout>
  );
}
