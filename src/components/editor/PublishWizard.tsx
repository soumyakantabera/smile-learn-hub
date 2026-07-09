import React, { useState } from 'react';
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
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  RocketLaunch as RocketIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useEditor } from '@/contexts/EditorContext';
import { useContent } from '@/contexts/ContentContext';
import { diffContent } from '@/lib/editorStorage';
import { gradientPrimaryBtnSx } from '@/theme/sxPresets';

interface PublishWizardProps {
  open: boolean;
  onClose: () => void;
}

export function PublishWizard({ open, onClose }: PublishWizardProps) {
  const { content, productionContent, exportContent, publishLive } = useEditor();
  const { refresh } = useContent();
  const [publishing, setPublishing] = useState(false);
  const [publishedAt, setPublishedAt] = useState<Date | null>(null);
  const [err, setErr] = useState('');

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

  const handlePublish = async () => {
    setErr('');
    setPublishing(true);
    try {
      await publishLive();
      await refresh();
      setPublishedAt(new Date());
      toast.success('Live for all learners');
    } catch (e: any) {
      setErr(e.message || 'Publish failed');
      toast.error(e.message || 'Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  const handleClose = () => {
    setPublishedAt(null);
    setErr('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RocketIcon color="primary" />
          Publish live
        </Box>
      </DialogTitle>
      <DialogContent>
        {publishedAt ? (
          <Alert
            icon={<CheckIcon fontSize="inherit" />}
            severity="success"
            sx={{ borderRadius: 2 }}
          >
            <strong>Live for all learners.</strong> Published at{' '}
            {publishedAt.toLocaleTimeString()}. Students see the update on their next
            page load.
          </Alert>
        ) : (
          <>
            {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
            {totalChanges === 0 ? (
              <Alert severity="info">
                No changes detected — your draft matches the live content.
              </Alert>
            ) : (
              <>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Publishing pushes {totalChanges} change{totalChanges !== 1 ? 's' : ''}{' '}
                  live to <strong>every learner</strong> immediately.
                </Alert>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Diff summary
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Courses" />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {diff.coursesAdded > 0 && (
                        <Chip label={`+${diff.coursesAdded}`} size="small" color="success" />
                      )}
                      {diff.coursesChanged > 0 && (
                        <Chip
                          label={`~${diff.coursesChanged}`}
                          size="small"
                          color="warning"
                        />
                      )}
                      {diff.coursesRemoved > 0 && (
                        <Chip label={`-${diff.coursesRemoved}`} size="small" color="error" />
                      )}
                    </Box>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Modules" />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {diff.modulesAdded > 0 && (
                        <Chip label={`+${diff.modulesAdded}`} size="small" color="success" />
                      )}
                      {diff.modulesRemoved > 0 && (
                        <Chip label={`-${diff.modulesRemoved}`} size="small" color="error" />
                      )}
                    </Box>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Items" />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {diff.itemsAdded > 0 && (
                        <Chip label={`+${diff.itemsAdded}`} size="small" color="success" />
                      )}
                      {diff.itemsChanged > 0 && (
                        <Chip
                          label={`~${diff.itemsChanged}`}
                          size="small"
                          color="warning"
                        />
                      )}
                      {diff.itemsRemoved > 0 && (
                        <Chip label={`-${diff.itemsRemoved}`} size="small" color="error" />
                      )}
                    </Box>
                  </ListItem>
                </List>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  A JSON backup can also be downloaded for version control.
                </Typography>
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Button onClick={handleClose}>Close</Button>
        <Button
          startIcon={<DownloadIcon />}
          onClick={exportContent}
          disabled={totalChanges === 0 && !publishedAt}
        >
          Download JSON backup
        </Button>
        {!publishedAt && (
          <Button
            variant="contained"
            startIcon={publishing ? <CircularProgress size={16} color="inherit" /> : <UploadIcon />}
            onClick={handlePublish}
            disabled={totalChanges === 0 || publishing}
            sx={gradientPrimaryBtnSx}
          >
            {publishing ? 'Publishing…' : 'Publish live now'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
