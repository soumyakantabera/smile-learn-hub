import React, { useState, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
  Checkbox,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  PictureAsPdf as PdfIcon,
  VideoLibrary as VideoIcon,
  Description as DocIcon,
  Slideshow as PptIcon,
  TableChart as SpreadsheetIcon,
  Link as LinkIcon,
  Assignment as HomeworkIcon,
  YouTube as YouTubeIcon,
  Audiotrack as AudioIcon,
  Quiz as QuizIcon,
  DragIndicator as DragIcon,
  ContentCopy as DuplicateIcon,
  DriveFileMove as MoveIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useEditor } from '@/contexts/EditorContext';
import type { ContentItem, ItemType, QuizQuestion } from '@/types/content';
import { QuizEditor } from './QuizEditor';
import { ConfirmDialog } from './ConfirmDialog';
import { EmptyState } from './EmptyState';
import { TagAutocomplete } from './TagAutocomplete';
import { getAllItemTags } from '@/lib/editorStorage';

const ITEM_TYPES: { value: ItemType; label: string; icon: React.ReactNode }[] = [
  { value: 'pdf', label: 'PDF Document', icon: <PdfIcon /> },
  { value: 'video', label: 'Video (MP4)', icon: <VideoIcon /> },
  { value: 'youtube', label: 'YouTube/Vimeo', icon: <YouTubeIcon /> },
  { value: 'audio', label: 'Audio (MP3)', icon: <AudioIcon /> },
  { value: 'doc', label: 'Word Document', icon: <DocIcon /> },
  { value: 'ppt', label: 'Presentation', icon: <PptIcon /> },
  { value: 'spreadsheet', label: 'Spreadsheet', icon: <SpreadsheetIcon /> },
  { value: 'link', label: 'External Link', icon: <LinkIcon /> },
  { value: 'homework', label: 'Homework', icon: <HomeworkIcon /> },
  { value: 'quiz', label: 'Interactive Quiz', icon: <QuizIcon /> },
];

const typeColors: Record<ItemType, string> = {
  pdf: '#D32F2F',
  video: '#1976D2',
  doc: '#2196F3',
  ppt: '#FF5722',
  spreadsheet: '#4CAF50',
  link: '#9C27B0',
  homework: '#FF9800',
  youtube: '#FF0000',
  audio: '#E91E63',
  quiz: '#673AB7',
  conversation: '#0F3D2E',
};

interface ItemFormData {
  moduleId: string;
  title: string;
  description: string;
  type: ItemType;
  url: string;
  embedUrl: string;
  instructions: string;
  dueDate: string;
  tags: string[];
  audioDuration: string;
  quizQuestions: QuizQuestion[];
}

const defaultFormData: ItemFormData = {
  moduleId: '',
  title: '',
  description: '',
  type: 'pdf',
  url: '',
  embedUrl: '',
  instructions: '',
  dueDate: '',
  tags: [],
  audioDuration: '',
  quizQuestions: [],
};

