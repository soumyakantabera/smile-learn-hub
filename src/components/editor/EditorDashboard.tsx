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
  Button,
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
  Add as AddIcon,
  VideoLibrary as VideoIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEditor } from '@/contexts/EditorContext';
import { ContentHealthCheck } from './ContentHealthCheck';

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

  const quizCount = items.filter((i) => i.type === 'quiz').length;
  const videoCount = items.filter((i) => i.type === 'youtube' || i.type === 'video').length;

  // Type distribution for charts
  const typeDist: Record<string, number> = {};
  items.forEach((item) => {
    typeDist[item.type] = (typeDist[item.type] || 0) + 1;
  });
  const pieData = Object.entries(typeDist).map(([name, value]) => ({ name, value }));

  // Course stats for bar chart
  const courseBarData = courses.map((c) => {
    const mods = c.modules.map((id) => content.modules[id]).filter(Boolean);
    const itemCount = mods.reduce((sum, m) => sum + m.items.length, 0);
    return { name: c.title.length > 15 ? c.title.slice(0, 15) + '…' : c.title, modules: mods.length, items: itemCount };
  });

  // Recent items
  const recentItems = [...items]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 5);

  const statCards = [
    { label: 'Courses', value: courses.length, icon: <SchoolIcon />, color: '#1976D2' },
    { label: 'Modules', value: modules.length, icon: <FolderIcon />, color: '#2E7D32' },
    { label: 'Items', value: items.length, icon: <ItemIcon />, color: '#ED6C02' },
    { label: 'Batches', value: batches.length, icon: <GroupIcon />, color: '#9C27B0' },
    { label: 'Quizzes', value: quizCount, icon: <QuizIcon />, color: '#673AB7' },
    { label: 'Videos', value: videoCount, icon: <VideoIcon />, color: '#D32F2F' },
  ];

  return (
    <Box>
      {/* Stats Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((stat) => (
          <Grid size={{ xs: 6, sm: 4, md: 2 }} key={stat.label}>
            <Card sx={{ textAlign: 'center', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}>
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

      {/* Health Check */}
      <Box sx={{ mb: 3 }}>
        <ContentHealthCheck />
      </Box>

      <Grid container spacing={3}>
        {/* Pie Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                <TrendingIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
                Content Distribution
              </Typography>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={typeColors[entry.name] || '#888'} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
                  No content items yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Bar Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
                Course Overview
              </Typography>
              {courseBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={courseBarData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="modules" fill="#1976D2" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="items" fill="#ED6C02" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
                  No courses yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recently Added */}
        <Grid size={12}>
          <Card>
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
                      <Chip label={item.type} size="small" sx={{ bgcolor: typeColors[item.type] + '22', color: typeColors[item.type] }} />
                    </ListItem>
                    {i < recentItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
                {recentItems.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No items yet
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
