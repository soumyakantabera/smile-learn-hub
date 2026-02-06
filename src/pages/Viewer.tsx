import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { useContent } from '@/contexts/ContentContext';
import { useAuth } from '@/contexts/AuthContext';
import { getItem, getModule, getCourse } from '@/lib/content';
import { AppLayout } from '@/components/AppLayout';
import { appConfig } from '@/config/app.config';
import type { ItemType } from '@/types/content';

const typeIcons: Record<ItemType, React.ReactNode> = {
  pdf: <PdfIcon />,
  video: <VideoIcon />,
  doc: <DocIcon />,
  ppt: <PptIcon />,
  spreadsheet: <SpreadsheetIcon />,
  link: <LinkIcon />,
  homework: <HomeworkIcon />,
};

const typeColors: Record<ItemType, string> = {
  pdf: '#D32F2F',
  video: '#1976D2',
  doc: '#2196F3',
  ppt: '#FF5722',
  spreadsheet: '#4CAF50',
  link: '#9C27B0',
  homework: '#FF9800',
};

const typeLabels: Record<ItemType, string> = {
  pdf: 'PDF Document',
  video: 'Video',
  doc: 'Word Document',
  ppt: 'Presentation',
  spreadsheet: 'Spreadsheet',
  link: 'External Link',
  homework: 'Homework',
};

export default function ViewerPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const { content, isLoading, error } = useContent();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

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
      `Batch: ${session?.batchLabel || 'Unknown'}`,
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
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link to="/courses" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography color="text.secondary" sx={{ '&:hover': { textDecoration: 'underline' } }}>
            Courses
          </Typography>
        </Link>
        {course && (
          <Link to={`/courses/${course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography color="text.secondary" sx={{ '&:hover': { textDecoration: 'underline' } }}>
              {course.title}
            </Typography>
          </Link>
        )}
        {module && (
          <Typography color="text.secondary">
            {module.title}
          </Typography>
        )}
        <Typography color="text.primary" fontWeight={500}>
          {item.title}
        </Typography>
      </Breadcrumbs>

      {/* Item Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: `${typeColors[item.type]}15`,
              color: typeColors[item.type],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {typeIcons[item.type]}
          </Box>
          <Typography variant="h4" fontWeight={700}>
            {item.title}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {item.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={typeLabels[item.type]}
            size="small"
            sx={{
              bgcolor: `${typeColors[item.type]}15`,
              color: typeColors[item.type],
              fontWeight: 500,
            }}
          />
          {item.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>
      </Box>

      {/* Content Viewer */}
      {renderViewer()}

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
