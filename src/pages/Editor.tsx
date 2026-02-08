import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { EditorProvider, useEditor } from '@/contexts/EditorContext';
import { AppLayout } from '@/components/AppLayout';
import { CourseEditor } from '@/components/editor/CourseEditor';
import { ModuleEditor } from '@/components/editor/ModuleEditor';
import { ItemEditor } from '@/components/editor/ItemEditor';

function EditorContent() {
  const { session } = useAuth();
  const {
    content,
    isLoading,
    isDirty,
    lastSaved,
    saveChanges,
    exportContent,
    resetToProduction,
  } = useEditor();

  const [tabIndex, setTabIndex] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Require admin access
  if (!session?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  if (!content) {
    return (
      <AppLayout>
        <Alert severity="error">Failed to load content for editing.</Alert>
      </AppLayout>
    );
  }

  const handleSave = () => {
    saveChanges();
    setSnackbar({ open: true, message: 'Changes saved to local storage!', severity: 'success' });
  };

  const handleExport = () => {
    exportContent();
    setSnackbar({ open: true, message: 'Content exported as JSON!', severity: 'success' });
  };

  const handleReset = async () => {
    if (window.confirm('This will discard all draft changes and reload from production. Continue?')) {
      await resetToProduction();
      setSnackbar({ open: true, message: 'Reset to production content.', severity: 'info' });
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Course Editor
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create and manage courses, modules, and content items
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {lastSaved && (
              <Chip
                label={`Saved ${new Date(lastSaved).toLocaleTimeString()}`}
                size="small"
                color={isDirty ? 'warning' : 'success'}
                variant="outlined"
              />
            )}
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleReset}
              size="small"
            >
              Reset
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              size="small"
            >
              Export JSON
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!isDirty}
            >
              Save Draft
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Editor Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={(_, val) => setTabIndex(val)}>
            <Tab label="Courses" />
            <Tab label="Modules" />
            <Tab label="Items" />
          </Tabs>
        </Box>
        <CardContent>
          {tabIndex === 0 && <CourseEditor />}
          {tabIndex === 1 && <ModuleEditor />}
          {tabIndex === 2 && <ItemEditor />}
        </CardContent>
      </Card>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </AppLayout>
  );
}

export default function EditorPage() {
  return (
    <EditorProvider>
      <EditorContent />
    </EditorProvider>
  );
}
