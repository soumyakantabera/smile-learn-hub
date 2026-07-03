import React, { useState, useEffect, useRef } from 'react';
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
  CircularProgress,
  Chip,
  Tooltip,
  IconButton,
  Breadcrumbs,
  Link as MuiLink,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Save as SaveIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Folder as FolderIcon,
  Description as ItemIcon,
  Group as GroupIcon,
  Visibility as PreviewIcon,
  Warning as WarningIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  CloudUpload as PublishIcon,
  History as HistoryIcon,
  Keyboard as KeyboardIcon,
  Storage as StorageIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
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
import { ConfirmDialog } from '@/components/editor/ConfirmDialog';
import { PublishWizard } from '@/components/editor/PublishWizard';
import { importDraftFromFile } from '@/lib/editorStorage';
import { PageHeader } from '@/components/PageHeader';


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
    draftSizeKB,
    canUndo,
    canRedo,
    saveChanges,
    exportContent,
    importContent,
    resetToProduction,
    undo,
    redo,
    getSnapshots,
    restoreFromSnapshot,
  } = useEditor();

  const [tabIndex, setTabIndex] = useState(0);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [snapAnchor, setSnapAnchor] = useState<null | HTMLElement>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === 's') {
        e.preventDefault();
        saveChanges();
        toast.success('Draft saved');
      } else if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [saveChanges, undo, redo]);

  if (!session?.isAdmin) return <Navigate to="/" replace />;

  if (isLoading) {
    return (
      <AppLayout>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 8,
            flexDirection: 'column',
            gap: 2,
          }}
        >
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
    toast.success('Draft saved to local storage');
  };

  const handleExport = () => {
    exportContent();
    toast.success('Content exported as JSON');
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importDraftFromFile(file);
      importContent(data);
      toast.success('Content imported successfully');
    } catch (err) {
      toast.error(`Import failed: ${(err as Error).message}`);
    } finally {
      e.target.value = '';
    }
  };

  const snapshots = getSnapshots();

  return (
    <AppLayout>
      <PageHeader
        icon={TABS[tabIndex].icon}
        iconColor="hsl(280, 70%, 55%)"
        title="LMS Editor"
        subtitle="Manage courses, modules, content, and batches"
        crumbs={[
          { label: 'Home', to: '/', icon: <DashboardIcon /> },
          { label: 'Editor', icon: <EditIcon /> },
          { label: TABS[tabIndex].label, icon: TABS[tabIndex].icon },
        ]}
        meta={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {isDirty ? (
              <Chip icon={<WarningIcon />} label="Unsaved changes" size="small" color="warning" />
            ) : lastSaved ? (
              <Chip
                icon={<SaveIcon />}
                label={`Saved ${new Date(lastSaved).toLocaleTimeString()}`}
                size="small"
                color="success"
                variant="outlined"
              />
            ) : null}
            {draftSizeKB > 0 && (
              <Tooltip title="Draft size in localStorage">
                <Chip icon={<StorageIcon />} label={`${draftSizeKB} KB`} size="small" variant="outlined" />
              </Tooltip>
            )}
          </Box>
        }
        actions={
          <>
            {/* Desktop actions */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, flexWrap: 'wrap' }}>
              <Tooltip title="Undo (Ctrl+Z)"><span><IconButton size="small" onClick={undo} disabled={!canUndo}><UndoIcon fontSize="small" /></IconButton></span></Tooltip>
              <Tooltip title="Redo (Ctrl+Shift+Z)"><span><IconButton size="small" onClick={redo} disabled={!canRedo}><RedoIcon fontSize="small" /></IconButton></span></Tooltip>
              <Tooltip title="Snapshots"><span><IconButton size="small" onClick={(e) => setSnapAnchor(e.currentTarget)} disabled={snapshots.length === 0}><HistoryIcon fontSize="small" /></IconButton></span></Tooltip>
              <Tooltip title="Shortcuts"><IconButton size="small" onClick={() => setShortcutsOpen(true)}><KeyboardIcon fontSize="small" /></IconButton></Tooltip>
              <Button variant="outlined" startIcon={<UploadIcon />} onClick={handleImportClick} size="small">Import</Button>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport} size="small">Export</Button>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => setResetConfirm(true)} size="small" color="warning">Reset</Button>
              <Button variant="contained" color="success" startIcon={<PublishIcon />} onClick={() => setPublishOpen(true)} size="small">Publish</Button>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={!isDirty} size="small" sx={{ bgcolor: '#0F3D2E', '&:hover': { bgcolor: '#0a2c22' } }}>Save</Button>
            </Box>
            <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleImportFile} />
            {/* Mobile compact actions */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 0.5, alignItems: 'center' }}>
              <IconButton size="small" onClick={undo} disabled={!canUndo}><UndoIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={redo} disabled={!canRedo}><RedoIcon fontSize="small" /></IconButton>
              <Button variant="contained" size="small" startIcon={<SaveIcon />} onClick={handleSave} disabled={!isDirty} sx={{ bgcolor: '#0F3D2E', '&:hover': { bgcolor: '#0a2c22' } }}>Save</Button>
              <IconButton size="small" onClick={(e) => setSnapAnchor(e.currentTarget as HTMLElement & { __menu?: string })} aria-label="More actions">
                <MoreVertIcon />
              </IconButton>
            </Box>
          </>
        }
      />


      <Menu anchorEl={snapAnchor} open={!!snapAnchor} onClose={() => setSnapAnchor(null)}>
        <MenuItem disabled>
          <Typography variant="caption">Recent snapshots</Typography>
        </MenuItem>
        <Divider />
        {snapshots.length === 0 && (
          <MenuItem disabled>
            <Typography variant="body2">No snapshots yet</Typography>
          </MenuItem>
        )}
        {snapshots.map((s) => (
          <MenuItem
            key={s.id}
            onClick={() => {
              restoreFromSnapshot(s.id);
              toast.success('Snapshot restored');
              setSnapAnchor(null);
            }}
          >
            <ListItemIcon>
              <HistoryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={new Date(s.takenAt).toLocaleString()} secondary={`${s.sizeKB} KB`} />
          </MenuItem>
        ))}
      </Menu>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabIndex}
            onChange={(_, val) => setTabIndex(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            {TABS.map((tab) => (
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

      <ConfirmDialog
        open={resetConfirm}
        title="Reset to production?"
        message="This will discard all unsaved draft changes and reload from the published content. This cannot be undone."
        destructive
        confirmLabel="Reset"
        onConfirm={async () => {
          await resetToProduction();
          toast.info('Reset to production content');
        }}
        onClose={() => setResetConfirm(false)}
      />

      <PublishWizard open={publishOpen} onClose={() => setPublishOpen(false)} />

      <ConfirmDialog
        open={shortcutsOpen}
        title="Keyboard shortcuts"
        message="Ctrl/Cmd+S — Save draft   •   Ctrl/Cmd+Z — Undo   •   Ctrl/Cmd+Shift+Z or Ctrl+Y — Redo"
        confirmLabel="Got it"
        onConfirm={() => {}}
        onClose={() => setShortcutsOpen(false)}
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
