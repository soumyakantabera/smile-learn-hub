import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
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
  LinearProgress,
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
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Autorenew as RegenIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { ConfirmDialog } from '@/components/editor/ConfirmDialog';
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
  // Include mixed case + digits so it clears strength checks and HIBP.
  const lowers = 'abcdefghjkmnpqrstuvwxyz';
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const pool = lowers + uppers + digits;
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  let out = pick(uppers) + pick(lowers) + pick(digits);
  for (let i = 0; i < 9; i++) out += pool[Math.floor(Math.random() * pool.length)];
  return out
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

function passwordScore(pw: string): { score: number; label: string; color: 'error' | 'warning' | 'info' | 'success' } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const s = Math.min(score, 4);
  const map: any = [
    { label: 'Too weak', color: 'error' },
    { label: 'Weak', color: 'error' },
    { label: 'Okay', color: 'warning' },
    { label: 'Strong', color: 'info' },
    { label: 'Excellent', color: 'success' },
  ];
  return { score: s, ...map[s] };
}

function buildWelcomeMessage(opts: {
  fullName?: string;
  email: string;
  password: string;
  loginUrl: string;
}) {
  const greeting = opts.fullName ? `Hi ${opts.fullName.split(' ')[0]},` : 'Hi,';
  return [
    greeting,
    '',
    'Your Learn With Smile account is ready. You can sign in with:',
    `• Login: ${opts.loginUrl}`,
    `• Email: ${opts.email}`,
    `• Temporary password: ${opts.password}`,
    '',
    'Please change your password after your first sign-in.',
    '',
    '— Learn With Smile',
  ].join('\n');
}

export default function AdminUsersPage() {
  const { content } = useContent();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [enrollUser, setEnrollUser] = useState<AdminUser | null>(null);
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminUser | null>(null);

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
                    <IconButton color="error" onClick={() => setDeleteConfirm(u)}>
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
          onCreated={reload}
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
        <ResetPasswordDialog user={resetUser} onClose={() => setResetUser(null)} />
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete user?"
        message={
          deleteConfirm
            ? `${deleteConfirm.email} will be permanently removed along with their enrollments and progress. This cannot be undone.`
            : ''
        }
        destructive
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!deleteConfirm) return;
          try {
            await deleteUser(deleteConfirm.id);
            await reload();
            toast.success('User deleted');
          } catch (e: any) {
            toast.error(e.message);
          }
        }}
        onClose={() => setDeleteConfirm(null)}
      />
    </AppLayout>
  );
}

// ---------- Password field ----------

function PasswordField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const [show, setShow] = useState(false);
  const score = passwordScore(value);
  const pct = (score.score / 4) * 100;
  return (
    <Box>
      <TextField
        label={label}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title={show ? 'Hide' : 'Show'}>
                <IconButton onClick={() => setShow((s) => !s)} size="small">
                  {show ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Copy">
                <IconButton
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(value);
                    toast.success('Password copied');
                  }}
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Regenerate">
                <IconButton size="small" onClick={() => onChange(genPassword())}>
                  <RegenIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
      />
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
        <LinearProgress
          variant="determinate"
          value={pct}
          color={score.color as any}
          sx={{ flex: 1, height: 6, borderRadius: 3 }}
        />
        <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 76, textAlign: 'right' }} color={`${score.color}.main`}>
          {score.label}
        </Typography>
      </Stack>
    </Box>
  );
}

// ---------- Welcome message success step ----------

function WelcomeSuccess({
  fullName,
  email,
  password,
}: {
  fullName?: string;
  email: string;
  password: string;
}) {
  const loginUrl = `${window.location.origin}/login`;
  const message = buildWelcomeMessage({ fullName, email, password, loginUrl });
  return (
    <Stack spacing={2}>
      <Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
        <strong>Account ready.</strong> Copy the welcome message below and send it to the learner.
      </Alert>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'var(--surface-2)' }}>
        <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', m: 0 }}>
          {message}
        </Typography>
      </Paper>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Button
          variant="contained"
          startIcon={<CopyIcon />}
          onClick={() => {
            navigator.clipboard.writeText(message);
            toast.success('Welcome message copied');
          }}
          sx={gradientPrimaryBtnSx}
        >
          Copy welcome message
        </Button>
        <Button
          startIcon={<CopyIcon />}
          onClick={() => {
            navigator.clipboard.writeText(password);
            toast.success('Password copied');
          }}
        >
          Copy password only
        </Button>
      </Stack>
    </Stack>
  );
}

// ---------- Create user ----------

function friendlyError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('already') && (m.includes('registered') || m.includes('exists'))) {
    return 'A user with this email already exists.';
  }
  if (m.includes('pwned') || m.includes('weak')) {
    return 'This password is too common. Regenerate a stronger one.';
  }
  return msg;
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
  const [created, setCreated] = useState(false);

  const score = passwordScore(password);

  const submit = async () => {
    setErr('');
    if (!email.includes('@')) return setErr('Valid email required');
    if (password.length < 8) return setErr('Password must be at least 8 characters');
    if (score.score < 2) return setErr('Password is too weak. Regenerate a stronger one.');
    setSubmitting(true);
    try {
      await createUser({
        email: email.trim().toLowerCase(),
        password,
        full_name: fullName || undefined,
        phone: phone || undefined,
        course_ids: courseIds,
      });
      toast.success('User created');
      setCreated(true);
      onCreated();
    } catch (e: any) {
      setErr(friendlyError(e.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{created ? 'User created' : 'Create user'}</DialogTitle>
      <DialogContent>
        {created ? (
          <Box sx={{ mt: 1 }}>
            <WelcomeSuccess fullName={fullName} email={email} password={password} />
          </Box>
        ) : (
          <>
            {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} fullWidth />
              <TextField label="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
              <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
              <PasswordField label="Temporary password *" value={password} onChange={setPassword} />
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
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{created ? 'Done' : 'Cancel'}</Button>
        {!created && (
          <Button variant="contained" onClick={submit} disabled={submitting} sx={gradientPrimaryBtnSx}>
            {submitting ? 'Creating…' : 'Create user'}
          </Button>
        )}
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
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const score = passwordScore(pwd);

  const submit = async () => {
    setErr('');
    if (pwd.length < 8) return setErr('Password must be at least 8 characters');
    if (score.score < 2) return setErr('Password too weak — regenerate.');
    setSaving(true);
    try {
      await resetUserPassword(user.id, pwd);
      toast.success('Password updated');
      setDone(true);
    } catch (e: any) {
      setErr(friendlyError(e.message));
    } finally {
      setSaving(false);
    }
  };
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{done ? 'Password updated' : `Reset password — ${user.email}`}</DialogTitle>
      <DialogContent>
        {done ? (
          <Box sx={{ mt: 1 }}>
            <WelcomeSuccess fullName={user.full_name || undefined} email={user.email} password={pwd} />
          </Box>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            {err && <Alert severity="error">{err}</Alert>}
            <PasswordField label="New password" value={pwd} onChange={setPwd} />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{done ? 'Done' : 'Cancel'}</Button>
        {!done && (
          <Button variant="contained" onClick={submit} disabled={saving} sx={gradientPrimaryBtnSx}>
            {saving ? 'Saving…' : 'Reset password'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
