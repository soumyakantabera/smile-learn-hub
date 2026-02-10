import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Avatar,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Fade,
} from '@mui/material';
import {
  School as SchoolIcon,
  Folder as FolderIcon,
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
  ExpandMore as ExpandMoreIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useEditor } from '@/contexts/EditorContext';
import type { ItemType, ContentItem, Course, Module } from '@/types/content';
import { QuizViewer } from '@/components/viewer/QuizViewer';
import { DevicePreviewFrame } from './DevicePreviewFrame';
import { EmptyState } from './EmptyState';

const typeIcons: Record<ItemType, React.ReactNode> = {
  pdf: <PdfIcon />, video: <VideoIcon />, doc: <DocIcon />, ppt: <PptIcon />,
  spreadsheet: <SpreadsheetIcon />, link: <LinkIcon />, homework: <HomeworkIcon />,
  youtube: <YouTubeIcon />, audio: <AudioIcon />, quiz: <QuizIcon />,
};

const typeLabels: Record<ItemType, string> = {
  pdf: 'PDF', video: 'Video', doc: 'Document', ppt: 'Presentation',
  spreadsheet: 'Spreadsheet', link: 'Link', homework: 'Homework',
  youtube: 'YouTube', audio: 'Audio', quiz: 'Quiz',
};

export function ContentPreview() {
  const { content } = useEditor();
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  if (!content) return null;

  const batches = Object.entries(content.batches);
  const activeBatch = selectedBatch ? content.batches[selectedBatch] : null;
  const batchCourses = activeBatch ? activeBatch.courses.map((id) => content.courses[id]).filter(Boolean) : [];

  const handleBack = () => {
    if (previewItem) { setPreviewItem(null); }
    else if (selectedModule) { setSelectedModule(null); }
    else if (selectedCourse) { setSelectedCourse(null); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6">Content Preview</Typography>
          <Typography variant="body2" color="text.secondary">Preview how students see the content</Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>View as Batch</InputLabel>
          <Select value={selectedBatch} label="View as Batch" onChange={(e) => {
            setSelectedBatch(e.target.value);
            setPreviewItem(null);
            setSelectedCourse(null);
            setSelectedModule(null);
          }}>
            <MenuItem value=""><em>Select a batch...</em></MenuItem>
            {batches.map(([key, batch]) => (
              <MenuItem key={key} value={key}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PersonIcon fontSize="small" />{batch.name}</Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {!selectedBatch && (
        <EmptyState icon={<ViewIcon />} title="Select a Batch" description="Choose a batch above to preview how students in that batch see courses and content." />
      )}

      {activeBatch && (
        <DevicePreviewFrame>
          {/* Navigation breadcrumb */}
          {(selectedCourse || previewItem) && (
            <Button startIcon={<BackIcon />} size="small" onClick={handleBack} sx={{ mb: 2 }}>
              Back
            </Button>
          )}

          {/* Item Preview */}
          {previewItem && (
            <Fade in>
              <Card sx={{ mb: 3, border: 2, borderColor: 'primary.main' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>📖 {previewItem.title}</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {previewItem.type === 'youtube' && previewItem.embedUrl && (
                    <Box sx={{ position: 'relative', pb: '56.25%', height: 0, borderRadius: 2, overflow: 'hidden' }}>
                      <iframe src={previewItem.embedUrl} title={previewItem.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </Box>
                  )}
                  {previewItem.type === 'audio' && previewItem.url && (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <AudioIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>Duration: {previewItem.audioDuration || 'Unknown'}</Typography>
                      <audio controls style={{ width: '100%', maxWidth: 500 }}><source src={previewItem.url} type="audio/mpeg" /></audio>
                    </Box>
                  )}
                  {previewItem.type === 'quiz' && <QuizViewer item={previewItem} />}
                  {previewItem.type === 'homework' && (
                    <Box>
                      <Alert severity="warning" sx={{ mb: 2 }}><Typography variant="subtitle2">Due: {previewItem.dueDate || 'No due date'}</Typography></Alert>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{previewItem.instructions}</Typography>
                    </Box>
                  )}
                  {['pdf', 'doc', 'ppt', 'spreadsheet', 'video', 'link'].includes(previewItem.type) && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Box sx={{ fontSize: 64, mb: 2 }}>{typeIcons[previewItem.type]}</Box>
                      <Typography variant="body1" gutterBottom>{previewItem.description}</Typography>
                      {previewItem.url && <Button variant="contained" href={previewItem.url} target="_blank">Open Resource</Button>}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Fade>
          )}

          {/* Course Detail View */}
          {!previewItem && selectedCourse && (
            <Fade in>
              <Box>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ width: 120, height: 80, borderRadius: 2, backgroundImage: `url(${selectedCourse.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={700}>{selectedCourse.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{selectedCourse.description}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip label={selectedCourse.level} size="small" color="primary" />
                          <Chip label={selectedCourse.instructor} size="small" variant="outlined" />
                          <Chip label={selectedCourse.duration} size="small" variant="outlined" />
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
                {selectedCourse.modules.map((id) => content.modules[id]).filter(Boolean).sort((a, b) => a.order - b.order).map((module) => {
                  const items = module.items.map((id) => content.items[id]).filter(Boolean);
                  return (
                    <Accordion key={module.id} variant="outlined" sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <FolderIcon color="primary" fontSize="small" />
                          <Box>
                            <Typography fontWeight={600} variant="body2">{module.title}</Typography>
                            <Typography variant="caption" color="text.secondary">{items.length} items</Typography>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <List dense disablePadding>
                          {items.map((item) => (
                            <ListItem key={item.id} divider sx={{ px: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => setPreviewItem(item)}>
                              <ListItemIcon sx={{ minWidth: 36 }}>{typeIcons[item.type]}</ListItemIcon>
                              <ListItemText primary={item.title} secondary={<Chip label={typeLabels[item.type]} size="small" />} />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Box>
            </Fade>
          )}

          {/* Courses Grid */}
          {!previewItem && !selectedCourse && (
            <Fade in>
              <Box>
                <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}><SchoolIcon /></Avatar>
                      <Box>
                        <Typography variant="h5" fontWeight={700}>{activeBatch.name}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>{activeBatch.description} • {batchCourses.length} course{batchCourses.length !== 1 ? 's' : ''}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Grid container spacing={2}>
                  {batchCourses.map((course) => {
                    const totalItems = course.modules.map((id) => content.modules[id]).filter(Boolean).reduce((sum, m) => sum + m.items.length, 0);
                    return (
                      <Grid size={{ xs: 12, sm: 6 }} key={course.id}>
                        <Card sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' } }} onClick={() => setSelectedCourse(course)}>
                          <Box sx={{ height: 100, backgroundImage: `url(${course.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                          <CardContent>
                            <Typography variant="subtitle1" fontWeight={700}>{course.title}</Typography>
                            <Typography variant="caption" color="text.secondary">{course.instructor} • {totalItems} items</Typography>
                            <Box sx={{ mt: 1 }}>
                              <LinearProgress variant="determinate" value={0} sx={{ height: 4, borderRadius: 1 }} />
                              <Typography variant="caption" color="text.secondary">0% complete</Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                {batchCourses.length === 0 && (
                  <Alert severity="warning">This batch has no courses assigned.</Alert>
                )}
              </Box>
            </Fade>
          )}
        </DevicePreviewFrame>
      )}
    </Box>
  );
}
