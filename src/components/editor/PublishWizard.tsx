import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { CloudUpload as UploadIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useEditor } from '@/contexts/EditorContext';
import { diffContent } from '@/lib/editorStorage';

interface PublishWizardProps {
  open: boolean;
  onClose: () => void;
}

export function PublishWizard({ open, onClose }: PublishWizardProps) {
  const { content, productionContent, exportContent } = useEditor();

  if (!content || !productionContent) return null;
  const diff = diffContent(content, productionContent);

  const totalChanges =
    diff.coursesAdded +
    diff.coursesRemoved +
    diff.coursesChanged +
    diff.modulesAdded +
    diff.modulesRemoved +
    diff.itemsAdded +
    diff.itemsRemoved +
    diff.itemsChanged;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UploadIcon color="primary" />
          Publish Draft to Production
        </Box>
      </DialogTitle>
      <DialogContent>
        {totalChanges === 0 ? (
          <Alert severity="info">No changes detected — your draft matches production content.</Alert>
        ) : (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              {totalChanges} change{totalChanges !== 1 ? 's' : ''} pending vs production.
            </Alert>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Diff summary
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Courses" />
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {diff.coursesAdded > 0 && <Chip label={`+${diff.coursesAdded}`} size="small" color="success" />}
                  {diff.coursesChanged > 0 && <Chip label={`~${diff.coursesChanged}`} size="small" color="warning" />}
                  {diff.coursesRemoved > 0 && <Chip label={`-${diff.coursesRemoved}`} size="small" color="error" />}
                </Box>
              </ListItem>
              <ListItem>
                <ListItemText primary="Modules" />
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {diff.modulesAdded > 0 && <Chip label={`+${diff.modulesAdded}`} size="small" color="success" />}
                  {diff.modulesRemoved > 0 && <Chip label={`-${diff.modulesRemoved}`} size="small" color="error" />}
                </Box>
              </ListItem>
              <ListItem>
                <ListItemText primary="Items" />
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {diff.itemsAdded > 0 && <Chip label={`+${diff.itemsAdded}`} size="small" color="success" />}
                  {diff.itemsChanged > 0 && <Chip label={`~${diff.itemsChanged}`} size="small" color="warning" />}
                  {diff.itemsRemoved > 0 && <Chip label={`-${diff.itemsRemoved}`} size="small" color="error" />}
                </Box>
              </ListItem>
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              How to publish
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              1. Click <strong>Download index.json</strong> below.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              2. Replace <code>public/content/index.json</code> in the project with the downloaded file.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              3. Commit and deploy — students will see the new published content.
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={exportContent}
          disabled={totalChanges === 0}
        >
          Download index.json
        </Button>
      </DialogActions>
    </Dialog>
  );
}
