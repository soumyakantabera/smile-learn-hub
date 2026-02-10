import React, { useState, useRef } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  Card,
  CardActionArea,
  CardContent,
  Tooltip,
  Checkbox,
  Fade,
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
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  DeleteSweep as BulkDeleteIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useEditor } from '@/contexts/EditorContext';
import type { ContentItem, ItemType, QuizQuestion, QuizSettings } from '@/types/content';
import { QuizEditor } from './QuizEditor';
import { QuizSettingsPanel } from './QuizSettingsPanel';
import { ConfirmDialog } from './ConfirmDialog';
import { EmptyState } from './EmptyState';

const ITEM_TYPES: { value: ItemType; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'pdf', label: 'PDF', description: 'Upload PDF documents', icon: <PdfIcon /> },
  { value: 'video', label: 'Video', description: 'MP4 video files', icon: <VideoIcon /> },
  { value: 'youtube', label: 'YouTube', description: 'YouTube/Vimeo embeds', icon: <YouTubeIcon /> },
  { value: 'audio', label: 'Audio', description: 'MP3 audio files', icon: <AudioIcon /> },
  { value: 'doc', label: 'Document', description: 'Word documents', icon: <DocIcon /> },
  { value: 'ppt', label: 'Presentation', description: 'PowerPoint slides', icon: <PptIcon /> },
  { value: 'spreadsheet', label: 'Spreadsheet', description: 'Excel/CSV files', icon: <SpreadsheetIcon /> },
  { value: 'link', label: 'Link', description: 'External URLs', icon: <LinkIcon /> },
  { value: 'homework', label: 'Homework', description: 'Assignments', icon: <HomeworkIcon /> },
  { value: 'quiz', label: 'Quiz', description: 'Interactive quizzes', icon: <QuizIcon /> },
];

const typeColors: Record<ItemType, string> = {
  pdf: '#D32F2F', video: '#1976D2', doc: '#2196F3', ppt: '#FF5722',
  spreadsheet: '#4CAF50', link: '#9C27B0', homework: '#FF9800',
  youtube: '#FF0000', audio: '#E91E63', quiz: '#673AB7',
};

const WIZARD_STEPS = ['Choose Type', 'Details', 'Configuration', 'Review'];

interface ItemFormData {
  moduleId: string;
  title: string;
  description: string;
  type: ItemType;
  url: string;
  embedUrl: string;
  instructions: string;
  dueDate: string;
  tags: string;
  audioDuration: string;
  quizQuestions: QuizQuestion[];
  quizSettings: QuizSettings;
}

const defaultFormData: ItemFormData = {
  moduleId: '', title: '', description: '', type: 'pdf', url: '', embedUrl: '',
  instructions: '', dueDate: '', tags: '', audioDuration: '',
  quizQuestions: [], quizSettings: {},
};

