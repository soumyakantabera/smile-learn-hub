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
  Fade,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useEditor } from '@/contexts/EditorContext';
import type { Course, CourseStatus } from '@/types/content';
import { ConfirmDialog } from './ConfirmDialog';
import { EmptyState } from './EmptyState';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
const CATEGORIES = ['Communication', 'Business', 'Academic', 'Exam Prep', 'Vocabulary', 'Grammar'];
const STATUS_COLORS: Record<CourseStatus, 'default' | 'success' | 'warning'> = {
  draft: 'warning',
  published: 'success',
  archived: 'default',
};

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

export function CourseEditor() {
  const { content, createCourse, editCourse, removeCourse, duplicateCourseAction } = useEditor();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>(defaultFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('');

  if (!content) return null;

  const courses = Object.values(content.courses);
  const batches = Object.entries(content.batches);

  const filteredCourses = courses.filter((c) => {
    const matchSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLevel = !filterLevel || c.level === filterLevel;
    return matchSearch && matchLevel;
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

  const handleDelete = () => {
    if (deleteConfirm) {
      removeCourse(deleteConfirm);
      setDeleteConfirm(null);
      toast.success('Course deleted');
    }
  };

  const handleDuplicate = (courseId: string) => {
    duplicateCourseAction(courseId);
    toast.success('Course duplicated with all modules and items');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6">Courses ({courses.length})</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Add Course
        </Button>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Level</InputLabel>
          <Select value={filterLevel} label="Level" onChange={(e) => setFilterLevel(e.target.value)}>
            <MenuItem value="">All Levels</MenuItem>
            {LEVELS.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {filteredCourses.length === 0 && courses.length === 0 ? (
        <EmptyState
          icon={<AddIcon />}
          title="No courses yet"
          description="Create your first course to get started building your curriculum."
          actionLabel="Create Course"
          onAction={handleOpenCreate}
        />
      ) : (
        <Grid container spacing={3}>
          {filteredCourses.map((course) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.id}>
              <Fade in timeout={300}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 } }}>
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
                      {course.level && <Chip label={course.level} size="small" color="primary" />}
                      <Chip label={course.status || 'draft'} size="small" color={STATUS_COLORS[course.status || 'draft']} />
                    </Box>
                  </Box>
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1,
                    }}>
                      {course.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {course.instructor} • {course.duration} • {course.modules.length} modules
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Tooltip title="Duplicate">
                      <IconButton size="small" onClick={() => handleDuplicate(course.id)}>
                        <DuplicateIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenEdit(course)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setDeleteConfirm(course.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Course Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Course Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} fullWidth required placeholder="e.g., Communicative English" />
            <TextField label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} fullWidth multiline rows={3} />
            <TextField label="Thumbnail URL" value={formData.thumbnail} onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })} fullWidth placeholder="https://..." />
            {/* Thumbnail Preview */}
            {formData.thumbnail && (
              <Box sx={{ height: 100, borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider', backgroundImage: `url(${formData.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            )}
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField label="Instructor" value={formData.instructor} onChange={(e) => setFormData({ ...formData, instructor: e.target.value })} fullWidth />
              </Grid>
              <Grid size={6}>
                <TextField label="Duration" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} fullWidth placeholder="e.g., 12 weeks" />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={4}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select value={formData.category} label="Category" onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                    {CATEGORIES.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={4}>
                <FormControl fullWidth>
                  <InputLabel>Level</InputLabel>
                  <Select value={formData.level} label="Level" onChange={(e) => setFormData({ ...formData, level: e.target.value as typeof LEVELS[number] })}>
                    {LEVELS.map((level) => <MenuItem key={level} value={level}>{level}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={formData.status} label="Status" onChange={(e) => setFormData({ ...formData, status: e.target.value as CourseStatus })}>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Course"
        message="This will permanently delete this course and all its modules and items. This cannot be undone."
        confirmLabel="Delete"
        severity="error"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </Box>
  );
}
