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
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Folder as FolderIcon,
  DragIndicator as DragIcon,
  ContentCopy as DuplicateIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useEditor } from '@/contexts/EditorContext';
import type { Module } from '@/types/content';
import { ConfirmDialog } from './ConfirmDialog';
import { EmptyState } from './EmptyState';

interface ModuleFormData {
  courseId: string;
  title: string;
  description: string;
  order: number;
}

const defaultFormData: ModuleFormData = { courseId: '', title: '', description: '', order: 1 };

export function ModuleEditor() {
  const { content, createModule, editModule, removeModule, duplicateModule, reorderModules } = useEditor();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState<ModuleFormData>(defaultFormData);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [quickAdd, setQuickAdd] = useState<Record<string, string>>({});
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
      toast.success('Module updated');
    } else {
      createModule(formData);
      toast.success('Module created');
    }
    setDialogOpen(false);
  };

  const handleQuickAdd = (courseId: string) => {
    const title = quickAdd[courseId]?.trim();
    if (!title) return;
    const course = content.courses[courseId];
    createModule({ courseId, title, description: '', order: course.modules.length + 1 });
    setQuickAdd((p) => ({ ...p, [courseId]: '' }));
    toast.success(`Added "${title}"`);
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
        <EmptyState
          icon={<FolderIcon />}
          title="No courses yet"
          description="Create a course first to start adding modules."
        />
      ) : (
        courses.map((course) => {
          const courseModules = course.modules.map((id) => content.modules[id]).filter(Boolean);
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
                      <DragIcon sx={{ mr: 1, color: 'text.disabled' }} aria-label="Drag handle" />
                      <Chip label={`M${index + 1}`} size="small" sx={{ mr: 2 }} />
                      <ListItemText
                        primary={module.title}
                        secondary={
                          <Box component="span" sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <span>{module.description}</span>
                            <Chip
                              label={`${module.items.length} items`}
                              size="small"
                              color={module.items.length === 0 ? 'warning' : 'success'}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Duplicate">
                          <IconButton
                            size="small"
                            onClick={() => {
                              duplicateModule(module.id);
                              toast.success('Module duplicated');
                            }}
                            aria-label="Duplicate module"
                          >
                            <DuplicateIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <IconButton size="small" onClick={() => handleOpenEdit(module)} aria-label="Edit module">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setConfirmDelete(module.id)}
                          aria-label="Delete module"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Quick add module title..."
                    value={quickAdd[course.id] || ''}
                    onChange={(e) => setQuickAdd((p) => ({ ...p, [course.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd(course.id)}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    startIcon={<AddIcon />}
                    size="small"
                    variant="outlined"
                    onClick={() => handleQuickAdd(course.id)}
                    disabled={!quickAdd[course.id]?.trim()}
                  >
                    Quick add
                  </Button>
                  <Button startIcon={<AddIcon />} size="small" onClick={() => handleOpenCreate(course.id)}>
                    Detailed
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })
      )}

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
                {courses.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Module Title"
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
              rows={2}
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

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete module?"
        message="This will delete the module and all of its items. You can undo this with Ctrl+Z."
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          if (confirmDelete) {
            removeModule(confirmDelete);
            toast.success('Module deleted');
          }
        }}
        onClose={() => setConfirmDelete(null)}
      />
    </Box>
  );
}
