import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Tooltip,
  Avatar,
  Paper,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  AdminPanelSettings as AdminIcon,
  School as SchoolIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  LockReset as LockResetIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { useContent } from '@/contexts/ContentContext';
import { gradientPrimaryBtnSx } from '@/theme/sxPresets';
import {
  listUsers,
  createUser,
  deleteUser,
  resetUserPassword,
  grantAdmin,
  revokeAdmin,
  setEnrollments,
  type AdminUser,
} from '@/lib/adminApi';

function genPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function AdminUsersPage() {
  const { content } = useContent();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [enrollUser, setEnrollUser] = useState<AdminUser | null>(null);
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);

  const reload = async () => {
    setError('');
    try {
      const u = await listUsers();
      setUsers(u);
    } catch (e: any) {
      setError(e.message);
    }
  };
  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        !q ||
        u.email.toLowerCase().includes(q) ||
        (u.full_name || '').toLowerCase().includes(q),
    );
  }, [users, search]);

  const allCourses = content ? Object.values(content.courses) : [];

  return (
    <AppLayout>
      <PageHeader
        icon={<AdminIcon />}
        title="Users"
        subtitle="Create accounts, enroll learners, and manage access."
        crumbs={[
          { label: 'Admin', to: '/admin', icon: <AdminIcon /> },
          { label: 'Users' },
        ]}
        actions={
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={gradientPrimaryBtnSx}
          >
            New user
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3, p: 1.5, borderRadius: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
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
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      ) : filtered.length === 0 ? (
        <Alert severity="info">No users match your filter.</Alert>
      ) : (
        <Stack spacing={1.5}>
          {filtered.map((u) => (
            <Paper key={u.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ sm: 'center' }}
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                  <Avatar
                    sx={{
                      width: 44,
                      height: 44,
                      background: 'var(--gradient-primary)',
                      fontWeight: 800,
                    }}
                  >
                    {(u.full_name || u.email).slice(0, 1).toUpperCase()}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography variant="subtitle1" fontWeight={700} noWrap>
                        {u.full_name || u.email.split('@')[0]}
                      </Typography>
                      {u.roles.includes('admin') && (
                        <Chip size="small" label="Admin" color="secondary" sx={{ fontWeight: 700 }} />
                      )}
                      <Chip
                        size="small"
                        icon={<SchoolIcon />}
                        label={`${u.enrolled_course_ids.length} course${u.enrolled_course_ids.length === 1 ? '' : 's'}`}
                        variant="outlined"
                      />
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <EmailIcon fontSize="inherit" sx={{ color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {u.email}
                        </Typography>
                      </Stack>
                      {u.phone && (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <PhoneIcon fontSize="inherit" sx={{ color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {u.phone}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Box>
                </Stack>
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ flexShrink: 0, overflowX: 'auto' }}
                  className="scrollbar-thin"
                >
                  <Tooltip title="Manage enrollments">
                    <IconButton onClick={() => setEnrollUser(u)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset password">
                    <IconButton onClick={() => setResetUser(u)}>
                      <LockResetIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={u.roles.includes('admin') ? 'Revoke admin' : 'Grant admin'}>
                    <IconButton
                      color={u.roles.includes('admin') ? 'warning' : 'default'}
                      onClick={async () => {
                        try {
                          if (u.roles.includes('admin')) await revokeAdmin(u.id);
                          else await grantAdmin(u.id);
                          await reload();
                          toast.success('Updated role');
                        } catch (e: any) {
                          toast.error(e.message);
                        }
                      }}
                    >
                      <AdminIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete user">
                    <IconButton
                      color="error"
                      onClick={async () => {
                        if (!confirm(`Delete ${u.email}? This cannot be undone.`)) return;
                        try {
                          await deleteUser(u.id);
                          await reload();
                          toast.success('User deleted');
                        } catch (e: any) {
                          toast.error(e.message);
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {createOpen && (
        <CreateUserDialog
          onClose={() => setCreateOpen(false)}
          onCreated={async () => {
            setCreateOpen(false);
            await reload();
          }}
          allCourses={allCourses}
        />
      )}

      {enrollUser && (
        <EnrollDialog
          user={enrollUser}
          onClose={() => setEnrollUser(null)}
          onSaved={async () => {
            setEnrollUser(null);
            await reload();
          }}
          allCourses={allCourses}
        />
      )}

      {resetUser && (
        <ResetPasswordDialog
          user={resetUser}
          onClose={() => setResetUser(null)}
        />
      )}
    </AppLayout>
  );
}

function CreateUserDialog({
  onClose,
  onCreated,
  allCourses,
}: {
  onClose: () => void;
  onCreated: () => void;
  allCourses: { id: string; title: string }[];
}) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState(genPassword());
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    setErr('');
    if (!email.includes('@')) return setErr('Valid email required');
    if (password.length < 6) return setErr('Password must be 6+ chars');
    setSubmitting(true);
    try {
      await createUser({
        email,
        password,
        full_name: fullName || undefined,
        phone: phone || undefined,
        course_ids: courseIds,
      });
      toast.success('User created');
      onCreated();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create user</DialogTitle>
      <DialogContent>
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} fullWidth />
          <TextField label="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
          <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
          <TextField
            label="Temporary password *"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Copy">
                    <IconButton
                      onClick={() => {
                        navigator.clipboard.writeText(password);
                        toast.success('Password copied');
                      }}
                    >
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                  <Button size="small" onClick={() => setPassword(genPassword())}>
                    Regen
                  </Button>
                </InputAdornment>
              ),
            }}
            helperText="Share this with the user via WhatsApp/email."
          />
          <TextField
            select
            label="Enroll in courses"
            SelectProps={{
              multiple: true,
              value: courseIds,
              onChange: (e: any) => setCourseIds(e.target.value as string[]),
              renderValue: (selected: any) =>
                (selected as string[])
                  .map((id) => allCourses.find((c) => c.id === id)?.title || id)
                  .join(', '),
            }}
            fullWidth
          >
            {allCourses.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.title}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={submitting} sx={gradientPrimaryBtnSx}>
          {submitting ? 'Creating…' : 'Create user'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function EnrollDialog({
  user,
  onClose,
  onSaved,
  allCourses,
}: {
  user: AdminUser;
  onClose: () => void;
  onSaved: () => void;
  allCourses: { id: string; title: string }[];
}) {
  const [ids, setIds] = useState<string[]>(user.enrolled_course_ids);
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    setSaving(true);
    try {
      await setEnrollments(user.id, ids);
      toast.success('Enrollments updated');
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Enrollments — {user.full_name || user.email}</DialogTitle>
      <DialogContent>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {allCourses.map((c) => {
            const checked = ids.includes(c.id);
            return (
              <Paper
                key={c.id}
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  cursor: 'pointer',
                  bgcolor: checked ? 'action.selected' : 'transparent',
                }}
                onClick={() =>
                  setIds((prev) =>
                    prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id],
                  )
                }
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <SchoolIcon color={checked ? 'primary' : 'action'} />
                  <Typography fontWeight={600} sx={{ flex: 1 }}>
                    {c.title}
                  </Typography>
                  {checked && <Chip size="small" color="primary" label="Enrolled" />}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={saving} sx={gradientPrimaryBtnSx}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ResetPasswordDialog({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const [pwd, setPwd] = useState(genPassword());
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (pwd.length < 6) return toast.error('6+ chars required');
    setSaving(true);
    try {
      await resetUserPassword(user.id, pwd);
      toast.success('Password updated');
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Reset password — {user.email}</DialogTitle>
      <DialogContent>
        <TextField
          label="New password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          fullWidth
          sx={{ mt: 1 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Copy">
                  <IconButton
                    onClick={() => {
                      navigator.clipboard.writeText(pwd);
                      toast.success('Copied');
                    }}
                  >
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
                <Button size="small" onClick={() => setPwd(genPassword())}>
                  Regen
                </Button>
              </InputAdornment>
            ),
          }}
          helperText="Share securely with the user."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={saving} sx={gradientPrimaryBtnSx}>
          {saving ? 'Saving…' : 'Reset password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
