import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Search as SearchIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useEditor } from '@/contexts/EditorContext';
import type { Course, CourseStatus } from '@/types/content';
import { ConfirmDialog } from './ConfirmDialog';
import { EmptyState } from './EmptyState';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
const CATEGORIES = ['Communication', 'Business', 'Academic', 'Exam Prep', 'Vocabulary', 'Grammar'];
const STATUSES: CourseStatus[] = ['draft', 'published', 'archived'];

interface CourseFormData {
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  duration: string;
  category: string;
  level: typeof LEVELS[number];
  status: CourseStatus;
}

const defaultFormData: CourseFormData = {
  title: '',
  description: '',
  thumbnail: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800',
  instructor: '',
  duration: '',
  category: 'Communication',
  level: 'Beginner',
  status: 'draft',
};

const statusColor: Record<CourseStatus, 'default' | 'success' | 'warning'> = {
  draft: 'warning',
  published: 'success',
  archived: 'default',
};

export function CourseEditor() {
  const { content, createCourse, editCourse, removeCourse, duplicateCourse } = useEditor();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>(defaultFormData);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CourseStatus | ''>('');

  if (!content) return null;

  const allCourses = Object.values(content.courses);
  const batches = Object.entries(content.batches);

  const courses = allCourses.filter((c) => {
    if (statusFilter && (c.status || 'draft') !== statusFilter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      instructor: course.instructor,
      duration: course.duration,
      category: course.category || 'Communication',
      level: course.level || 'Beginner',
      status: course.status || 'draft',
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    if (editingCourse) {
      editCourse({ ...editingCourse, ...formData });
      toast.success('Course updated');
    } else {
      const batchKey = batches[0]?.[0] || 'batch-admin';
      createCourse(formData, batchKey);
      toast.success('Course created');
    }
    setDialogOpen(false);
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h6">
          Courses ({courses.length}/{allCourses.length})
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Add Course
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value as CourseStatus | '')}
          >
            <MenuItem value="">All statuses</MenuItem>
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {allCourses.length === 0 ? (
        <EmptyState
          icon={<SchoolIcon />}
          title="No courses yet"
          description="Get started by creating your first course."
          actionLabel="Create Course"
          onAction={handleOpenCreate}
        />
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => {
            const status = (course.status || 'draft') as CourseStatus;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
                  }}
                >
                  <Box
                    sx={{
                      height: 120,
                      backgroundImage: `url(${course.thumbnail})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                    }}
                  >
                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                      <Chip
                        label={status}
                        size="small"
                        color={statusColor[status]}
                        sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                      />
                      {course.level && <Chip label={course.level} size="small" color="primary" />}
                    </Box>
                  </Box>
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
                      {course.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 1,
                      }}
                    >
                      {course.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {course.instructor} • {course.duration} • {course.modules.length} modules
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Tooltip title="Duplicate">
                      <IconButton
                        size="small"
                        onClick={() => {
                          duplicateCourse(course.id);
                          toast.success('Course duplicated');
                        }}
                        aria-label="Duplicate course"
                      >
                        <DuplicateIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={() => handleOpenEdit(course)} aria-label="Edit course">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setConfirmDelete(course.id)}
                      aria-label="Delete course"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Course Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Thumbnail URL"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              fullWidth
            />
            {formData.thumbnail && (
              <Box
                sx={{
                  width: '100%',
                  height: 120,
                  backgroundImage: `url(${formData.thumbnail})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                }}
                role="img"
                aria-label="Thumbnail preview"
              />
            )}
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="Instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={4}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={4}>
                <FormControl fullWidth>
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={formData.level}
                    label="Level"
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as typeof LEVELS[number] })}
                  >
                    {LEVELS.map((l) => (
                      <MenuItem key={l} value={l}>
                        {l}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as CourseStatus })}
                  >
                    {STATUSES.map((s) => (
                      <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!formData.title.trim()}>
            {editingCourse ? 'Save Changes' : 'Create Course'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete course?"
        message="This will permanently delete the course, all its modules, and content items. You can undo with Ctrl+Z."
        destructive
        confirmLabel="Delete course"
        onConfirm={() => {
          if (confirmDelete) {
            removeCourse(confirmDelete);
            toast.success('Course deleted');
          }
        }}
        onClose={() => setConfirmDelete(null)}
      />
    </Box>
  );
}
