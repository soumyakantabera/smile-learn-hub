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

import { gradientPrimaryBtnSx } from '@/theme/sxPresets';
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
          maxWidth: 980,
          mt: { xs: 4, md: 0 },
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.05fr 1fr' },
          border: '1px solid',
          borderColor: 'var(--hairline)',
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
            p: 6,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Amber sun-arc top-right */}
          <Box
            sx={{
              position: 'absolute',
              right: -140,
              top: -140,
              width: 360,
              height: 360,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 70%, hsl(42 91% 55% / 0.55), transparent 65%)',
            }}
          />
          {/* Mint bloom bottom-left */}
          <Box
            sx={{
              position: 'absolute',
              left: -80,
              bottom: -100,
              width: 260,
              height: 260,
              borderRadius: '50%',
              background: 'radial-gradient(circle, hsl(140 40% 84% / 0.28), transparent 65%)',
            }}
          />
          {/* Coral speck */}
          <Box
            sx={{
              position: 'absolute',
              right: 40,
              bottom: 80,
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: '#F26B5E',
              boxShadow: '0 0 24px 4px hsl(6 86% 66% / 0.5)',
            }}
          />

          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ position: 'relative' }}>
            <Box
              component="img"
              src="/favicon.svg"
              alt={`${appConfig.appName} logo`}
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2,
                display: 'block',
                boxShadow: '0 8px 20px -10px rgba(0,0,0,0.4)',
              }}
            />
            <Typography variant="h6" fontWeight={800} letterSpacing="-0.01em">
              {appConfig.appName}
            </Typography>
          </Stack>

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="overline"
              sx={{
                opacity: 0.75,
                letterSpacing: '0.14em',
                fontWeight: 700,
                color: '#F5B921',
              }}
            >
              Welcome
            </Typography>
            <Typography
              variant="h3"
              fontWeight={800}
              sx={{ lineHeight: 1.05, mt: 0.5, mb: 2, letterSpacing: '-0.02em' }}
            >
              Learn at your{' '}
              <Box component="span" sx={{ color: '#F5B921' }}>
                own pace.
              </Box>
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.88, mb: 3.5, maxWidth: 380 }}>
              Sign in to access your courses, track progress across devices, and pick up exactly where
              you left off.
            </Typography>
            <Stack spacing={1.75} sx={{ opacity: 0.95 }}>
              {[
                'Personal dashboard with resume & streaks',
                'Cross-device progress sync',
                'Quizzes, videos, PDFs & homework',
              ].map((t) => (
                <Stack key={t} direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'var(--gradient-amber)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 12,
                      color: '#0F3D2E',
                      fontWeight: 900,
                    }}
                  >
                    ✓
                  </Box>
                  <Typography variant="body2">{t}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Form */}
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box
              component="img"
              src="/favicon.svg"
              alt={`${appConfig.appName} logo`}
              sx={{ width: 44, height: 44, borderRadius: 2, display: 'block' }}
            />
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
                ...gradientPrimaryBtnSx,
                py: 1.5,
                fontSize: '1rem',
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
