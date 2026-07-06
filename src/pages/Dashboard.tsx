import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Typography,
  Skeleton,
  Alert,
  Chip,
  LinearProgress,
  Stack,
  Button,
  Paper,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Person as PersonIcon,
  MenuBook as ModuleIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  AutoAwesome as AutoAwesomeIcon,
  WhatsApp as WhatsAppIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useContent } from '@/contexts/ContentContext';
import { getEnrolledCourses, getRecentItemsForCourses, getCourseModules } from '@/lib/content';
import { AppLayout } from '@/components/AppLayout';
import { RecentItemCard } from '@/components/RecentItemCard';
import { useEnrolledCourseIds } from '@/hooks/useEnrollments';
import { useProgress } from '@/hooks/useProgress';
import { buildCourseSequence } from '@/lib/contentNavigation';
import { appConfig } from '@/config/app.config';

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export default function DashboardPage() {
  const { session } = useAuth();
  const { content, isLoading, error } = useContent();
  const { courseIds, loading: enrollLoading, isAdmin } = useEnrolledCourseIds();
  const progress = useProgress();

  if (isLoading || enrollLoading) {
    return (
      <AppLayout>
        <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 4, mb: 3 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={240} sx={{ borderRadius: 4 }} />
          ))}
        </Box>
      </AppLayout>
    );
  }
  if (error || !content || !session) {
    return (
      <AppLayout>
        <Alert severity="error">Failed to load dashboard. Please try again.</Alert>
      </AppLayout>
    );
  }

  // Admin sees all courses
  const visibleIds = isAdmin ? Object.keys(content.courses) : courseIds;
  const courses = isAdmin
    ? Object.values(content.courses)
    : getEnrolledCourses(content, courseIds);
  const recent = getRecentItemsForCourses(content, visibleIds, 6);
  const totalSeconds = visibleIds.reduce((sum, cid) => sum + progress.timeSpentSeconds(cid), 0);
  const totalVisited = visibleIds.reduce((sum, cid) => sum + progress.visitedCount(cid), 0);

  const waUrl = `https://wa.me/${appConfig.support.whatsappNumber}?text=${encodeURIComponent(
    `Hi! I need help with ${appConfig.appName}.`,
  )}`;

  return (
    <AppLayout>
      {/* Hero greeting */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: { xs: 2.5, sm: 4 },
          borderRadius: 4,
          background: 'var(--gradient-hero)',
          border: '1px solid',
          borderColor: 'var(--hairline)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Amber ring accent */}
        <Box
          sx={{
            position: 'absolute',
            right: -80,
            top: -80,
            width: 260,
            height: 260,
            borderRadius: '50%',
            border: '1px solid hsl(42 91% 55% / 0.4)',
            background: 'radial-gradient(circle at 30% 70%, hsl(42 91% 55% / 0.25), transparent 65%)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            right: -30,
            top: -30,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'radial-gradient(circle, hsl(140 40% 84% / 0.5), transparent 70%)',
          }}
        />
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          spacing={2.5}
          sx={{ position: 'relative' }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Chip
              icon={<AutoAwesomeIcon />}
              label={isAdmin ? 'Admin overview' : 'Your learning hub'}
              size="small"
              sx={{
                mb: 1.5,
                fontWeight: 700,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'var(--hairline)',
                '& .MuiChip-icon': { color: '#F5B921' },
              }}
            />
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ mb: 0.75, letterSpacing: '-0.02em', lineHeight: 1.1 }}
            >
              Hi {session.fullName?.split(' ')[0] || session.email.split('@')[0]}{' '}
              <Box component="span" sx={{ display: 'inline-block', transform: 'rotate(8deg)' }}>
                👋
              </Box>
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520 }}>
              {isAdmin
                ? 'You have admin access to manage courses, users and enrollments.'
                : `You're enrolled in ${courses.length} course${courses.length === 1 ? '' : 's'}. Keep going — small steps, every day.`}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flexShrink: 0, flexWrap: 'wrap' }}>
            <Paper
              elevation={0}
              sx={{
                px: 2,
                py: 1.25,
                borderRadius: 2.5,
                minWidth: 118,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'var(--hairline)',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 10, fontWeight: 700 }}>
                Items viewed
              </Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: 'primary.main' }}>{totalVisited}</Typography>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                px: 2,
                py: 1.25,
                borderRadius: 2.5,
                minWidth: 118,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'var(--hairline)',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 10, fontWeight: 700 }}>
                Time learned
              </Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: '#F5B921' }}>{formatDuration(totalSeconds)}</Typography>
            </Paper>
            <Button
              href={waUrl}
              target="_blank"
              rel="noopener"
              variant="contained"
              startIcon={<WhatsAppIcon />}
              sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#1ebe5d' }, display: { xs: 'none', md: 'inline-flex' } }}
            >
              Support
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Courses */}
      <Box sx={{ mb: 5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
          <Typography variant="h5" fontWeight={700}>
            Your courses
          </Typography>
          {courses.length > 0 && (
            <Chip
              size="small"
              icon={<TrendingUpIcon />}
              label={`${courses.length} active`}
              sx={{ fontWeight: 700 }}
            />
          )}
        </Stack>

        {courses.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
            <SchoolIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
            <Typography variant="h6" fontWeight={700} gutterBottom>
              No courses yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Your instructor hasn&apos;t enrolled you in any courses. Reach out for access.
            </Typography>
            <Button
              variant="contained"
              startIcon={<WhatsAppIcon />}
              href={waUrl}
              target="_blank"
              sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#1ebe5d' } }}
            >
              Request access on WhatsApp
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
            {courses.map((course) => {
              const sequence = buildCourseSequence(content, course.id);
              const visited = progress.visitedCount(course.id);
              const pct = sequence.length ? Math.round((visited / sequence.length) * 100) : 0;
              const resume = progress.resumeForCourse(course.id);
              const target = resume?.last_item_id || sequence[0]?.item.id;
              return (
                <Card
                  key={course.id}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'transform 220ms ease, box-shadow 220ms ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 'var(--shadow-elegant)' },
                  }}
                >
                  <CardActionArea
                    component={Link}
                    to={target ? `/view/${target}` : `/courses/${course.id}`}
                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={course.thumbnail}
                        alt={course.title}
                        sx={{ objectFit: 'cover' }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(180deg, rgba(15,23,42,0) 40%, rgba(15,23,42,0.55) 100%)',
                        }}
                      />
                      <Chip
                        size="small"
                        label={`${pct}%`}
                        icon={<PlayIcon />}
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          fontWeight: 800,
                          bgcolor: 'background.paper',
                        }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, p: 2.25 }}>
                      <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }} gutterBottom>
                        {course.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {course.description}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          mb: 1.5,
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': {
                            background: 'var(--gradient-primary)',
                          },
                        }}
                      />
                      <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <PersonIcon fontSize="inherit" sx={{ color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {course.instructor}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <TimeIcon fontSize="inherit" sx={{ color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {course.duration}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <ModuleIcon fontSize="inherit" sx={{ color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {getCourseModules(content, course.id).length} modules
                          </Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>

      {recent.length > 0 && (
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2.5 }}>
            Recently added
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {recent.map((item) => (
              <RecentItemCard key={item.id} item={item} />
            ))}
          </Box>
        </Box>
      )}
    </AppLayout>
  );
}
