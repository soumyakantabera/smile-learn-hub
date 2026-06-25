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
  Button,
} from '@mui/material';
import { Search as SearchIcon, Workspaces as WorkspacesIcon, AdminPanelSettings as AdminIcon } from '@mui/icons-material';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { useContent } from '@/contexts/ContentContext';
import { listUsers, setEnrollments, type AdminUser } from '@/lib/adminApi';
import { toast } from 'sonner';

import { gradientPrimaryBtnSx } from '@/theme/sxPresets';
export default function AdminEnrollmentsPage() {
  const { content } = useContent();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState<Record<string, Set<string>>>({});
  const [savingFor, setSavingFor] = useState<string | null>(null);

  useEffect(() => {
    listUsers().then(setUsers);
  }, []);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = search.toLowerCase();
    return users.filter(
      (u) => !q || u.email.toLowerCase().includes(q) || (u.full_name || '').toLowerCase().includes(q),
    );
  }, [users, search]);

  const courses = content ? Object.values(content.courses) : [];

  const setFor = (uid: string, cid: string, on: boolean) => {
    setPending((prev) => {
      const next = { ...prev };
      const cur = new Set(next[uid] || users?.find((u) => u.id === uid)?.enrolled_course_ids || []);
      if (on) cur.add(cid);
      else cur.delete(cid);
      next[uid] = cur;
      return next;
    });
  };

  const save = async (u: AdminUser) => {
    const ids = Array.from(pending[u.id] || u.enrolled_course_ids);
    setSavingFor(u.id);
    try {
      await setEnrollments(u.id, ids);
      toast.success(`Saved enrollments for ${u.email}`);
      const fresh = await listUsers();
      setUsers(fresh);
      setPending((prev) => {
        const n = { ...prev };
        delete n[u.id];
        return n;
      });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingFor(null);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        icon={<WorkspacesIcon />}
        title="Enrollments"
        subtitle="Quickly toggle which courses each learner can access."
        crumbs={[{ label: 'Admin', to: '/admin', icon: <AdminIcon /> }, { label: 'Enrollments' }]}
      />
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
      {!users ? (
        <Stack spacing={1.5}>
          {[1, 2].map((i) => (
            <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
          ))}
        </Stack>
      ) : filtered.length === 0 ? (
        <Alert severity="info">No learners found.</Alert>
      ) : (
        <Stack spacing={2}>
          {filtered.map((u) => {
            const current = pending[u.id] || new Set(u.enrolled_course_ids);
            const dirty = !!pending[u.id];
            return (
              <Paper key={u.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {u.full_name || u.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {u.email} · {current.size} enrolled
                    </Typography>
                  </Box>
                  {dirty && (
                    <Button
                      variant="contained"
                      onClick={() => save(u)}
                      disabled={savingFor === u.id}
                      sx={gradientPrimaryBtnSx}
                    >
                      {savingFor === u.id ? 'Saving…' : 'Save changes'}
                    </Button>
                  )}
                </Stack>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                  {courses.map((c) => {
                    const on = current.has(c.id);
                    return (
                      <Chip
                        key={c.id}
                        label={c.title}
                        onClick={() => setFor(u.id, c.id, !on)}
                        color={on ? 'primary' : 'default'}
                        variant={on ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 600 }}
                      />
                    );
                  })}
                </Box>
              </Paper>
            );
          })}
        </Stack>
      )}
    </AppLayout>
  );
}
