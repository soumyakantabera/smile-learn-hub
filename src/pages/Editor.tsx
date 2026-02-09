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
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Folder as FolderIcon,
  Description as ItemIcon,
  Group as GroupIcon,
  Visibility as PreviewIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { EditorProvider, useEditor } from '@/contexts/EditorContext';
import { AppLayout } from '@/components/AppLayout';
import { EditorDashboard } from '@/components/editor/EditorDashboard';
import { CourseEditor } from '@/components/editor/CourseEditor';
import { ModuleEditor } from '@/components/editor/ModuleEditor';
import { ItemEditor } from '@/components/editor/ItemEditor';
import { BatchEditor } from '@/components/editor/BatchEditor';
import { ContentPreview } from '@/components/editor/ContentPreview';

const TABS = [
  { label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Batches', icon: <GroupIcon fontSize="small" /> },
  { label: 'Courses', icon: <SchoolIcon fontSize="small" /> },
  { label: 'Modules', icon: <FolderIcon fontSize="small" /> },
  { label: 'Items', icon: <ItemIcon fontSize="small" /> },
  { label: 'Preview', icon: <PreviewIcon fontSize="small" /> },
];

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

  if (!session?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, flexDirection: 'column', gap: 2 }}>
          <CircularProgress />
          <Typography color="text.secondary">Loading editor...</Typography>
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
    setSnackbar({ open: true, message: 'Draft saved to local storage!', severity: 'success' });
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
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={800}>
              LMS Editor
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage courses, modules, content, and batches
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {isDirty && (
              <Chip
                icon={<WarningIcon />}
                label="Unsaved changes"
                size="small"
                color="warning"
                variant="filled"
              />
            )}
            {lastSaved && !isDirty && (
              <Chip
                label={`Saved ${new Date(lastSaved).toLocaleTimeString()}`}
                size="small"
                color="success"
                variant="outlined"
              />
            )}
            <Tooltip title="Discard draft and reload production data">
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleReset} size="small">
                Reset
              </Button>
            </Tooltip>
            <Tooltip title="Download content as JSON file">
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport} size="small">
                Export
              </Button>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!isDirty}
              size="small"
            >
              Save Draft
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Editor Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabIndex}
            onChange={(_, val) => setTabIndex(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            {TABS.map((tab, i) => (
              <Tab
                key={tab.label}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{ minHeight: 56, textTransform: 'none', fontWeight: 600 }}
              />
            ))}
          </Tabs>
        </Box>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {tabIndex === 0 && <EditorDashboard />}
          {tabIndex === 1 && <BatchEditor />}
          {tabIndex === 2 && <CourseEditor />}
          {tabIndex === 3 && <ModuleEditor />}
          {tabIndex === 4 && <ItemEditor />}
          {tabIndex === 5 && <ContentPreview />}
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
