import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  LockReset as LockResetIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { supabase } from '@/integrations/supabase/client';

import { gradientPrimaryBtnSx } from '@/theme/sxPresets';
export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase will set a session if the URL contains the recovery hash.
    supabase.auth.getSession().then(() => setReady(true));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    setOk(true);
    setTimeout(() => navigate('/'), 1500);
  };

  return (
    <Box
      sx={{
        minHeight: ['100vh', '100dvh'],
        display: 'grid',
        placeItems: 'center',
        background: 'var(--gradient-hero)',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                mx: 'auto',
                mb: 2,
                borderRadius: 2,
                background: 'var(--gradient-primary)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
              }}
            >
              <LockResetIcon />
            </Box>
            <Typography variant="h5" fontWeight={800}>
              Set a new password
            </Typography>
          </Box>
          {!ready ? (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : ok ? (
            <Alert severity="success">Password updated. Redirecting…</Alert>
          ) : (
            <form onSubmit={submit}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                fullWidth
                label="New password"
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShow((s) => !s)}>
                        {show ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Confirm new password"
                type={show ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={submitting}
                sx={{ py: 1.5, background: 'var(--gradient-primary)' }}
              >
                {submitting ? <CircularProgress size={20} color="inherit" /> : 'Update password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
