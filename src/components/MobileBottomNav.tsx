import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper, useTheme, useMediaQuery, Box } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Help as HelpIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

export const MOBILE_BOTTOM_NAV_HEIGHT = 64;

export function MobileBottomNav() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();

  if (!isMobile) return null;
  if (location.pathname.startsWith('/view/')) return null;

  const tabs = [
    { value: '/', label: 'Home', icon: <DashboardIcon /> },
    { value: '/courses', label: 'Courses', icon: <SchoolIcon /> },
    { value: '/help', label: 'Help', icon: <HelpIcon /> },
  ];
  if (session?.isAdmin) {
    tabs.push({ value: '/admin', label: 'Admin', icon: <AdminIcon /> });
  }

  const current =
    tabs.find((t) => (t.value === '/' ? location.pathname === '/' : location.pathname.startsWith(t.value)))?.value ||
    false;

  return (
    <Paper
      elevation={0}
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
        backdropFilter: 'saturate(180%) blur(10px)',
        backgroundColor: (t) =>
          t.palette.mode === 'dark' ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.92)',
      }}
    >
      <BottomNavigation
        value={current}
        onChange={(_, v) => navigate(v)}
        showLabels
        sx={{
          height: MOBILE_BOTTOM_NAV_HEIGHT,
          bgcolor: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            minWidth: 0,
            padding: '6px 4px',
          },
          '& .Mui-selected': {
            color: 'primary.main',
            '& .MuiBottomNavigationAction-label': { fontWeight: 700 },
          },
        }}
      >
        {tabs.map((t) => (
          <BottomNavigationAction
            key={t.value}
            label={t.label}
            value={t.value}
            icon={
              <Box
                sx={{
                  position: 'relative',
                  display: 'grid',
                  placeItems: 'center',
                  width: 36,
                  height: 28,
                  borderRadius: 14,
                  transition: 'all 180ms ease',
                  ...(current === t.value && {
                    background: 'var(--gradient-primary)',
                    color: 'primary.contrastText',
                    boxShadow: '0 6px 14px -6px hsl(239 84% 30% / 0.5)',
                  }),
                }}
              >
                {t.icon}
              </Box>
            }
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
