import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Breadcrumbs,
  Alert,
  Skeleton,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
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
import { getCourse, getCourseModules, getModuleItems } from '@/lib/content';
import {
  buildCourseSequence,
  getLastVisitedItem,
  getLastVisitedModule,
  getVisitedItems,
  clearCourseProgress,
} from '@/lib/contentNavigation';
import { AppLayout } from '@/components/AppLayout';
import { ResumeCard } from '@/components/viewer/ResumeCard';
import type { ItemType } from '@/types/content';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';

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

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { content, isLoading, error } = useContent();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <AppLayout>
        <Skeleton variant="text" width={300} height={40} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, my: 3 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
      </AppLayout>
    );
  }

  if (error || !content || !courseId) {
    return (
      <AppLayout>
        <Alert severity="error">Failed to load course details.</Alert>
      </AppLayout>
    );
  }

  const course = getCourse(content, courseId);
  if (!course) {
    return (
      <AppLayout>
        <Alert severity="warning">Course not found.</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/courses')} sx={{ mt: 2 }}>
          Back to Courses
        </Button>
      </AppLayout>
    );
  }

  const modules = getCourseModules(content, courseId);
  const sequence = buildCourseSequence(content, courseId);
  const lastVisited = getLastVisitedItem(courseId);
  const lastModule = getLastVisitedModule(courseId);
  const visited = getVisitedItems(courseId);
  const hasResume = !!lastVisited && !!content.items[lastVisited];
  const resumeEntry =
    sequence.find((s) => s.item.id === lastVisited) ||
    (lastModule ? sequence.find((s) => s.module.id === lastModule) : undefined) ||
    sequence[0] ||
    null;
  const firstItemId = sequence[0]?.item.id;

  return (
    <AppLayout>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link to="/courses" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography color="text.secondary" sx={{ '&:hover': { textDecoration: 'underline' } }}>
            Courses
          </Typography>
        </Link>
        <Typography color="text.primary" fontWeight={500}>
          {course.title}
        </Typography>
      </Breadcrumbs>

      {/* Course Header */}
      <Card sx={{ mb: 4, overflow: 'hidden' }}>
        <Box sx={{ position: 'relative' }}>
          <Box
            component="img"
            src={course.thumbnail}
            alt={course.title}
            sx={{
              width: '100%',
              height: 200,
              objectFit: 'cover',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              p: 3,
            }}
          >
            <Typography variant="h4" fontWeight={700} color="white">
              {course.title}
            </Typography>
          </Box>
        </Box>
        <CardContent>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {course.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="action" />
              <Typography variant="body2">{course.instructor}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimeIcon color="action" />
              <Typography variant="body2">{course.duration}</Typography>
            </Box>
            <Chip label={`${modules.length} Modules`} size="small" color="primary" variant="outlined" />
            <Chip label={`${sequence.length} Items`} size="small" variant="outlined" />
          </Box>
          <ResumeCard
            resumeEntry={resumeEntry}
            firstItemId={firstItemId}
            sequenceLength={sequence.length}
            visitedCount={visited.size}
            hasResume={hasResume}
            onRestart={() => clearCourseProgress(courseId)}
          />
        </CardContent>
      </Card>

      {/* Modules */}
      <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
        Course Modules
      </Typography>
      {modules.map((module, index) => {
        const items = getModuleItems(content, module.id);
        return (
          <Accordion
            key={module.id}
            defaultExpanded={index === 0}
            sx={{
              mb: 2,
              '&:before': { display: 'none' },
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  label={`Module ${module.order}`}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
                <Box>
                  <Typography fontWeight={600}>{module.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {module.description} • {items.length} items
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <List disablePadding>
                {items.map((item) => (
                  <ListItem key={item.id} disablePadding divider>
                    <ListItemButton
                      component={Link}
                      to={`/view/${item.id}`}
                      sx={{ py: 1.5, px: 3 }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: typeColors[item.type],
                        }}
                      >
                        {typeIcons[item.type]}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        secondary={item.description}
                        primaryTypographyProps={{ fontWeight: 500 }}
                        secondaryTypographyProps={{
                          sx: {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {item.tags.slice(0, 2).map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </AppLayout>
  );
}