export function ItemEditor() {
  const { content, createItem, editItem, removeItem, reorderItems, duplicateItemAction } = useEditor();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [formData, setFormData] = useState<ItemFormData>(defaultFormData);
  const [wizardStep, setWizardStep] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const dragItem = useRef<{ moduleId: string; index: number } | null>(null);
  const dragOverItem = useRef<{ moduleId: string; index: number } | null>(null);

  if (!content) return null;
  const courses = Object.values(content.courses);

  const handleOpenCreate = (moduleId?: string) => {
    setEditingItem(null);
    setFormData({ ...defaultFormData, moduleId: moduleId || '' });
    setWizardStep(0);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: ContentItem) => {
    setEditingItem(item);
    setFormData({
      moduleId: item.moduleId, title: item.title, description: item.description, type: item.type,
      url: item.url || '', embedUrl: item.embedUrl || '', instructions: item.instructions || '',
      dueDate: item.dueDate || '', tags: item.tags.join(', '), audioDuration: item.audioDuration || '',
      quizQuestions: item.quizQuestions || [], quizSettings: item.quizSettings || {},
    });
    setWizardStep(1); // Skip type selection for edit
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.moduleId) return;
    const itemData = {
      moduleId: formData.moduleId, title: formData.title, description: formData.description,
      type: formData.type, url: formData.url || undefined, embedUrl: formData.embedUrl || undefined,
      instructions: formData.instructions || undefined, dueDate: formData.dueDate || undefined,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      publishedAt: editingItem?.publishedAt || new Date().toISOString(),
      audioDuration: formData.audioDuration || undefined,
      quizQuestions: formData.type === 'quiz' ? formData.quizQuestions : undefined,
      quizSettings: formData.type === 'quiz' ? formData.quizSettings : undefined,
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

  const handleDelete = () => {
    if (deleteConfirm) {
      removeItem(deleteConfirm);
      setDeleteConfirm(null);
      toast.success('Item deleted');
    }
  };

  const handleBulkDelete = () => {
    selectedItems.forEach((id) => removeItem(id));
    setSelectedItems(new Set());
    setBulkDeleteOpen(false);
    toast.success(`${selectedItems.size} items deleted`);
  };

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDragStart = (moduleId: string, index: number) => { dragItem.current = { moduleId, index }; };
  const handleDragEnter = (moduleId: string, index: number) => { dragOverItem.current = { moduleId, index }; };
  const handleDragEnd = () => {
    if (dragItem.current && dragOverItem.current && dragItem.current.moduleId === dragOverItem.current.moduleId && dragItem.current.index !== dragOverItem.current.index) {
      reorderItems(dragItem.current.moduleId, dragItem.current.index, dragOverItem.current.index);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const getModuleItems = (moduleId: string) => {
    const module = content.modules[moduleId];
    return module ? module.items.map((id) => content.items[id]).filter(Boolean) : [];
  };

  // Get YouTube thumbnail
  const getYouTubeThumbnail = (url: string) => {
    const match = url.match(/(?:embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
  };

  // Collect all existing tags for autocomplete
  const allTags = Array.from(new Set(Object.values(content.items).flatMap((i) => i.tags)));

  const renderWizardContent = () => {
    switch (wizardStep) {
      case 0: // Type selector
        return (
          <Grid container spacing={1.5}>
            {ITEM_TYPES.map((t) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={t.value}>
                <Card
                  variant={formData.type === t.value ? 'elevation' : 'outlined'}
                  sx={{
                    cursor: 'pointer',
                    border: formData.type === t.value ? 2 : 1,
                    borderColor: formData.type === t.value ? typeColors[t.value] : 'divider',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: typeColors[t.value], transform: 'scale(1.02)' },
                  }}
                >
                  <CardActionArea onClick={() => setFormData({ ...formData, type: t.value })} sx={{ p: 1.5, textAlign: 'center' }}>
                    <Box sx={{ color: typeColors[t.value], mb: 0.5 }}>{t.icon}</Box>
                    <Typography variant="body2" fontWeight={600}>{t.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{t.description}</Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        );
      case 1: // Details
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Module</InputLabel>
              <Select value={formData.moduleId} label="Module" onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })} disabled={!!editingItem}>
                {courses.flatMap((course) =>
                  course.modules.map((id) => content.modules[id]).filter(Boolean).map((module) => (
                    <MenuItem key={module.id} value={module.id}>{course.title} → {module.title}</MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <TextField label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} fullWidth required />
            <TextField label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} fullWidth multiline rows={2} />
            <TextField label="Tags (comma-separated)" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} fullWidth
              helperText={allTags.length > 0 ? `Existing: ${allTags.slice(0, 8).join(', ')}` : undefined}
            />
          </Box>
        );
      case 2: // Type-specific config
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {['pdf', 'video', 'doc', 'ppt', 'spreadsheet', 'link', 'audio'].includes(formData.type) && (
              <TextField label="Resource URL" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} fullWidth placeholder="https://..." />
            )}
            {formData.type === 'youtube' && (
              <>
                <TextField label="Embed URL" value={formData.embedUrl} onChange={(e) => setFormData({ ...formData, embedUrl: e.target.value })} fullWidth placeholder="https://www.youtube.com/embed/VIDEO_ID" />
                {formData.embedUrl && getYouTubeThumbnail(formData.embedUrl) && (
                  <Box sx={{ borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
                    <img src={getYouTubeThumbnail(formData.embedUrl)!} alt="YouTube preview" style={{ width: '100%', display: 'block' }} />
                  </Box>
                )}
              </>
            )}
            {formData.type === 'audio' && (
              <TextField label="Duration" value={formData.audioDuration} onChange={(e) => setFormData({ ...formData, audioDuration: e.target.value })} fullWidth placeholder="e.g., 5:30" />
            )}
            {formData.type === 'homework' && (
              <>
                <TextField label="Instructions" value={formData.instructions} onChange={(e) => setFormData({ ...formData, instructions: e.target.value })} fullWidth multiline rows={4} />
                <TextField label="Due Date" type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
              </>
            )}
            {formData.type === 'quiz' && (
              <>
                <QuizSettingsPanel settings={formData.quizSettings} onChange={(s) => setFormData({ ...formData, quizSettings: s })} />
                <Divider />
                <Typography variant="subtitle1" fontWeight={600}>Quiz Questions</Typography>
                <QuizEditor questions={formData.quizQuestions} onChange={(q) => setFormData({ ...formData, quizQuestions: q })} />
              </>
            )}
            {!['youtube', 'audio', 'homework', 'quiz'].includes(formData.type) && formData.url && formData.type === 'pdf' && (
              <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, height: 200, overflow: 'hidden' }}>
                <iframe src={formData.url} title="PDF Preview" style={{ width: '100%', height: '100%', border: 0 }} />
              </Box>
            )}
          </Box>
        );
      case 3: // Review
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ color: typeColors[formData.type] }}>
                {ITEM_TYPES.find((t) => t.value === formData.type)?.icon}
              </Box>
              <Chip label={formData.type} size="small" sx={{ bgcolor: typeColors[formData.type] + '22', color: typeColors[formData.type] }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>{formData.title || '(No title)'}</Typography>
            <Typography variant="body2" color="text.secondary">{formData.description || '(No description)'}</Typography>
            {formData.url && <Typography variant="body2"><strong>URL:</strong> {formData.url}</Typography>}
            {formData.embedUrl && <Typography variant="body2"><strong>Embed:</strong> {formData.embedUrl}</Typography>}
            {formData.tags && <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {formData.tags.split(',').map((t) => t.trim()).filter(Boolean).map((t) => <Chip key={t} label={t} size="small" />)}
            </Box>}
            {formData.type === 'quiz' && (
              <Typography variant="body2">{formData.quizQuestions.length} questions</Typography>
            )}
          </Box>
        );
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6">Content Items</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {selectedItems.size > 0 && (
            <Button size="small" color="error" startIcon={<BulkDeleteIcon />} onClick={() => setBulkDeleteOpen(true)}>
              Delete {selectedItems.size}
            </Button>
          )}
          <Tooltip title="Toggle view">
            <IconButton size="small" onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}>
              {viewMode === 'list' ? <GridViewIcon /> : <ListViewIcon />}
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenCreate()}>
            Add Item
          </Button>
        </Box>
      </Box>

      {courses.length === 0 ? (
        <EmptyState icon={<AddIcon />} title="No content yet" description="Create a course and module first, then add content items." />
      ) : (
        courses.map((course) => {
          const courseModules = course.modules.map((id) => content.modules[id]).filter(Boolean).sort((a, b) => a.order - b.order);
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
                        <Chip label={`${items.length}`} size="small" variant="outlined" />
                        <Button size="small" startIcon={<AddIcon />} onClick={() => handleOpenCreate(module.id)}>
                          Add
                        </Button>
                      </Box>

                      {viewMode === 'list' ? (
                        <List dense disablePadding sx={{ pl: 2 }}>
                          {items.map((item, index) => {
                            const typeInfo = ITEM_TYPES.find((t) => t.value === item.type);
                            return (
                              <ListItem
                                key={item.id}
                                divider
                                draggable
                                onDragStart={() => handleDragStart(module.id, index)}
                                onDragEnter={() => handleDragEnter(module.id, index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => e.preventDefault()}
                                sx={{ pl: 0, cursor: 'grab', '&:active': { cursor: 'grabbing' }, '&[draggable]:hover': { bgcolor: 'action.hover' }, transition: 'background-color 0.15s' }}
                              >
                                <Checkbox size="small" checked={selectedItems.has(item.id)} onChange={() => toggleSelect(item.id)} sx={{ mr: 0.5 }} />
                                <DragIcon sx={{ mr: 1, color: 'text.disabled', flexShrink: 0 }} />
                                <ListItemIcon sx={{ minWidth: 36, color: typeColors[item.type] }}>{typeInfo?.icon}</ListItemIcon>
                                <ListItemText
                                  primary={item.title}
                                  secondary={
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                                      <Chip label={typeInfo?.label} size="small" sx={{ bgcolor: typeColors[item.type] + '22', color: typeColors[item.type] }} />
                                      {item.tags.slice(0, 2).map((tag) => <Chip key={tag} label={tag} size="small" variant="outlined" />)}
                                    </Box>
                                  }
                                />
                                <ListItemSecondaryAction>
                                  <Tooltip title="Duplicate"><IconButton size="small" onClick={() => { duplicateItemAction(item.id); toast.success('Item duplicated'); }}><DuplicateIcon fontSize="small" /></IconButton></Tooltip>
                                  <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpenEdit(item)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                  <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteConfirm(item.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                </ListItemSecondaryAction>
                              </ListItem>
                            );
                          })}
                        </List>
                      ) : (
                        <Grid container spacing={1.5} sx={{ pl: 2 }}>
                          {items.map((item) => {
                            const typeInfo = ITEM_TYPES.find((t) => t.value === item.type);
                            return (
                              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={item.id}>
                                <Card variant="outlined" sx={{ transition: 'all 0.2s', '&:hover': { boxShadow: 3 } }}>
                                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                      <Box sx={{ color: typeColors[item.type] }}>{typeInfo?.icon}</Box>
                                      <Chip label={typeInfo?.label} size="small" sx={{ fontSize: 10 }} />
                                    </Box>
                                    <Typography variant="body2" fontWeight={600} noWrap>{item.title}</Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                                      <IconButton size="small" onClick={() => handleOpenEdit(item)}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                                      <IconButton size="small" onClick={() => { duplicateItemAction(item.id); toast.success('Duplicated'); }}><DuplicateIcon sx={{ fontSize: 16 }} /></IconButton>
                                      <IconButton size="small" color="error" onClick={() => setDeleteConfirm(item.id)}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                            );
                          })}
                        </Grid>
                      )}
                      {items.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 1, pl: 2 }}>No items yet</Typography>
                      )}
                    </Box>
                  );
                })}
              </AccordionDetails>
            </Accordion>
          );
        })
      )}

      {/* Item Creation Wizard */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingItem ? 'Edit Item' : 'Create New Item'}</DialogTitle>
        <DialogContent>
          {!editingItem && (
            <Stepper activeStep={wizardStep} sx={{ mb: 3, mt: 1 }}>
              {WIZARD_STEPS.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
            </Stepper>
          )}
          <Fade in key={wizardStep} timeout={200}>
            <Box>{renderWizardContent()}</Box>
          </Fade>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          {wizardStep > 0 && !editingItem && <Button onClick={() => setWizardStep(wizardStep - 1)}>Back</Button>}
          {(wizardStep < 3 && !editingItem) ? (
            <Button variant="contained" onClick={() => setWizardStep(wizardStep + 1)}
              disabled={wizardStep === 1 && (!formData.title.trim() || !formData.moduleId)}>
              Next
            </Button>
          ) : (
            <Button variant="contained" onClick={handleSubmit} disabled={!formData.title.trim() || !formData.moduleId}>
              {editingItem ? 'Save Changes' : 'Create Item'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={!!deleteConfirm} title="Delete Item" message="This item will be permanently deleted." confirmLabel="Delete" severity="error" onConfirm={handleDelete} onCancel={() => setDeleteConfirm(null)} />
      <ConfirmDialog open={bulkDeleteOpen} title="Delete Selected Items" message={`Delete ${selectedItems.size} selected items? This cannot be undone.`} confirmLabel="Delete All" severity="error" onConfirm={handleBulkDelete} onCancel={() => setBulkDeleteOpen(false)} />
    </Box>
  );
}
