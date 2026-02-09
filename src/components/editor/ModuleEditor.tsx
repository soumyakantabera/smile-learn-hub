import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Folder as FolderIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { useEditor } from '@/contexts/EditorContext';
import type { Module } from '@/types/content';

interface ModuleFormData {
  courseId: string;
  title: string;
  description: string;
  order: number;
}

const defaultFormData: ModuleFormData = {
  courseId: '',
  title: '',
  description: '',
  order: 1,
};

export function ModuleEditor() {
  const { content, createModule, editModule, removeModule, reorderModules } = useEditor();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState<ModuleFormData>(defaultFormData);
  const dragItem = useRef<{ courseId: string; index: number } | null>(null);
  const dragOverItem = useRef<{ courseId: string; index: number } | null>(null);

  if (!content) return null;

  const courses = Object.values(content.courses);

  const handleOpenCreate = (courseId?: string) => {
    const course = courseId ? content.courses[courseId] : courses[0];
    setEditingModule(null);
    setFormData({
      ...defaultFormData,
      courseId: course?.id || '',
      order: course ? course.modules.length + 1 : 1,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (module: Module) => {
    setEditingModule(module);
    setFormData({
      courseId: module.courseId,
      title: module.title,
      description: module.description,
      order: module.order,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.courseId) return;
    if (editingModule) {
      editModule({ ...editingModule, ...formData });
    } else {
      createModule(formData);
    }
    setDialogOpen(false);
  };

  const handleDelete = (moduleId: string) => {
    if (window.confirm('Delete this module and all its items?')) {
      removeModule(moduleId);
    }
  };

  const handleDragStart = (courseId: string, index: number) => {
    dragItem.current = { courseId, index };
  };

  const handleDragEnter = (courseId: string, index: number) => {
    dragOverItem.current = { courseId, index };
  };

  const handleDragEnd = () => {
    if (
      dragItem.current &&
      dragOverItem.current &&
      dragItem.current.courseId === dragOverItem.current.courseId &&
      dragItem.current.index !== dragOverItem.current.index
    ) {
      reorderModules(dragItem.current.courseId, dragItem.current.index, dragOverItem.current.index);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Modules</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenCreate()}>
          Add Module
        </Button>
      </Box>

      {courses.length === 0 ? (
        <Typography color="text.secondary">Create a course first to add modules.</Typography>
      ) : (
        courses.map((course) => {
          const courseModules = course.modules
            .map((id) => content.modules[id])
            .filter(Boolean);

          return (
            <Accordion key={course.id} defaultExpanded sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FolderIcon color="primary" />
                  <Box>
                    <Typography fontWeight={600}>{course.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {courseModules.length} modules • Drag to reorder
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List disablePadding>
                  {courseModules.map((module, index) => (
                    <ListItem
                      key={module.id}
                      divider
                      draggable
                      onDragStart={() => handleDragStart(course.id, index)}
                      onDragEnter={() => handleDragEnter(course.id, index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      sx={{
                        pl: 0,
                        cursor: 'grab',
                        '&:active': { cursor: 'grabbing' },
                        '&[draggable]:hover': { bgcolor: 'action.hover' },
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <DragIcon sx={{ mr: 1, color: 'text.disabled', flexShrink: 0 }} />
                      <Chip label={`M${index + 1}`} size="small" sx={{ mr: 2 }} />
                      <ListItemText
                        primary={module.title}
                        secondary={`${module.description} • ${module.items.length} items`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton size="small" onClick={() => handleOpenEdit(module)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(module.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
                <Button
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => handleOpenCreate(course.id)}
                  sx={{ mt: 1 }}
                >
                  Add Module to {course.title}
                </Button>
              </AccordionDetails>
            </Accordion>
          );
        })
      )}

      {/* Module Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingModule ? 'Edit Module' : 'Create New Module'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Course</InputLabel>
              <Select
                value={formData.courseId}
                label="Course"
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                disabled={!!editingModule}
              >
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>{course.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Module Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
              placeholder="e.g., Unit 1: Introduction"
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="Brief module description..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.title.trim() || !formData.courseId}
          >
            {editingModule ? 'Save Changes' : 'Create Module'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}