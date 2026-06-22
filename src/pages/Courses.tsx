import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Skeleton,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useContent } from '@/contexts/ContentContext';
import { getEnrolledCourses, getAllTagsForCourses, searchItemsInCourses } from '@/lib/content';
import { useEnrolledCourseIds } from '@/hooks/useEnrollments';
import { AppLayout } from '@/components/AppLayout';
import { RecentItemCard } from '@/components/RecentItemCard';
import type { ItemType } from '@/types/content';

const itemTypes: { value: ItemType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'pdf', label: 'PDF' },
  { value: 'video', label: 'Video' },
  { value: 'doc', label: 'Document' },
  { value: 'ppt', label: 'Slides' },
  { value: 'spreadsheet', label: 'Spreadsheet' },
  { value: 'homework', label: 'Homework' },
  { value: 'quiz', label: 'Quiz' },
];

export default function CoursesPage() {
  const { session } = useAuth();
  const { content, isLoading, error } = useContent();
  const { courseIds, loading: enrollLoading, isAdmin } = useEnrolledCourseIds();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ItemType | ''>('');
  const [tagFilter, setTagFilter] = useState('');

  if (isLoading || enrollLoading) {
    return (
      <AppLayout>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={240} sx={{ borderRadius: 3 }} />
          ))}
        </Box>
      </AppLayout>
    );
  }
  if (error || !content || !session) {
    return (
      <AppLayout>
        <Alert severity="error">Failed to load courses.</Alert>
      </AppLayout>
    );
  }

  const visibleIds = isAdmin ? Object.keys(content.courses) : courseIds;
  const courses = isAdmin ? Object.values(content.courses) : getEnrolledCourses(content, courseIds);
  const allTags = getAllTagsForCourses(content, visibleIds);

  const hasFilters = !!(searchQuery || typeFilter || tagFilter);
  const searchResults = hasFilters
    ? searchItemsInCourses(content, visibleIds, searchQuery, {
        type: typeFilter || undefined,
        tag: tagFilter || undefined,
      })
    : [];

  return (
    <AppLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Courses
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse your courses and learning materials
        </Typography>
      </Box>

      <Card sx={{ mb: 4, p: 2, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search courses, modules, or resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            size="small"
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value as ItemType | '')}
            >
              {itemTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Tag</InputLabel>
            <Select value={tagFilter} label="Tag" onChange={(e) => setTagFilter(e.target.value)}>
              <MenuItem value="">All Tags</MenuItem>
              {allTags.map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {tag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {hasFilters && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <FilterIcon color="action" />
            <Typography variant="h6" fontWeight={700}>
              Results ({searchResults.length})
            </Typography>
            {typeFilter && (
              <Chip
                label={itemTypes.find((t) => t.value === typeFilter)?.label}
                size="small"
                onDelete={() => setTypeFilter('')}
              />
            )}
            {tagFilter && <Chip label={tagFilter} size="small" onDelete={() => setTagFilter('')} />}
          </Box>
          {searchResults.length === 0 ? (
            <Alert severity="info">No results. Try different search terms or filters.</Alert>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
              {searchResults.map((item) => (
                <RecentItemCard key={item.id} item={item} />
              ))}
            </Box>
          )}
        </Box>
      )}

      {!hasFilters && (
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2.5 }}>
            {isAdmin ? 'All courses' : 'Enrolled courses'}
          </Typography>
          {courses.length === 0 ? (
            <Alert severity="info">
              You aren&apos;t enrolled in any courses yet. Please contact your instructor.
            </Alert>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {courses.map((course) => (
                <Card
                  key={course.id}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    transition: 'transform 220ms ease, box-shadow 220ms ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 'var(--shadow-elegant)' },
                  }}
                >
                  <CardActionArea
                    component={Link}
                    to={`/courses/${course.id}`}
                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <CardMedia
                      component="img"
                      height="160"
                      image={course.thumbnail}
                      alt={course.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
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
                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {course.instructor}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <TimeIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {course.duration}
                          </Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}
    </AppLayout>
  );
}
