import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  Stack,
  Link as MuiLink,
} from '@mui/material';
import {
  School as SchoolIcon,
  Visibility,
  VisibilityOff,
  LockOutlined,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeMode } from '@/theme/ThemeProvider';
import { appConfig } from '@/config/app.config';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { session, login, isLoading } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();

  if (!isLoading && session) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const r = await login(email, password);
    if (r.success) navigate('/');
    else setError(r.error || 'Login failed');
    setSubmitting(false);
  };

  const waUrl = `https://wa.me/${appConfig.support.whatsappNumber}?text=${encodeURIComponent(
    `Hi, I need help with my ${appConfig.appName} login.`,
  )}`;

  return (
    <Box
      sx={{
        minHeight: ['100vh', '100dvh'],
        display: 'flex',
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'center',
        background: 'var(--gradient-hero)',
        p: { xs: 2, md: 4 },
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <IconButton onClick={toggleTheme} color="inherit" aria-label="Toggle theme">
          {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>

      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 960,
          mt: { xs: 4, md: 0 },
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.05fr 1fr' },
          border: 1,
          borderColor: 'divider',
          borderRadius: 4,
          boxShadow: 'var(--shadow-elegant)',
        }}
      >
        {/* Branded panel */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'var(--gradient-primary)',
            color: 'primary.contrastText',
            p: 5,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              right: -60,
              top: -60,
              width: 240,
              height: 240,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.12)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              left: -40,
              bottom: -40,
              width: 180,
              height: 180,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.08)',
            }}
          />
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.18)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <SchoolIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="h6" fontWeight={800}>
              {appConfig.appName}
            </Typography>
          </Stack>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" fontWeight={800} sx={{ lineHeight: 1.1 }} gutterBottom>
              Learn at your own pace.
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 3, maxWidth: 360 }}>
              Sign in to access your courses, track progress across devices, and pick up exactly where
              you left off.
            </Typography>
            <Stack spacing={1.5} sx={{ opacity: 0.95 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 6, height: 6, borderRadius: 4, bgcolor: '#fff' }} />
                <Typography variant="body2">Personal dashboard with resume & streaks</Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 6, height: 6, borderRadius: 4, bgcolor: '#fff' }} />
                <Typography variant="body2">Cross-device progress sync</Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 6, height: 6, borderRadius: 4, bgcolor: '#fff' }} />
                <Typography variant="body2">Quizzes, videos, PDFs & homework</Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* Form */}
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                background: 'var(--gradient-primary)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
              }}
            >
              <SchoolIcon />
            </Box>
            <Typography variant="h6" fontWeight={800}>
              {appConfig.appName}
            </Typography>
          </Box>

          <Typography variant="h4" fontWeight={800} gutterBottom>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in with the email and password your instructor shared.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting || isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting || isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShow((s) => !s)} edge="end">
                      {show ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={submitting || isLoading || !email.trim() || !password}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                background: 'var(--gradient-primary)',
              }}
            >
              {submitting ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
            </Button>
          </form>

          <Box
            sx={{
              mt: 3,
              pt: 3,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              alignItems: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary" textAlign="center">
              Don&apos;t have an account? Accounts are created by your instructor.
            </Typography>
            <Button
              component={MuiLink}
              href={waUrl}
              target="_blank"
              rel="noopener"
              startIcon={<WhatsAppIcon />}
              size="small"
              sx={{ color: '#25D366' }}
            >
              Need help? Chat on WhatsApp
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
