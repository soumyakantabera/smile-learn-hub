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
  QuizRounded,
  SmartDisplayRounded,
  Group as GroupIcon,
  TrendingUp as TrendingIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useEditor } from '@/contexts/EditorContext';
import { getItemVisual, ItemIconTile } from '@/lib/itemVisuals';



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
    { label: 'Courses', value: courses.length, icon: <SchoolIcon fontSize="small" />, color: 'hsl(var(--brand-forest))' },
    { label: 'Modules', value: modules.length, icon: <FolderIcon fontSize="small" />, color: 'hsl(var(--brand-amber))' },
    { label: 'Items', value: items.length, icon: <ItemIcon fontSize="small" />, color: 'hsl(var(--brand-coral))' },
    { label: 'Batches', value: batches.length, icon: <GroupIcon fontSize="small" />, color: 'hsl(var(--brand-mint))' },
    { label: 'Quizzes', value: quizCount, icon: <QuizRounded fontSize="small" />, color: 'hsl(var(--brand-forest))' },
    { label: 'Videos', value: videoCount, icon: <SmartDisplayRounded fontSize="small" />, color: 'hsl(var(--brand-coral))' },
  ];

  return (
    <Box>
      {/* Stats Grid — 3 per row on mobile, dense */}
      <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
        {statCards.map((stat) => (
          <Grid size={{ xs: 4, sm: 4, md: 2 }} key={stat.label}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent sx={{ py: { xs: 1.25, sm: 2 }, px: { xs: 0.75, sm: 1 }, '&:last-child': { pb: { xs: 1.25, sm: 2 } } }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    mx: 'auto',
                    mb: 0.75,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color,
                    bgcolor: 'action.hover',
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1.1rem', sm: '1.4rem' }, lineHeight: 1.1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.68rem', sm: '0.75rem' } }}>
                  {stat.label}
                </Typography>
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
                    const v = getItemVisual(type);
                    return (
                      <Box key={type}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Box sx={{ color: v.color, display: 'flex', '& svg': { fontSize: 18 } }}>{v.icon}</Box>
                          <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 600 }}>
                            {v.label}
                          </Typography>
                          <Typography variant="body2" fontWeight={700} sx={{ color: v.color }}>
                            {count}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({pct}%)
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            height: 8, borderRadius: 999, bgcolor: 'action.hover',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%', borderRadius: 999,
                              background: `linear-gradient(90deg, ${v.color}, ${v.color}aa)`,
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
                    <ListItem sx={{ px: 0, gap: 1.25 }}>
                      <ItemIconTile type={item.type} size={36} />
                      <ListItemText
                        primary={item.title}
                        secondary={new Date(item.publishedAt).toLocaleDateString()}
                        primaryTypographyProps={{ fontWeight: 600, noWrap: true }}
                      />
                      <Chip
                        label={getItemVisual(item.type).short}
                        size="small"
                        sx={{
                          bgcolor: getItemVisual(item.type).tint,
                          color: getItemVisual(item.type).color,
                          fontWeight: 700,
                        }}
                      />
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