export function ItemEditor() {
  const { content, createItem, editItem, removeItem, duplicateItem, moveItem, reorderItems } = useEditor();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [formData, setFormData] = useState<ItemFormData>(defaultFormData);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState('');
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const dragItem = useRef<{ moduleId: string; index: number } | null>(null);
  const dragOverItem = useRef<{ moduleId: string; index: number } | null>(null);

  const allTags = useMemo(() => (content ? getAllItemTags(content) : []), [content]);
  const allModules = useMemo(() => (content ? Object.values(content.modules) : []), [content]);

  if (!content) return null;
  const courses = Object.values(content.courses);

  const handleOpenCreate = (moduleId?: string) => {
    setEditingItem(null);
    setFormData({ ...defaultFormData, moduleId: moduleId || '' });
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: ContentItem) => {
    setEditingItem(item);
    setFormData({
      moduleId: item.moduleId,
      title: item.title,
      description: item.description,
      type: item.type,
      url: item.url || '',
      embedUrl: item.embedUrl || '',
      instructions: item.instructions || '',
      dueDate: item.dueDate || '',
      tags: item.tags || [],
      audioDuration: item.audioDuration || '',
      quizQuestions: item.quizQuestions || [],
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.moduleId) return;
    const itemData = {
      moduleId: formData.moduleId,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      url: formData.url || undefined,
      embedUrl: formData.embedUrl || undefined,
      instructions: formData.instructions || undefined,
      dueDate: formData.dueDate || undefined,
      tags: formData.tags,
      publishedAt: editingItem?.publishedAt || new Date().toISOString(),
      audioDuration: formData.audioDuration || undefined,
      quizQuestions: formData.type === 'quiz' ? formData.quizQuestions : undefined,
    };
    if (editingItem) {
      editItem({ ...itemData, id: editingItem.id });
      toast.success('Item updated');
    } else {
      createItem(itemData);
      toast.success('Item created');
    }
    setDialogOpen(false);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = () => {
    const count = selected.size;
    selected.forEach((id) => removeItem(id));
    toast.success(`${count} item${count !== 1 ? 's' : ''} deleted`);
    setSelected(new Set());
  };

  const handleBulkMove = () => {
    if (!moveTarget) return;
    const count = selected.size;
    selected.forEach((id) => moveItem(id, moveTarget));
    toast.success(`${count} item${count !== 1 ? 's' : ''} moved`);
    setSelected(new Set());
    setMoveDialogOpen(false);
    setMoveTarget('');
  };

  const getModuleItems = (moduleId: string) => {
    const module = content.modules[moduleId];
    if (!module) return [];
    return module.items.map((id) => content.items[id]).filter(Boolean);
  };

  const handleDragStart = (moduleId: string, index: number) => {
    dragItem.current = { moduleId, index };
  };
  const handleDragEnter = (moduleId: string, index: number) => {
    dragOverItem.current = { moduleId, index };
  };
  const handleDragEnd = () => {
    if (
      dragItem.current &&
      dragOverItem.current &&
      dragItem.current.moduleId === dragOverItem.current.moduleId &&
      dragItem.current.index !== dragOverItem.current.index
    ) {
      reorderItems(dragItem.current.moduleId, dragItem.current.index, dragOverItem.current.index);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="h6">Content Items</Typography>
        <Stack direction="row" spacing={1}>
          {selected.size > 0 && (
            <>
              <Chip
                label={`${selected.size} selected`}
                color="primary"
                onDelete={() => setSelected(new Set())}
              />
              <Button size="small" startIcon={<MoveIcon />} onClick={() => setMoveDialogOpen(true)}>
                Move
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setBulkDeleteConfirm(true)}
              >
                Delete
              </Button>
            </>
          )}
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenCreate()}>
            Add Item
          </Button>
        </Stack>
      </Box>

      {courses.length === 0 ? (
        <EmptyState title="No courses yet" description="Create a course and module first to add content items." />
      ) : (
        courses.map((course) => {
          const courseModules = course.modules
            .map((id) => content.modules[id])
            .filter(Boolean)
            .sort((a, b) => a.order - b.order);
          return (
            <Accordion key={course.id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>{course.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {courseModules.map((module) => {
                  const items = getModuleItems(module.id);
                  return (
                    <Box key={module.id} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip label={`M${module.order}`} size="small" color="primary" />
                        <Typography fontWeight={500}>{module.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          • Drag to reorder
                        </Typography>
                        <Button size="small" startIcon={<AddIcon />} onClick={() => handleOpenCreate(module.id)}>
                          Add Item
                        </Button>
                      </Box>
                      <List dense disablePadding sx={{ pl: 2 }}>
                        {items.map((item, index) => {
                          const typeInfo = ITEM_TYPES.find((t) => t.value === item.type);
                          const isSelected = selected.has(item.id);
                          return (
                            <ListItem
                              key={item.id}
                              divider
                              draggable
                              onDragStart={() => handleDragStart(module.id, index)}
                              onDragEnter={() => handleDragEnter(module.id, index)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => e.preventDefault()}
                              sx={{
                                pl: 0,
                                cursor: 'grab',
                                '&:active': { cursor: 'grabbing' },
                                '&[draggable]:hover': { bgcolor: 'action.hover' },
                                transition: 'background-color 0.15s',
                                bgcolor: isSelected ? 'action.selected' : undefined,
                              }}
                            >
                              <Checkbox
                                size="small"
                                checked={isSelected}
                                onChange={() => toggleSelect(item.id)}
                                inputProps={{ 'aria-label': `Select ${item.title}` }}
                                sx={{ mr: 0.5 }}
                              />
                              <DragIcon
                                sx={{ mr: 1, color: 'text.disabled', flexShrink: 0 }}
                                aria-label="Drag handle"
                              />
                              <ListItemIcon sx={{ minWidth: 36, color: typeColors[item.type] }}>
                                {typeInfo?.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={item.title}
                                secondary={
                                  <Box
                                    component="span"
                                    sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}
                                  >
                                    <Chip label={typeInfo?.label} size="small" variant="outlined" />
                                    {item.tags.slice(0, 2).map((tag) => (
                                      <Chip key={tag} label={tag} size="small" />
                                    ))}
                                  </Box>
                                }
                                secondaryTypographyProps={{ component: 'div' }}
                              />
                              <ListItemSecondaryAction>
                                <Tooltip title="Duplicate">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      duplicateItem(item.id);
                                      toast.success('Item duplicated');
                                    }}
                                    aria-label="Duplicate item"
                                  >
                                    <DuplicateIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <IconButton size="small" onClick={() => handleOpenEdit(item)} aria-label="Edit item">
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => setConfirmDelete(item.id)}
                                  aria-label="Delete item"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                          );
                        })}
                        {items.length === 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                            No items yet
                          </Typography>
                        )}
                      </List>
                    </Box>
                  );
                })}
              </AccordionDetails>
            </Accordion>
          );
        })
      )}

      {/* Item Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingItem ? 'Edit Item' : 'Create New Item'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Module</InputLabel>
                  <Select
                    value={formData.moduleId}
                    label="Module"
                    onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                    disabled={!!editingItem}
                  >
                    {courses.flatMap((course) =>
                      course.modules
                        .map((id) => content.modules[id])
                        .filter(Boolean)
                        .map((module) => (
                          <MenuItem key={module.id} value={module.id}>
                            {course.title} → {module.title}
                          </MenuItem>
                        )),
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Type"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ItemType })}
                  >
                    {ITEM_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {type.icon}
                          {type.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              label="Title"
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

            {(['pdf', 'video', 'doc', 'ppt', 'spreadsheet', 'link', 'audio'] as ItemType[]).includes(formData.type) && (
              <TextField
                label="Resource URL"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                fullWidth
                placeholder="https://..."
              />
            )}

            {formData.type === 'youtube' && (
              <>
                <TextField
                  label="YouTube/Vimeo Embed URL"
                  value={formData.embedUrl}
                  onChange={(e) => setFormData({ ...formData, embedUrl: e.target.value })}
                  fullWidth
                  placeholder="https://www.youtube.com/embed/VIDEO_ID"
                  helperText="Use the embed URL format: youtube.com/embed/ID or player.vimeo.com/video/ID"
                />
                {formData.embedUrl && (
                  <Box
                    sx={{
                      position: 'relative',
                      pb: '56.25%',
                      height: 0,
                      borderRadius: 1,
                      overflow: 'hidden',
                      border: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <iframe
                      src={formData.embedUrl}
                      title="Preview"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </Box>
                )}
              </>
            )}

            {formData.type === 'pdf' && formData.url && (
              <Box sx={{ height: 300, border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                <iframe src={formData.url} title="PDF preview" style={{ width: '100%', height: '100%', border: 0 }} />
              </Box>
            )}

            {formData.type === 'audio' && (
              <TextField
                label="Duration"
                value={formData.audioDuration}
                onChange={(e) => setFormData({ ...formData, audioDuration: e.target.value })}
                fullWidth
                placeholder="e.g., 5:30"
              />
            )}

            {formData.type === 'homework' && (
              <>
                <TextField
                  label="Instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  fullWidth
                  multiline
                  rows={4}
                />
                <TextField
                  label="Due Date"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}

            {formData.type === 'quiz' && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Quiz Questions
                </Typography>
                <QuizEditor
                  questions={formData.quizQuestions}
                  onChange={(questions) => setFormData({ ...formData, quizQuestions: questions })}
                />
              </>
            )}

            <TagAutocomplete
              value={formData.tags}
              options={allTags}
              onChange={(tags) => setFormData({ ...formData, tags })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.title.trim() || !formData.moduleId}
          >
            {editingItem ? 'Save Changes' : 'Create Item'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk move */}
      <Dialog open={moveDialogOpen} onClose={() => setMoveDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          Move {selected.size} item{selected.size !== 1 ? 's' : ''}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Target module</InputLabel>
            <Select value={moveTarget} label="Target module" onChange={(e) => setMoveTarget(e.target.value)}>
              {allModules.map((m) => {
                const c = content.courses[m.courseId];
                return (
                  <MenuItem key={m.id} value={m.id}>
                    {c?.title || '—'} → {m.title}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={!moveTarget} onClick={handleBulkMove}>
            Move
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete item?"
        message="This will permanently remove the content item. You can undo with Ctrl+Z."
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          if (confirmDelete) {
            removeItem(confirmDelete);
            toast.success('Item deleted');
          }
        }}
        onClose={() => setConfirmDelete(null)}
      />

      <ConfirmDialog
        open={bulkDeleteConfirm}
        title={`Delete ${selected.size} items?`}
        message="This will permanently remove all selected content items."
        destructive
        confirmLabel="Delete all"
        onConfirm={handleBulkDelete}
        onClose={() => setBulkDeleteConfirm(false)}
      />
    </Box>
  );
}
