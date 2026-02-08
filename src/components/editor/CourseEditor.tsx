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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useEditor } from '@/contexts/EditorContext';
import type { Course } from '@/types/content';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
const CATEGORIES = ['Communication', 'Business', 'Academic', 'Exam Prep', 'Vocabulary', 'Grammar'];

interface CourseFormData {
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  duration: string;
  category: string;
  level: typeof LEVELS[number];
}

const defaultFormData: CourseFormData = {
  title: '',
  description: '',
  thumbnail: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800',
  instructor: '',
  duration: '',
  category: 'Communication',
  level: 'Beginner',
};

export function CourseEditor() {
  const { content, createCourse, editCourse, removeCourse } = useEditor();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>(defaultFormData);

  if (!content) return null;

  const courses = Object.values(content.courses);
  const batches = Object.entries(content.batches);

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
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    if (editingCourse) {
      editCourse({
        ...editingCourse,
        ...formData,
      });
    } else {
      // Default to first batch - admin batch
      const batchKey = batches[0]?.[0] || 'batch-admin';
      createCourse(formData, batchKey);
    }
    setDialogOpen(false);
  };

  const handleDelete = (courseId: string) => {
    if (window.confirm('Delete this course and all its modules/items?')) {
      removeCourse(courseId);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Courses ({courses.length})</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Add Course
        </Button>
      </Box>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  height: 120,
                  backgroundImage: `url(${course.thumbnail})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 0.5,
                  }}
                >
                  {course.level && (
                    <Chip label={course.level} size="small" color="primary" />
                  )}
                </Box>
              </Box>
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
                  {course.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  mb: 1,
                }}>
                  {course.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {course.instructor} • {course.duration} • {course.modules.length} modules
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <IconButton size="small" onClick={() => handleOpenEdit(course)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => handleDelete(course.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Course Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCourse ? 'Edit Course' : 'Create New Course'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Course Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
              placeholder="e.g., Communicative English"
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="Brief course description..."
            />
            <TextField
              label="Thumbnail URL"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              fullWidth
              placeholder="https://..."
            />
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="Instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  fullWidth
                  placeholder="Prof. Name"
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  fullWidth
                  placeholder="e.g., 12 weeks"
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={6}>
                <FormControl fullWidth>
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={formData.level}
                    label="Level"
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as typeof LEVELS[number] })}
                  >
                    {LEVELS.map((level) => (
                      <MenuItem key={level} value={level}>{level}</MenuItem>
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
    </Box>
  );
}
