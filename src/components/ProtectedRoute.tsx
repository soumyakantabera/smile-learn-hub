import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import { loadProgress, isProgressLoaded, resetProgressCache } from '@/lib/progress';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, isLoading, user } = useAuth();
  const location = useLocation();

  // Load progress cache once per signed-in user so all child pages have access.
  useEffect(() => {
    if (user) {
      if (!isProgressLoaded()) loadProgress();
    } else {
      resetProgressCache();
    }
  }, [user]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: ['100vh', '100dvh'],
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
