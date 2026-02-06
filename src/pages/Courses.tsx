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
} from '@mui/material';
import {
  Search as SearchIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useContent } from '@/contexts/ContentContext';
import { getBatchCourses, getAllTags, searchItems } from '@/lib/content';
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
];

export default function CoursesPage() {
  const { session } = useAuth();
  const { content, isLoading, error } = useContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ItemType | ''>('');
  const [tagFilter, setTagFilter] = useState('');

  if (isLoading) {
    return (
      <AppLayout>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={200} height={40} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
          ))}
        </Box>
      </AppLayout>
    );
  }

  if (error || !content || !session) {
    return (
      <AppLayout>
        <Alert severity="error">Failed to load courses. Please try again.</Alert>
      </AppLayout>
    );
  }

  const courses = getBatchCourses(content, session.batchKey);
  const allTags = getAllTags(content, session.batchKey);
  
  // Search and filter
  const hasFilters = searchQuery || typeFilter || tagFilter;
  const searchResults = hasFilters
    ? searchItems(content, session.batchKey, searchQuery, {
        type: typeFilter || undefined,
        tag: tagFilter || undefined,
      })
    : [];

  return (
    <AppLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Courses
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse all your courses and learning materials
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 4, p: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Box sx={{ flex: '2 1 300px' }}>
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
          </Box>
          <Box sx={{ flex: '1 1 150px' }}>
            <FormControl fullWidth size="small">
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
          </Box>
          <Box sx={{ flex: '1 1 150px' }}>
            <FormControl fullWidth size="small">
              <InputLabel>Tag</InputLabel>
              <Select
                value={tagFilter}
                label="Tag"
                onChange={(e) => setTagFilter(e.target.value)}
              >
                <MenuItem value="">All Tags</MenuItem>
                {allTags.map((tag) => (
                  <MenuItem key={tag} value={tag}>
                    {tag}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Card>

      {/* Search Results */}
      {hasFilters && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterIcon color="action" />
            <Typography variant="h6">
              Search Results ({searchResults.length})
            </Typography>
            {(typeFilter || tagFilter) && (
              <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                {typeFilter && (
                  <Chip
                    label={itemTypes.find((t) => t.value === typeFilter)?.label}
                    size="small"
                    onDelete={() => setTypeFilter('')}
                  />
                )}
                {tagFilter && (
                  <Chip
                    label={tagFilter}
                    size="small"
                    onDelete={() => setTagFilter('')}
                  />
                )}
              </Box>
            )}
          </Box>
          {searchResults.length === 0 ? (
            <Alert severity="info">No results found. Try different search terms or filters.</Alert>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
              {searchResults.map((item) => (
                <RecentItemCard key={item.id} item={item} />
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Courses Grid */}
      {!hasFilters && (
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
            All Courses
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
                    height="160"
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
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>
      )}
    </AppLayout>
  );
}
