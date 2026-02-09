import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Avatar,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useEditor } from '@/contexts/EditorContext';
import type { Batch } from '@/types/content';

interface BatchFormData {
  key: string;
  name: string;
  description: string;
  courses: string[];
}

const defaultFormData: BatchFormData = {
  key: '',
  name: '',
  description: '',
  courses: [],
};

export function BatchEditor() {
  const { content, createBatch, editBatch, removeBatch } = useEditor();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formData, setFormData] = useState<BatchFormData>(defaultFormData);

  if (!content) return null;

  const batches = Object.entries(content.batches);
  const allCourses = Object.values(content.courses);

  const handleOpenCreate = () => {
    setEditingKey(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (key: string, batch: Batch) => {
    setEditingKey(key);
    setFormData({
      key,
      name: batch.name,
      description: batch.description,
      courses: batch.courses,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (editingKey) {
      editBatch(editingKey, {
        name: formData.name,
        description: formData.description,
        courses: formData.courses,
      });
    } else {
      const key = formData.key.trim() || `batch-${Date.now()}`;
      createBatch(key, {
        name: formData.name,
        description: formData.description,
        courses: formData.courses,
      });
    }
    setDialogOpen(false);
  };

  const handleDelete = (key: string) => {
    if (window.confirm('Delete this batch? Students using this batch passcode will lose access.')) {
      removeBatch(key);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6">Batches ({batches.length})</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage student groups and assign courses
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Create Batch
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Each batch maps to a passcode in <code>passcodes.json</code>. After creating a batch here, add its key to the passcode file with a SHA-256 hashed passcode.
      </Alert>

      <Grid container spacing={3}>
        {batches.map(([key, batch]) => {
          const assignedCourses = batch.courses
            .map((id) => content.courses[id])
            .filter(Boolean);
          const totalModules = assignedCourses.reduce((sum, c) => sum + c.modules.length, 0);
          const totalItems = assignedCourses.reduce((sum, c) => {
            return sum + c.modules.reduce((mSum, mId) => {
              const mod = content.modules[mId];
              return mSum + (mod?.items.length || 0);
            }, 0);
          }, 0);

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={key}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                      <GroupIcon />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>
                        {batch.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {key}
                        </Typography>
                        <Tooltip title="Copy batch key">
                          <IconButton size="small" onClick={() => navigator.clipboard.writeText(key)} sx={{ p: 0.25 }}>
                            <CopyIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {batch.description}
                  </Typography>

                  {/* Stats */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip icon={<SchoolIcon />} label={`${assignedCourses.length} courses`} size="small" variant="outlined" />
                    <Chip label={`${totalModules} modules`} size="small" variant="outlined" />
                    <Chip label={`${totalItems} items`} size="small" variant="outlined" />
                  </Box>

                  {/* Assigned courses */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {assignedCourses.map((course) => (
                      <Box key={course.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                        <Typography variant="body2" noWrap>{course.title}</Typography>
                      </Box>
                    ))}
                    {assignedCourses.length === 0 && (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        No courses assigned
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', borderTop: 1, borderColor: 'divider' }}>
                  <IconButton size="small" onClick={() => handleOpenEdit(key, batch)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(key)}
                    disabled={key === 'batch-admin'}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Batch Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingKey ? 'Edit Batch' : 'Create New Batch'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {!editingKey && (
              <TextField
                label="Batch Key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value.replace(/[^a-z0-9-]/g, '') })}
                fullWidth
                placeholder="batch-2026-c"
                helperText="Lowercase alphanumeric with hyphens. Used in passcodes.json."
              />
            )}
            <TextField
              label="Batch Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              placeholder="e.g., Batch 2026 - Section C"
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="Brief description of this batch..."
            />
            <FormControl fullWidth>
              <InputLabel>Assign Courses</InputLabel>
              <Select
                multiple
                value={formData.courses}
                onChange={(e) => setFormData({ ...formData, courses: e.target.value as string[] })}
                input={<OutlinedInput label="Assign Courses" />}
                renderValue={(selected) =>
                  selected.map((id) => content.courses[id]?.title || id).join(', ')
                }
              >
                {allCourses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    <Checkbox checked={formData.courses.includes(course.id)} />
                    <ListItemText primary={course.title} secondary={`${course.level} • ${course.duration}`} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!formData.name.trim()}>
            {editingKey ? 'Save Changes' : 'Create Batch'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
