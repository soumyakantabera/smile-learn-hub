import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Breadcrumbs,
  Fade,
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
  ChevronLeft as CollapseIcon,
  Menu as MenuIcon,
  Keyboard as KeyboardIcon,
  NavigateNext as BreadcrumbIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { EditorProvider, useEditor } from '@/contexts/EditorContext';
import { AppLayout } from '@/components/AppLayout';
import { EditorDashboard } from '@/components/editor/EditorDashboard';
import { CourseEditor } from '@/components/editor/CourseEditor';
import { ModuleEditor } from '@/components/editor/ModuleEditor';
import { ItemEditor } from '@/components/editor/ItemEditor';
import { BatchEditor } from '@/components/editor/BatchEditor';
import { ContentPreview } from '@/components/editor/ContentPreview';
import { ContentSearch } from '@/components/editor/ContentSearch';
import { ConfirmDialog } from '@/components/editor/ConfirmDialog';

const SECTIONS = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { key: 'batches', label: 'Batches', icon: <GroupIcon /> },
  { key: 'courses', label: 'Courses', icon: <SchoolIcon /> },
  { key: 'modules', label: 'Modules', icon: <FolderIcon /> },
  { key: 'items', label: 'Items', icon: <ItemIcon /> },
  { key: 'preview', label: 'Preview', icon: <PreviewIcon /> },
];

const DRAWER_WIDTH = 220;
const DRAWER_COLLAPSED = 64;

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

  const [activeSection, setActiveSection] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty) {
          saveChanges();
          toast.success('Draft saved!');
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isDirty, saveChanges]);

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
    toast.success('Draft saved to local storage!');
  };

  const handleExport = () => {
    exportContent();
    toast.success('Content exported as JSON!');
  };

  const handleReset = async () => {
    await resetToProduction();
    setResetDialogOpen(false);
    toast.info('Reset to production content.');
  };

  const currentSection = SECTIONS.find((s) => s.key === activeSection) || SECTIONS[0];

  return (
    <AppLayout>
      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        {/* Sidebar Drawer */}
        <Box
          sx={{
            width: drawerOpen ? DRAWER_WIDTH : DRAWER_COLLAPSED,
            flexShrink: 0,
            transition: 'width 0.2s ease',
          }}
        >
          <Box
            sx={{
              position: 'sticky',
              top: 80,
              width: drawerOpen ? DRAWER_WIDTH : DRAWER_COLLAPSED,
              transition: 'width 0.2s ease',
              borderRight: 1,
              borderColor: 'divider',
              height: 'calc(100vh - 80px)',
              overflow: 'hidden',
              bgcolor: 'background.paper',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: drawerOpen ? 'space-between' : 'center', p: 1.5 }}>
              {drawerOpen && (
                <Typography variant="subtitle2" fontWeight={800} color="primary" noWrap>
                  LMS Editor
                </Typography>
              )}
              <IconButton size="small" onClick={() => setDrawerOpen(!drawerOpen)}>
                {drawerOpen ? <CollapseIcon /> : <MenuIcon />}
              </IconButton>
            </Box>
            <Divider />
            <List disablePadding sx={{ px: 0.5, pt: 0.5 }}>
              {SECTIONS.map((section) => (
                <ListItemButton
                  key={section.key}
                  selected={activeSection === section.key}
                  onClick={() => setActiveSection(section.key)}
                  sx={{
                    borderRadius: 1.5,
                    mb: 0.5,
                    minHeight: 44,
                    justifyContent: drawerOpen ? 'initial' : 'center',
                    px: drawerOpen ? 2 : 1,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: drawerOpen ? 1.5 : 0,
                      justifyContent: 'center',
                      color: activeSection === section.key ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {section.icon}
                  </ListItemIcon>
                  {drawerOpen && (
                    <ListItemText
                      primary={section.label}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: activeSection === section.key ? 700 : 500,
                      }}
                    />
                  )}
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1, minWidth: 0, pl: 3 }}>
          {/* Sticky Toolbar */}
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              bgcolor: 'background.default',
              pb: 2,
              pt: 1,
            }}
          >
            {/* Breadcrumbs */}
            <Breadcrumbs separator={<BreadcrumbIcon fontSize="small" />} sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Editor
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {currentSection.label}
              </Typography>
            </Breadcrumbs>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5" fontWeight={800}>
                  {currentSection.label}
                </Typography>
                {isDirty && (
                  <Chip icon={<WarningIcon />} label="Unsaved" size="small" color="warning" variant="filled" />
                )}
                {lastSaved && !isDirty && (
                  <Chip
                    label={`Saved ${new Date(lastSaved).toLocaleTimeString()}`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <ContentSearch onNavigate={(section) => setActiveSection(section)} />
                <Tooltip title="Ctrl+S to save">
                  <IconButton size="small" sx={{ opacity: 0.5 }}>
                    <KeyboardIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={() => setResetDialogOpen(true)}>
                  Reset
                </Button>
                <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={handleExport}>
                  Export
                </Button>
                <Button variant="contained" size="small" startIcon={<SaveIcon />} onClick={handleSave} disabled={!isDirty}>
                  Save Draft
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Content Area */}
          <Fade in key={activeSection} timeout={250}>
            <Box>
              {activeSection === 'dashboard' && <EditorDashboard />}
              {activeSection === 'batches' && <BatchEditor />}
              {activeSection === 'courses' && <CourseEditor />}
              {activeSection === 'modules' && <ModuleEditor />}
              {activeSection === 'items' && <ItemEditor />}
              {activeSection === 'preview' && <ContentPreview />}
            </Box>
          </Fade>
        </Box>
      </Box>

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        open={resetDialogOpen}
        title="Reset to Production"
        message="This will discard all draft changes and reload from production content. This action cannot be undone."
        confirmLabel="Reset"
        severity="warning"
        onConfirm={handleReset}
        onCancel={() => setResetDialogOpen(false)}
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
