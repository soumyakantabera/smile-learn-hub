import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  Skeleton,
  Grid,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Insights as InsightsIcon,
  Workspaces as WorkspacesIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { listUsers, type AdminUser } from '@/lib/adminApi';
import { useContent } from '@/contexts/ContentContext';

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [err, setErr] = useState('');
  const { content } = useContent();

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch((e) => setErr(e.message));
  }, []);

  const stats = useMemo(() => {
    if (!users) return null;
    return {
      total: users.length,
      admins: users.filter((u) => u.roles.includes('admin')).length,
      enrolled: users.reduce((s, u) => s + u.enrolled_course_ids.length, 0),
      courses: content ? Object.keys(content.courses).length : 0,
    };
  }, [users, content]);

  const tiles = [
    {
      to: '/admin/users',
      title: 'Users',
      icon: <GroupIcon />,
      desc: 'Create accounts, manage roles & passwords',
    },
    {
      to: '/admin/enrollments',
      title: 'Enrollments',
      icon: <WorkspacesIcon />,
      desc: 'Assign learners to courses in bulk',
    },
    {
      to: '/admin/progress',
      title: 'Progress',
      icon: <InsightsIcon />,
      desc: 'See who is active and how far along',
    },
    {
      to: '/editor',
      title: 'Content editor',
      icon: <SchoolIcon />,
      desc: 'Edit courses, modules and items',
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        icon={<AdminIcon />}
        iconColor="hsl(38 92% 50%)"
        title="Admin console"
        subtitle="Manage users, enrollments, progress and content."
        crumbs={[{ label: 'Admin' }]}
      />

      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        {!stats ? (
          [1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" height={96} sx={{ borderRadius: 3 }} />
          ))
        ) : (
          <>
            <StatTile label="Total users" value={stats.total} />
            <StatTile label="Admins" value={stats.admins} />
            <StatTile label="Enrollments" value={stats.enrolled} />
            <StatTile label="Courses" value={stats.courses} />
          </>
        )}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: 2,
        }}
      >
        {tiles.map((t) => (
          <Card
            key={t.to}
            component={Link}
            to={t.to}
            sx={{
              textDecoration: 'none',
              borderRadius: 3,
              transition: 'transform 220ms ease, box-shadow 220ms ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 'var(--shadow-elegant)' },
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: 'var(--gradient-primary)',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {t.icon}
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={800}>
                    {t.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t.desc}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </AppLayout>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        background: 'var(--gradient-hero)',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="h4" fontWeight={800}>
        {value}
      </Typography>
    </Paper>
  );
}
