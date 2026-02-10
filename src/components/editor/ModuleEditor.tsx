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
  Fade,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Folder as FolderIcon,
  DragIndicator as DragIcon,
  ContentCopy as DuplicateIcon,
  UnfoldMore as ExpandAllIcon,
  UnfoldLess as CollapseAllIcon,
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

const defaultFormData: ModuleFormData = {
  courseId: '',
  title: '',
  description: '',
  order: 1,
};

export function ModuleEditor() {
  const { content, createModule, editModule, removeModule, reorderModules, duplicateModuleAction } = useEditor();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState<ModuleFormData>(defaultFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});
  const [quickAddCourse, setQuickAddCourse] = useState<string>('');
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const dragItem = useRef<{ courseId: string; index: number } | null>(null);
  const dragOverItem = useRef<{ courseId: string; index: number } | null>(null);

  if (!content) return null;
  const courses = Object.values(content.courses);

  const allExpanded = courses.every((c) => expandedCourses[c.id] !== false);

  const toggleAll = () => {
    const newState: Record<string, boolean> = {};
    courses.forEach((c) => { newState[c.id] = !allExpanded; });
    setExpandedCourses(newState);
  };

  const handleOpenCreate = (courseId?: string) => {
    const course = courseId ? content.courses[courseId] : courses[0];
    setEditingModule(null);
    setFormData({ ...defaultFormData, courseId: course?.id || '', order: course ? course.modules.length + 1 : 1 });
    setDialogOpen(true);
  };

  const handleOpenEdit = (module: Module) => {
    setEditingModule(module);
    setFormData({ courseId: module.courseId, title: module.title, description: module.description, order: module.order });
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

  const handleDelete = () => {
    if (deleteConfirm) {
      removeModule(deleteConfirm);
      setDeleteConfirm(null);
      toast.success('Module deleted');
    }
  };

  const handleDuplicate = (moduleId: string) => {
    duplicateModuleAction(moduleId);
    toast.success('Module duplicated with all items');
  };

  const handleQuickAdd = (courseId: string) => {
    if (!quickAddTitle.trim()) return;
    const course = content.courses[courseId];
    createModule({ courseId, title: quickAddTitle, description: '', order: course ? course.modules.length + 1 : 1 });
    setQuickAddTitle('');
    setQuickAddCourse('');
    toast.success('Module added');
  };

  const handleDragStart = (courseId: string, index: number) => { dragItem.current = { courseId, index }; };
  const handleDragEnter = (courseId: string, index: number) => { dragOverItem.current = { courseId, index }; };
  const handleDragEnd = () => {
    if (dragItem.current && dragOverItem.current && dragItem.current.courseId === dragOverItem.current.courseId && dragItem.current.index !== dragOverItem.current.index) {
      reorderModules(dragItem.current.courseId, dragItem.current.index, dragOverItem.current.index);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6">Modules</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" startIcon={allExpanded ? <CollapseAllIcon /> : <ExpandAllIcon />} onClick={toggleAll}>
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenCreate()}>
            Add Module
          </Button>
        </Box>
      </Box>

      {courses.length === 0 ? (
        <EmptyState icon={<FolderIcon />} title="No courses yet" description="Create a course first, then add modules to organize your content." />
      ) : (
        courses.map((course) => {
          const courseModules = course.modules.map((id) => content.modules[id]).filter(Boolean);
          const isExpanded = expandedCourses[course.id] !== false;

          return (
            <Accordion
              key={course.id}
              expanded={isExpanded}
              onChange={() => setExpandedCourses((prev) => ({ ...prev, [course.id]: !isExpanded }))}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FolderIcon color="primary" />
                  <Box>
                    <Typography fontWeight={600}>{course.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {courseModules.length} modules
                    </Typography>
                  </Box>
                  <Chip
                    label={courseModules.length}
                    size="small"
                    color={courseModules.length > 0 ? 'success' : 'warning'}
                    sx={{ ml: 1 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List disablePadding>
                  {courseModules.map((module, index) => {
                    const itemCount = module.items.length;
                    return (
                      <ListItem
                        key={module.id}
                        divider
                        draggable
                        onDragStart={() => handleDragStart(course.id, index)}
                        onDragEnter={() => handleDragEnter(course.id, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        sx={{
                          pl: 0, cursor: 'grab',
                          '&:active': { cursor: 'grabbing' },
                          '&[draggable]:hover': { bgcolor: 'action.hover' },
                          transition: 'background-color 0.15s, transform 0.15s',
                        }}
                      >
                        <DragIcon sx={{ mr: 1, color: 'text.disabled', flexShrink: 0 }} />
                        <Chip label={`M${index + 1}`} size="small" sx={{ mr: 2 }} />
                        <ListItemText
                          primary={module.title}
                          secondary={`${module.description} • ${itemCount} items`}
                        />
                        <Chip label={`${itemCount}`} size="small" color={itemCount > 0 ? 'success' : 'warning'} variant="outlined" sx={{ mr: 1 }} />
                        <ListItemSecondaryAction>
                          <Tooltip title="Duplicate"><IconButton size="small" onClick={() => handleDuplicate(module.id)}><DuplicateIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpenEdit(module)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteConfirm(module.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                </List>

                {/* Quick Add */}
                {quickAddCourse === course.id ? (
                  <Box sx={{ display: 'flex', gap: 1, mt: 1.5, alignItems: 'center' }}>
                    <TextField
                      size="small"
                      placeholder="Module title..."
                      value={quickAddTitle}
                      onChange={(e) => setQuickAddTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd(course.id)}
                      autoFocus
                      fullWidth
                    />
                    <Button size="small" variant="contained" onClick={() => handleQuickAdd(course.id)} disabled={!quickAddTitle.trim()}>
                      Add
                    </Button>
                    <Button size="small" onClick={() => { setQuickAddCourse(''); setQuickAddTitle(''); }}>
                      Cancel
                    </Button>
                  </Box>
                ) : (
                  <Button startIcon={<AddIcon />} size="small" onClick={() => setQuickAddCourse(course.id)} sx={{ mt: 1 }}>
                    Quick Add Module
                  </Button>
                )}
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
              <Select value={formData.courseId} label="Course" onChange={(e) => setFormData({ ...formData, courseId: e.target.value })} disabled={!!editingModule}>
                {courses.map((course) => <MenuItem key={course.id} value={course.id}>{course.title}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Module Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} fullWidth required placeholder="e.g., Unit 1: Introduction" />
            <TextField label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} fullWidth multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!formData.title.trim() || !formData.courseId}>
            {editingModule ? 'Save Changes' : 'Create Module'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Module"
        message="This will delete this module and all its items. This cannot be undone."
        confirmLabel="Delete"
        severity="error"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </Box>
  );
}
