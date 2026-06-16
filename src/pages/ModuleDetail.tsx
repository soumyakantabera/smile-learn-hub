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
    if (highlightRef.current) {
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
  const visited = course ? getVisitedItems(course.id) : new Set<string>();
  const lastItem = course ? getLastVisitedItem(course.id) : null;
  const visitedInModule = items.filter((i) => visited.has(i.id)).length;
  const modulePct = items.length > 0 ? Math.round((visitedInModule / items.length) * 100) : 0;

  return (
    <AppLayout>
      <PageHeader
        icon={<FolderOpenIcon />}
        title={module.title}
        subtitle={module.description}
        crumbs={[
          { label: 'Courses', to: '/courses', icon: <SchoolIcon /> },
          ...(course
            ? [{ label: course.title, to: `/courses/${course.id}`, icon: <MenuBookIcon /> }]
            : []),
          { label: module.title, icon: <FolderOpenIcon /> },
        ]}
        meta={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={`Module ${module.order}`} color="primary" size="small" icon={<NumbersIcon />} />
            <Chip
              size="small"
              variant="outlined"
              icon={<TaskAltIcon />}
              label={`${visitedInModule}/${items.length} viewed · ${modulePct}%`}
            />
          </Box>
        }
      />


      {/* Module Header with donut progress */}
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, mb: 3, borderRadius: 3, display: 'flex', gap: 2.5, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
          <CircularProgress variant="determinate" value={100} size={72} thickness={4} sx={{ color: 'action.hover' }} />
          <CircularProgress
            variant="determinate"
            value={modulePct}
            size={72}
            thickness={4}
            sx={{ color: 'primary.main', position: 'absolute', left: 0 }}
          />
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="caption" fontWeight={700}>{modulePct}%</Typography>
          </Box>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
            <Chip label={`Module ${module.order}`} color="primary" size="small" />
            <Typography variant="caption" color="text.secondary">
              {visitedInModule}/{items.length} items viewed
            </Typography>
          </Box>
          <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700}>
            {module.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {module.description}
          </Typography>
        </Box>
      </Paper>

      {/* Items List */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <List disablePadding>
            {items.map((item, index) => {
              const isFrom = fromItem === item.id || (!fromItem && lastItem === item.id);
              const isVisited = visited.has(item.id);
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
                    <Box sx={{ display: 'flex', gap: 1, ml: 1, flexShrink: 0, alignItems: 'center' }}>
                      {isVisited && (
                        <Chip label="Viewed" size="small" color="success" variant="outlined" />
                      )}
                      <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                        {item.tags.slice(0, 2).map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
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
