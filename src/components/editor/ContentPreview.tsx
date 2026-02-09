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
} from '@mui/icons-material';
import { useEditor } from '@/contexts/EditorContext';
import type { ItemType, ContentItem } from '@/types/content';
import { QuizViewer } from '@/components/viewer/QuizViewer';

const typeIcons: Record<ItemType, React.ReactNode> = {
  pdf: <PdfIcon />,
  video: <VideoIcon />,
  doc: <DocIcon />,
  ppt: <PptIcon />,
  spreadsheet: <SpreadsheetIcon />,
  link: <LinkIcon />,
  homework: <HomeworkIcon />,
  youtube: <YouTubeIcon />,
  audio: <AudioIcon />,
  quiz: <QuizIcon />,
};

const typeLabels: Record<ItemType, string> = {
  pdf: 'PDF',
  video: 'Video',
  doc: 'Document',
  ppt: 'Presentation',
  spreadsheet: 'Spreadsheet',
  link: 'Link',
  homework: 'Homework',
  youtube: 'YouTube',
  audio: 'Audio',
  quiz: 'Quiz',
};

export function ContentPreview() {
  const { content } = useEditor();
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);

  if (!content) return null;

  const batches = Object.entries(content.batches);
  const activeBatch = selectedBatch ? content.batches[selectedBatch] : null;
  const batchCourses = activeBatch
    ? activeBatch.courses.map((id) => content.courses[id]).filter(Boolean)
    : [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6">Content Preview</Typography>
          <Typography variant="body2" color="text.secondary">
            Preview how students see the content
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>View as Batch</InputLabel>
          <Select
            value={selectedBatch}
            label="View as Batch"
            onChange={(e) => {
              setSelectedBatch(e.target.value);
              setPreviewItem(null);
            }}
          >
            <MenuItem value="">
              <em>Select a batch...</em>
            </MenuItem>
            {batches.map(([key, batch]) => (
              <MenuItem key={key} value={key}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" />
                  {batch.name}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {!selectedBatch && (
        <Alert severity="info" icon={<ViewIcon />}>
          Select a batch above to preview how students in that batch see the courses and content.
        </Alert>
      )}

      {/* Item Preview Modal */}
      {previewItem && (
        <Card sx={{ mb: 3, border: 2, borderColor: 'primary.main' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                📖 Previewing: {previewItem.title}
              </Typography>
              <Button size="small" variant="outlined" onClick={() => setPreviewItem(null)}>
                Close Preview
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {previewItem.type === 'youtube' && previewItem.embedUrl && (
              <Box sx={{ position: 'relative', pb: '56.25%', height: 0, borderRadius: 2, overflow: 'hidden' }}>
                <iframe
                  src={previewItem.embedUrl}
                  title={previewItem.title}
                  style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '100%', height: '100%', border: 0,
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </Box>
            )}

            {previewItem.type === 'audio' && previewItem.url && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <AudioIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Duration: {previewItem.audioDuration || 'Unknown'}
                </Typography>
                <audio controls style={{ width: '100%', maxWidth: 500 }}>
                  <source src={previewItem.url} type="audio/mpeg" />
                </audio>
              </Box>
            )}

            {previewItem.type === 'quiz' && (
              <QuizViewer item={previewItem} />
            )}

            {previewItem.type === 'homework' && (
              <Box>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Due: {previewItem.dueDate || 'No due date'}</Typography>
                </Alert>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {previewItem.instructions}
                </Typography>
              </Box>
            )}

            {['pdf', 'doc', 'ppt', 'spreadsheet', 'video', 'link'].includes(previewItem.type) && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{ fontSize: 64, mb: 2 }}>{typeIcons[previewItem.type]}</Box>
                <Typography variant="body1" gutterBottom>{previewItem.description}</Typography>
                {previewItem.url && (
                  <Button variant="contained" href={previewItem.url} target="_blank">
                    Open Resource
                  </Button>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Student View */}
      {activeBatch && (
        <Box>
          {/* Batch header card */}
          <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <SchoolIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{activeBatch.name}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {activeBatch.description} • {batchCourses.length} course{batchCourses.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Courses grid */}
          <Grid container spacing={3}>
            {batchCourses.map((course) => {
              const courseModules = course.modules
                .map((id) => content.modules[id])
                .filter(Boolean)
                .sort((a, b) => a.order - b.order);
              const totalItems = courseModules.reduce((sum, m) => sum + m.items.length, 0);

              return (
                <Grid size={12} key={course.id}>
                  <Card>
                    <CardContent>
                      {/* Course header */}
                      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                        <Box
                          sx={{
                            width: 120, height: 80, borderRadius: 2,
                            backgroundImage: `url(${course.thumbnail})`,
                            backgroundSize: 'cover', backgroundPosition: 'center',
                            flexShrink: 0,
                          }}
                        />
                        <Box sx={{ flex: 1, minWidth: 200 }}>
                          <Typography variant="h6" fontWeight={700}>{course.title}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {course.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip label={course.level} size="small" color="primary" />
                            <Chip label={course.instructor} size="small" variant="outlined" />
                            <Chip label={course.duration} size="small" variant="outlined" />
                            <Chip label={`${totalItems} items`} size="small" variant="outlined" />
                          </Box>
                        </Box>
                      </Box>

                      {/* Progress simulation */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">Course Progress (preview)</Typography>
                          <Typography variant="caption" color="text.secondary">0%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={0} sx={{ height: 6, borderRadius: 1 }} />
                      </Box>

                      {/* Modules */}
                      {courseModules.map((module) => {
                        const items = module.items.map((id) => content.items[id]).filter(Boolean);
                        return (
                          <Accordion key={module.id} variant="outlined" sx={{ mb: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <FolderIcon color="primary" fontSize="small" />
                                <Box>
                                  <Typography fontWeight={600} variant="body2">
                                    {module.title}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {items.length} items • {module.description}
                                  </Typography>
                                </Box>
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0 }}>
                              <List dense disablePadding>
                                {items.map((item) => (
                                  <ListItem
                                    key={item.id}
                                    divider
                                    secondaryAction={
                                      <Button
                                        size="small"
                                        startIcon={<ViewIcon />}
                                        onClick={() => setPreviewItem(item)}
                                      >
                                        Preview
                                      </Button>
                                    }
                                    sx={{ px: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                                    onClick={() => setPreviewItem(item)}
                                  >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      {typeIcons[item.type]}
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={item.title}
                                      secondary={
                                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                                          <Chip label={typeLabels[item.type]} size="small" />
                                          {item.tags.slice(0, 2).map((t) => (
                                            <Chip key={t} label={t} size="small" variant="outlined" />
                                          ))}
                                        </Box>
                                      }
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </AccordionDetails>
                          </Accordion>
                        );
                      })}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {batchCourses.length === 0 && (
            <Alert severity="warning">
              This batch has no courses assigned. Edit the batch to assign courses.
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
}
