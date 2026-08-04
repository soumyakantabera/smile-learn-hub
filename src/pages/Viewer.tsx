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
  Stack,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { gradientPrimaryBtnSx } from '@/theme/sxPresets';
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
import { itemIcons as typeIcons, itemColors as typeColors, itemLabels as typeLabels } from '@/lib/itemVisuals';
import { resolveEmbed } from '@/lib/embed';
import { EmbedFrame, EmbedFallback } from '@/components/viewer/EmbedFrame';



// LWS palette: forest, amber, coral, mint — mirrors RecentItemCard
/**
 * Consistent shell used by every non-embedded resource type so PDF, video,
 * audio, docs, links and homework share the same header + spacing rhythm.
 */
const ResourceShell: React.FC<{
  accent: string;
  icon: React.ReactNode;
  label: string;
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}> = ({ accent, icon, label, title, actions, children }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'var(--hairline)',
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
      background: 'var(--gradient-card)',
    }}
  >
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        py: 1.75,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderBottom: '1px solid',
        borderColor: 'var(--hairline)',
        background: `linear-gradient(90deg, ${alpha(accent, 0.10)}, transparent 70%)`,
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(accent, 0.14),
          color: accent,
          '& svg': { fontSize: 20 },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            fontFamily: '"Sora", "Manrope", sans-serif',
            fontWeight: 700,
            fontSize: '0.95rem',
            lineHeight: 1.2,
            color: 'text.primary',
          }}
          noWrap
        >
          {title || label}
        </Typography>
        {title && (
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            {label}
          </Typography>
        )}
      </Box>
      {actions && <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>{actions}</Box>}
    </Box>
    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>{children}</CardContent>
  </Card>
);


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
    const accent = typeColors[item.type];
    const icon = typeIcons[item.type];
    const label = typeLabels[item.type];

    /** Normalised, iframe-safe URL for this item (YouTube, Drive, Docs, PDF…) */
    const embed = resolveEmbed(item.type, item.url, item.embedUrl);

    /** Hardened frame + graceful fallback for every embeddable resource. */
    const frame = (opts?: { height?: string | number; emptyMessage?: string }) => (
      <EmbedFrame
        embed={embed}
        title={item.title}
        accent={accent}
        icon={icon}
        fallbackUrl={item.url}
        height={opts?.height}
        emptyMessage={opts?.emptyMessage ?? 'This resource can’t be previewed here.'}
      />
    );

    /** Empty / broken-link state so learners never see a blank frame. */
    const embedFallback = (message: string) => (
      <EmbedFallback accent={accent} icon={icon} message={message} hint={embed.note} openUrl={embed.openUrl || item.url} />
    );



    switch (item.type) {
      case 'video':
        // A "video" item may be a direct MP4 or a Drive/YouTube link pasted by
        // the author — embed whichever it actually is.
        return (
          <ResourceShell accent={accent} icon={icon} label={label}>
            {embed.provider === 'direct' || !embed.url ? (
              <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: 'black', borderRadius: 2, overflow: 'hidden' }}>
                <video
                  controls
                  playsInline
                  preload="metadata"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  src={item.url}
                >
                  Your browser does not support the video tag.
                </video>
              </Box>
            ) : (
              frame()

            )}
          </ResourceShell>
        );

      case 'youtube':
        return (
          <ResourceShell
            accent={accent}
            icon={icon}
            label={label}
            actions={
              embed.openUrl ? (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<OpenInNewIcon />}
                  href={embed.openUrl}
                  target="_blank"
                  rel="noopener noreferrer"

                  sx={{ borderColor: alpha(accent, 0.4), color: accent, '&:hover': { borderColor: accent, bgcolor: alpha(accent, 0.06) } }}
                >
                  Watch on source
                </Button>
              ) : undefined
            }
          >
            {frame({ emptyMessage: 'This video link could not be embedded.' })}

          </ResourceShell>
        );


      case 'audio':
        return (
          <ResourceShell accent={accent} icon={icon} label={label}>
            <Stack alignItems="center" spacing={2} sx={{ py: 2 }}>
              <Box
                sx={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  bgcolor: alpha(accent, 0.12),
                  color: accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${alpha(accent, 0.25)}`,
                  '& svg': { fontSize: 40 },
                }}
              >
                {typeIcons.audio}
              </Box>
              <Typography
                sx={{ fontFamily: '"Sora", "Manrope", sans-serif', fontWeight: 700, fontSize: '1.1rem' }}
              >
                {item.title}
              </Typography>
              {item.audioDuration && (
                <Typography variant="body2" color="text.secondary">
                  Duration: {item.audioDuration}
                </Typography>
              )}
              <Box sx={{ width: '100%', maxWidth: 520 }}>
                <audio controls style={{ width: '100%' }} src={item.url}>
                  Your browser does not support the audio element.
                </audio>
              </Box>
            </Stack>
          </ResourceShell>
        );

      case 'quiz':
        return item.quizMode === 'step' ? <StepQuizViewer item={item} /> : <QuizViewer item={item} />;

      case 'conversation':
        return <ConversationViewer item={item} />;

      case 'pdf':
        return (
          <ResourceShell
            accent={accent}
            icon={icon}
            label={label}
            actions={
              <Button
                size="small"
                variant="outlined"
                startIcon={<OpenInNewIcon />}
                href={embed.openUrl || item.url}
                target="_blank"
                sx={{ borderColor: alpha(accent, 0.4), color: accent, '&:hover': { borderColor: accent, bgcolor: alpha(accent, 0.06) } }}
              >
                Open
              </Button>
            }
          >
            {embed.url ? (
              <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'var(--hairline)', boxShadow: 'var(--shadow-md)' }}>
                <iframe
                  src={embed.url}
                  style={{ width: '100%', height: 'min(78vh, 720px)', border: 'none', display: 'block' }}
                  title={item.title}
                  loading="lazy"
                  allow="autoplay"
                />
              </Box>
            ) : (
              embedFallback('No document link set for this resource yet.')
            )}
          </ResourceShell>
        );

      case 'doc':
      case 'ppt':
      case 'spreadsheet':
        return (
          <ResourceShell accent={accent} icon={icon} label={label} title="Document Preview">
            <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mb: 2.5, rowGap: 1.5 }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                href={embed.openUrl || item.url}
                target="_blank"
                sx={gradientPrimaryBtnSx}
              >
                Open original
              </Button>
              <Button
                variant="outlined"
                startIcon={<OpenInNewIcon />}
                href={getGoogleDocsViewerUrl(item.url!)}
                target="_blank"
              >
                Google viewer
              </Button>
              <Button
                variant="outlined"
                startIcon={<OpenInNewIcon />}
                href={getMicrosoftViewerUrl(item.url!)}
                target="_blank"
              >
                Office viewer
              </Button>
            </Stack>
            {embed.url ? (
              <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'var(--hairline)', boxShadow: 'var(--shadow-md)' }}>
                <iframe
                  src={embed.url}
                  style={{ width: '100%', height: 'min(70vh, 640px)', border: 'none', display: 'block' }}
                  title={item.title}
                  loading="lazy"
                />
              </Box>
            ) : (
              embedFallback('No document link set for this resource yet.')
            )}
          </ResourceShell>
        );


      case 'link':
        return (
          <ResourceShell accent={accent} icon={icon} label={label} title="External Resource">
            <Stack alignItems="center" spacing={2} sx={{ py: 3, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: 3,
                  bgcolor: alpha(accent, 0.12),
                  color: accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '& svg': { fontSize: 34 },
                }}
              >
                <LinkIcon />
              </Box>
              <Typography variant="body2" color="text.secondary">
                This link will open in a new tab.
              </Typography>
              <Button
                variant="contained"
                startIcon={<OpenInNewIcon />}
                href={item.url}
                target="_blank"
                size="large"
                sx={gradientPrimaryBtnSx}
              >
                Open Link
              </Button>
            </Stack>
          </ResourceShell>
        );

      case 'homework':
        return (
          <Stack spacing={2.5}>
            <ResourceShell accent={accent} icon={icon} label={label} title="Assignment Instructions">
              {item.dueDate && (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <EventIcon sx={{ color: accent }} fontSize="small" />
                  <Typography variant="body2" sx={{ color: accent, fontWeight: 600 }}>
                    Due: {new Date(item.dueDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                </Stack>
              )}
              <Box
                sx={{
                  bgcolor: 'var(--surface-3)',
                  p: 2.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'var(--hairline)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                  {item.instructions?.replace(/\\n/g, '\n')}
                </Typography>
              </Box>
            </ResourceShell>

            <ResourceShell accent={accent} icon={<HomeworkIcon />} label="Submission" title="Submit Your Work">
              <TextField
                fullWidth
                label="Your Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your name"
                sx={{ mb: 2 }}
              />
              <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ rowGap: 1.5 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<WhatsAppIcon />}
                  onClick={handleWhatsApp}
                >
                  WhatsApp
                </Button>
                <Button
                  variant="contained"
                  startIcon={<EmailIcon />}
                  onClick={handleEmail}
                  sx={gradientPrimaryBtnSx}
                >
                  Email
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CopyIcon />}
                  onClick={handleCopyMessage}
                >
                  Copy Message
                </Button>
              </Stack>
            </ResourceShell>
          </Stack>
        );

      default:
        return (
          <Alert severity="info">
            This content type is not supported for inline viewing.
            {item.url && (
              <Button href={item.url} target="_blank" sx={{ ml: 2 }}>
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
