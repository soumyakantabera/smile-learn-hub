import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper, useTheme, useMediaQuery } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Help as HelpIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

export function MobileBottomNav() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();

  if (!isMobile) return null;

  // Hide on viewer (we have fixed nav there)
  if (location.pathname.startsWith('/view/')) return null;

  const tabs = [
    { value: '/', label: 'Home', icon: <DashboardIcon /> },
    { value: '/courses', label: 'Courses', icon: <SchoolIcon /> },
    { value: '/help', label: 'Help', icon: <HelpIcon /> },
  ];
  if (session?.isAdmin) {
    tabs.push({ value: '/editor', label: 'Editor', icon: <EditIcon /> });
  }

  const current = tabs.find((t) =>
    t.value === '/' ? location.pathname === '/' : location.pathname.startsWith(t.value),
  )?.value || false;

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (t) => t.zIndex.appBar,
        borderTop: 1,
        borderColor: 'divider',
        pb: 'env(safe-area-inset-bottom)',
        display: { xs: 'block', md: 'none' },
      }}
    >
      <BottomNavigation
        value={current}
        onChange={(_, v) => navigate(v)}
        showLabels
      >
        {tabs.map((t) => (
          <BottomNavigationAction key={t.value} label={t.label} value={t.value} icon={t.icon} />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
