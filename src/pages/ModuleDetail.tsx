import React, { useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  Paper,
  CircularProgress,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
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
} from '@mui/icons-material';
import { useContent } from '@/contexts/ContentContext';
import { getModule, getCourse, getModuleItems } from '@/lib/content';
import { getAdjacentModules, getVisitedItems, getLastVisitedItem } from '@/lib/contentNavigation';
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
  youtube: <YouTubeIcon />,
  audio: <AudioIcon />,
  quiz: <QuizIcon />,
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
};

export default function ModuleDetailPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { content, isLoading, error } = useContent();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromItem = searchParams.get('from');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const highlightRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    if (fromItem && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [fromItem, moduleId]);

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
  const { prev: prevModule, next: nextModule } = getAdjacentModules(content, moduleId);

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
          <Chip label={`Module ${module.order}`} color="primary" size="small" />
          <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700}>
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
            {items.map((item, index) => {
              const isFrom = fromItem === item.id;
              return (
                <ListItem
                  key={item.id}
                  disablePadding
                  divider={index < items.length - 1}
                  ref={isFrom ? highlightRef : undefined}
                  sx={isFrom ? { bgcolor: 'action.selected' } : undefined}
                >
                  <ListItemButton
                    component={Link}
                    to={`/view/${item.id}`}
                    sx={{ py: 2, px: { xs: 2, sm: 3 }, alignItems: 'flex-start' }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 48,
                        color: typeColors[item.type],
                        mt: 0.5,
                      }}
                    >
                      {typeIcons[item.type]}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      secondary={item.description}
                      primaryTypographyProps={{ fontWeight: 600 }}
                      secondaryTypographyProps={{
                        sx: {
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        },
                      }}
                    />
                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, ml: 1, flexShrink: 0 }}>
                      {item.tags.slice(0, 2).map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </CardContent>
      </Card>

      {/* Module navigation */}
      <Paper variant="outlined" sx={{ mt: 3, p: 1.5, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<NavigateBeforeIcon />}
            disabled={!prevModule}
            component={prevModule ? Link : 'button'}
            to={prevModule ? `/modules/${prevModule.id}` : undefined}
            sx={{ flex: 1, justifyContent: 'flex-start', textTransform: 'none', minWidth: 0 }}
          >
            <Box sx={{ minWidth: 0, textAlign: 'left' }}>
              <Typography variant="caption" sx={{ display: 'block', opacity: 0.7, lineHeight: 1 }}>
                Previous module
              </Typography>
              <Typography variant="body2" fontWeight={600} noWrap>
                {prevModule ? prevModule.title : '—'}
              </Typography>
            </Box>
          </Button>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            disabled={!nextModule}
            component={nextModule ? Link : 'button'}
            to={nextModule ? `/modules/${nextModule.id}` : undefined}
            sx={{ flex: 1, justifyContent: 'flex-end', textTransform: 'none', minWidth: 0 }}
          >
            <Box sx={{ minWidth: 0, textAlign: 'right' }}>
              <Typography variant="caption" sx={{ display: 'block', opacity: 0.85, lineHeight: 1 }}>
                Next module
              </Typography>
              <Typography variant="body2" fontWeight={600} noWrap>
                {nextModule ? nextModule.title : 'End'}
              </Typography>
            </Box>
          </Button>
        </Box>
      </Paper>
    </AppLayout>
  );
}
