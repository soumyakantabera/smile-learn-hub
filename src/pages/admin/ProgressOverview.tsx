import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Chip,
  Alert,
  Skeleton,
  TextField,
  InputAdornment,
  Card,
  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Insights as InsightsIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { useContent } from '@/contexts/ContentContext';
import { supabase } from '@/integrations/supabase/client';
import { listUsers, type AdminUser } from '@/lib/adminApi';
import { buildCourseSequence } from '@/lib/contentNavigation';

interface ProgressByUser {
  [userId: string]: {
    [courseId: string]: { visited: number; lastSeen: string | null; timeSec: number };
  };
}

export default function AdminProgressPage() {
  const { content } = useContent();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [prog, setProg] = useState<ProgressByUser>({});
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    listUsers().then(setUsers).catch((e) => setErr(e.message));
    supabase
      .from('progress')
      .select('user_id, course_id, visited_at, time_spent_seconds')
      .then(({ data }) => {
        const out: ProgressByUser = {};
        (data || []).forEach((r) => {
          out[r.user_id] = out[r.user_id] || {};
          out[r.user_id][r.course_id] = out[r.user_id][r.course_id] || {
            visited: 0,
            lastSeen: null,
            timeSec: 0,
          };
          out[r.user_id][r.course_id].visited += 1;
          out[r.user_id][r.course_id].timeSec += r.time_spent_seconds || 0;
          const t = r.visited_at;
          if (!out[r.user_id][r.course_id].lastSeen || t > out[r.user_id][r.course_id].lastSeen!) {
            out[r.user_id][r.course_id].lastSeen = t;
          }
        });
        setProg(out);
      });
  }, []);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = search.toLowerCase();
    return users.filter((u) => !q || u.email.toLowerCase().includes(q) || (u.full_name || '').toLowerCase().includes(q));
  }, [users, search]);

  return (
    <AppLayout>
      <PageHeader
        icon={<InsightsIcon />}
        title="Progress overview"
        subtitle="See how each learner is moving through their enrolled courses."
        crumbs={[{ label: 'Admin', to: '/admin', icon: <AdminIcon /> }, { label: 'Progress' }]}
      />
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
      <Card sx={{ mb: 3, p: 1.5, borderRadius: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search learners…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Card>
      {!users || !content ? (
        <Stack spacing={1.5}>
          {[1, 2].map((i) => (
            <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
          ))}
        </Stack>
      ) : filtered.length === 0 ? (
        <Alert severity="info">No users.</Alert>
      ) : (
        <Stack spacing={2}>
          {filtered.map((u) => (
            <Paper key={u.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {u.full_name || u.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {u.email}
                  </Typography>
                </Box>
                <Chip size="small" label={`${u.enrolled_course_ids.length} courses`} />
              </Stack>
              {u.enrolled_course_ids.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Not enrolled in any course.
                </Typography>
              ) : (
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  {u.enrolled_course_ids.map((cid) => {
                    const course = content.courses[cid];
                    const seq = buildCourseSequence(content, cid);
                    const visited = prog[u.id]?.[cid]?.visited || 0;
                    const pct = seq.length ? Math.round((visited / seq.length) * 100) : 0;
                    const lastSeen = prog[u.id]?.[cid]?.lastSeen;
                    const timeMin = Math.round((prog[u.id]?.[cid]?.timeSec || 0) / 60);
                    return (
                      <Box key={cid}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={700}>
                            {course?.title || cid}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {visited}/{seq.length} · {timeMin}m
                            {lastSeen ? ` · last ${new Date(lastSeen).toLocaleDateString()}` : ''}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'action.hover',
                            '& .MuiLinearProgress-bar': { background: 'var(--gradient-primary)' },
                          }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Paper>
          ))}
        </Stack>
      )}
    </AppLayout>
  );
}
