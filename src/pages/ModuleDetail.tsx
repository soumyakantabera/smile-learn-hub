import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Alert,
  Skeleton,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  PictureAsPdf as PdfIcon,
  VideoLibrary as VideoIcon,
  Description as DocIcon,
  Slideshow as PptIcon,
  TableChart as SpreadsheetIcon,
  Link as LinkIcon,
  Assignment as HomeworkIcon,
} from '@mui/icons-material';
import { useContent } from '@/contexts/ContentContext';
import { getModule, getCourse, getModuleItems } from '@/lib/content';
import { AppLayout } from '@/components/AppLayout';
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

export default function ModuleDetailPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { content, isLoading, error } = useContent();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <AppLayout>
        <Skeleton variant="text" width={300} height={40} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3, mt: 3 }} />
      </AppLayout>
    );
  }

  if (error || !content || !moduleId) {
    return (
      <AppLayout>
        <Alert severity="error">Failed to load module details.</Alert>
      </AppLayout>
    );
  }

  const module = getModule(content, moduleId);
  if (!module) {
    return (
      <AppLayout>
        <Alert severity="warning">Module not found.</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/courses')} sx={{ mt: 2 }}>
          Back to Courses
        </Button>
      </AppLayout>
    );
  }

  const course = getCourse(content, module.courseId);
  const items = getModuleItems(content, moduleId);

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
        <Typography color="text.primary" fontWeight={500}>
          {module.title}
        </Typography>
      </Breadcrumbs>

      {/* Module Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Chip label={`Module ${module.order}`} color="primary" size="small" />
          <Typography variant="h4" fontWeight={700}>
            {module.title}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {module.description}
        </Typography>
      </Box>

      {/* Items List */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <List disablePadding>
            {items.map((item, index) => (
              <ListItem key={item.id} disablePadding divider={index < items.length - 1}>
                <ListItemButton
                  component={Link}
                  to={`/view/${item.id}`}
                  sx={{ py: 2, px: 3 }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 48,
                      color: typeColors[item.type],
                    }}
                  >
                    {typeIcons[item.type]}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    secondary={item.description}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {item.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
