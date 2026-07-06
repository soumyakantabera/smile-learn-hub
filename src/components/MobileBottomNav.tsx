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

export const MOBILE_BOTTOM_NAV_HEIGHT = 62;

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
        borderTop: '1px solid',
        borderColor: 'var(--hairline)',
        pb: 'env(safe-area-inset-bottom)',
        display: { xs: 'block', md: 'none' },
        backdropFilter: 'saturate(180%) blur(12px)',
        backgroundColor: (t) =>
          t.palette.mode === 'dark' ? 'hsl(158 40% 8% / 0.94)' : 'hsl(40 100% 97% / 0.94)',
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
            transition: 'color 200ms ease',
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
                  width: 40,
                  height: 26,
                  color: current === t.value ? 'primary.main' : 'inherit',
                  '&::after': current === t.value
                    ? {
                        content: '""',
                        position: 'absolute',
                        bottom: -6,
                        width: 22,
                        height: 3,
                        borderRadius: 2,
                        background: 'var(--gradient-amber)',
                      }
                    : {},
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
