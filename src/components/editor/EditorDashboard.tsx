import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  Folder as FolderIcon,
  Description as ItemIcon,
  Quiz as QuizIcon,
  Group as GroupIcon,
  Assignment as HomeworkIcon,
  YouTube as YouTubeIcon,
  Audiotrack as AudioIcon,
  TrendingUp as TrendingIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useEditor } from '@/contexts/EditorContext';
import type { ItemType } from '@/types/content';

const typeColors: Record<string, string> = {
  pdf: '#D32F2F',
  video: '#1976D2',
  doc: '#2196F3',
  ppt: '#FF5722',
  spreadsheet: '#4CAF50',
  link: '#9C27B0',
  homework: '#FF9800',
  youtube: '#FF0000',
  audio: '#E91E63',
  quiz: '#673AB7',
};

export function EditorDashboard() {
  const { content, lastSaved } = useEditor();

  if (!content) return null;

  const courses = Object.values(content.courses);
  const modules = Object.values(content.modules);
  const items = Object.values(content.items);
  const batches = Object.entries(content.batches);

  // Stats
  const quizCount = items.filter((i) => i.type === 'quiz').length;
  const homeworkCount = items.filter((i) => i.type === 'homework').length;
  const videoCount = items.filter((i) => i.type === 'youtube' || i.type === 'video').length;
  const audioCount = items.filter((i) => i.type === 'audio').length;

  // Type distribution
  const typeDist: Record<string, number> = {};
  items.forEach((item) => {
    typeDist[item.type] = (typeDist[item.type] || 0) + 1;
  });

  // Recent items
  const recentItems = [...items]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 5);

  const statCards = [
    { label: 'Courses', value: courses.length, icon: <SchoolIcon />, color: '#1976D2' },
    { label: 'Modules', value: modules.length, icon: <FolderIcon />, color: '#2E7D32' },
    { label: 'Content Items', value: items.length, icon: <ItemIcon />, color: '#ED6C02' },
    { label: 'Batches', value: batches.length, icon: <GroupIcon />, color: '#9C27B0' },
    { label: 'Quizzes', value: quizCount, icon: <QuizIcon />, color: '#673AB7' },
    { label: 'Videos', value: videoCount, icon: <YouTubeIcon />, color: '#D32F2F' },
  ];

  return (
    <Box>
      {/* Stats Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((stat) => (
          <Grid size={{ xs: 6, sm: 4, md: 2 }} key={stat.label}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent sx={{ py: 2, px: 1, '&:last-child': { pb: 2 } }}>
                <Avatar sx={{ bgcolor: stat.color, width: 36, height: 36, mx: 'auto', mb: 1 }}>
                  {stat.icon}
                </Avatar>
                <Typography variant="h5" fontWeight={800}>{stat.value}</Typography>
                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Content Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                <TrendingIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
                Content Distribution
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                {Object.entries(typeDist)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => {
                    const pct = Math.round((count / items.length) * 100);
                    return (
                      <Box key={type}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" textTransform="capitalize">
                            {type}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {count} ({pct}%)
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            height: 8, borderRadius: 1, bgcolor: 'action.hover',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%', borderRadius: 1,
                              bgcolor: typeColors[type] || 'primary.main',
                              width: `${pct}%`, transition: 'width 0.5s ease',
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recently Added */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
                Recently Added Items
              </Typography>
              <List dense disablePadding>
                {recentItems.map((item, i) => (
                  <React.Fragment key={item.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36, color: typeColors[item.type] }}>
                        {item.type === 'quiz' ? <QuizIcon /> : item.type === 'homework' ? <HomeworkIcon /> :
                          item.type === 'youtube' ? <YouTubeIcon /> : item.type === 'audio' ? <AudioIcon /> : <ItemIcon />}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        secondary={new Date(item.publishedAt).toLocaleDateString()}
                      />
                      <Chip label={item.type} size="small" />
                    </ListItem>
                    {i < recentItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Course Summary */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
                Course Summary
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {courses.map((course) => {
                  const courseModules = course.modules.map((id) => content.modules[id]).filter(Boolean);
                  const courseItems = courseModules.reduce((sum, m) => sum + m.items.length, 0);
                  const courseQuizzes = courseModules.reduce((sum, m) => {
                    return sum + m.items.filter((iId) => content.items[iId]?.type === 'quiz').length;
                  }, 0);

                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={course.id}>
                      <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                        <Typography fontWeight={700} gutterBottom>{course.title}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip label={`${courseModules.length} modules`} size="small" />
                          <Chip label={`${courseItems} items`} size="small" />
                          <Chip label={`${courseQuizzes} quizzes`} size="small" color="secondary" />
                          <Chip label={course.level || 'N/A'} size="small" variant="outlined" />
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
