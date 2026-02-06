import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Typography,
  Chip,
  Skeleton,
  Alert,
  Grid,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Person as PersonIcon,
  MenuBook as ModuleIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useContent } from '@/contexts/ContentContext';
import { getBatchCourses, getRecentItems, getBatch } from '@/lib/content';
import { RecentItemCard } from '@/components/RecentItemCard';
import { AppLayout } from '@/components/AppLayout';

export default function DashboardPage() {
  const { session } = useAuth();
  const { content, isLoading, error } = useContent();

  if (isLoading) {
    return (
      <AppLayout>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="text" width={200} height={24} />
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ flex: '1 1 300px', maxWidth: 400 }}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
            </Box>
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

  const batch = getBatch(content, session.batchKey);
  const courses = getBatchCourses(content, session.batchKey);
  const recentItems = getRecentItems(content, session.batchKey, 5);

  return (
    <AppLayout>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome back! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {batch?.name} • {batch?.description}
        </Typography>
      </Box>

      {/* Courses Section */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
          Your Courses
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {courses.map((course) => (
            <Card
              key={course.id}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardActionArea
                component={Link}
                to={`/courses/${course.id}`}
                sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={course.thumbnail}
                  alt={course.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {course.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {course.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {course.instructor}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TimeIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {course.duration}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ModuleIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {course.modules.length} modules
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Recent Items Section */}
      {recentItems.length > 0 && (
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
            Recently Added
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {recentItems.map((item) => (
              <RecentItemCard key={item.id} item={item} />
            ))}
          </Box>
        </Box>
      )}
    </AppLayout>
  );
}
