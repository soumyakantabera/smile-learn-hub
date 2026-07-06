import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Help as HelpIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  AdminPanelSettings as AdminIcon,
  Group as GroupIcon,
  Insights as InsightsIcon,
  Workspaces as WorkspacesIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeMode } from '@/theme/ThemeProvider';
import { appConfig } from '@/config/app.config';
import { MobileBottomNav, MOBILE_BOTTOM_NAV_HEIGHT } from '@/components/MobileBottomNav';
import { SupportFab } from '@/components/SupportFab';

const DRAWER_WIDTH = 272;

const baseNav = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Courses', path: '/courses', icon: <SchoolIcon /> },
  { label: 'Help', path: '/help', icon: <HelpIcon /> },
];
const adminNav = [
  { label: 'Admin Console', path: '/admin', icon: <AdminIcon /> },
  { label: 'Users', path: '/admin/users', icon: <GroupIcon /> },
  { label: 'Enrollments', path: '/admin/enrollments', icon: <WorkspacesIcon /> },
  { label: 'Progress', path: '/admin/progress', icon: <InsightsIcon /> },
  { label: 'Content Editor', path: '/editor', icon: <EditIcon /> },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { session, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => setMobileOpen((v) => !v);
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };

  const isAdmin = !!session?.isAdmin;
  const nav = [...baseNav, ...(isAdmin ? adminNav : [])];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid',
          borderColor: 'var(--hairline)',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'var(--gradient-primary)',
            display: 'grid',
            placeItems: 'center',
            color: 'primary.contrastText',
            position: 'relative',
            boxShadow: '0 8px 20px -10px hsl(158 61% 15% / 0.4)',
          }}
        >
          <SchoolIcon sx={{ fontSize: 22 }} />
          <Box
            sx={{
              position: 'absolute',
              right: -3,
              top: -3,
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: 'var(--gradient-amber)',
              border: '2px solid',
              borderColor: 'background.paper',
            }}
          />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.15, letterSpacing: '-0.01em' }} noWrap>
            {appConfig.appName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '0.02em' }}>
            Learn at your own pace
          </Typography>
        </Box>
      </Box>
      <List sx={{ flex: 1, py: 1.5, px: 1.25 }}>
        {nav.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActive}
                onClick={() => isMobile && setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  py: 1.15,
                  pl: 2,
                  position: 'relative',
                  transition: 'all 200ms cubic-bezier(.2,.7,.2,1)',
                  '&::before': isActive
                    ? {
                        content: '""',
                        position: 'absolute',
                        left: 6,
                        top: 10,
                        bottom: 10,
                        width: 3,
                        borderRadius: 2,
                        background: 'var(--gradient-amber)',
                      }
                    : {},
                  '&.Mui-selected': {
                    bgcolor: 'hsl(158 61% 15% / 0.06)',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'hsl(158 61% 15% / 0.1)' },
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                    '& .MuiListItemText-primary': { fontWeight: 700 },
                  },
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ borderColor: 'var(--hairline)' }} />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 38,
              height: 38,
              background: 'var(--gradient-primary)',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {(session?.fullName || session?.email || '?').slice(0, 1).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {session?.fullName || session?.email?.split('@')[0] || 'Guest'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {session?.email}
            </Typography>
          </Box>
          {isAdmin && (
            <Chip label="Admin" size="small" color="secondary" sx={{ fontWeight: 700 }} />
          )}
        </Box>
      </Box>
    </Box>
  );

  const isViewer = location.pathname.startsWith('/view/');
  const mobileBottomPad = isViewer
    ? `calc(180px + env(safe-area-inset-bottom))`
    : `calc(${MOBILE_BOTTOM_NAV_HEIGHT + 24}px + env(safe-area-inset-bottom))`;

  return (
    <Box sx={{ display: 'flex', minHeight: ['100vh', '100dvh'], overflowX: 'hidden' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          borderBottom: 1,
          borderColor: 'divider',
          backdropFilter: 'saturate(180%) blur(8px)',
          backgroundColor: (t) =>
            t.palette.mode === 'dark' ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.85)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="subtitle1"
            component="div"
            fontWeight={700}
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            {nav.find(
              (item) =>
                location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path)),
            )?.label || appConfig.appName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
              <IconButton onClick={toggleTheme} color="inherit">
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Account">
              <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    background: 'var(--gradient-primary)',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {(session?.fullName || session?.email || '?').slice(0, 1).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem disabled>
              <Box sx={{ minWidth: 180 }}>
                <Typography variant="body2" fontWeight={700} noWrap>
                  {session?.fullName || session?.email?.split('@')[0]}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {session?.email}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 'min(300px, 86vw)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minWidth: 0,
          minHeight: ['100vh', '100dvh'],
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            pb: { xs: mobileBottomPad, md: 3 },
          }}
        >
          {children}
        </Box>
      </Box>
      <MobileBottomNav />
      {session && <SupportFab />}
    </Box>
  );
}
