import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: ['100vh', '100dvh'] }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!session.isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}
