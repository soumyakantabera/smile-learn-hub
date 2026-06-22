import React from 'react';
import { Fab, Tooltip, useTheme, useMediaQuery } from '@mui/material';
import { WhatsApp as WhatsAppIcon } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { appConfig } from '@/config/app.config';
import { useLocation } from 'react-router-dom';
import { MOBILE_BOTTOM_NAV_HEIGHT } from '@/components/MobileBottomNav';

/** Floating WhatsApp support CTA — visible everywhere inside the app shell. */
export function SupportFab() {
  const { session } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const message = encodeURIComponent(
    `Hi! I need help with ${appConfig.appName}.\n\nUser: ${session?.email || 'guest'}\nPage: ${location.pathname}`,
  );
  const href = `https://wa.me/${appConfig.support.whatsappNumber}?text=${message}`;

  // On mobile viewer pages, the ItemNavBar lives at bottom — lift the fab higher.
  const isViewer = location.pathname.startsWith('/view/');
  const bottomOffset = isMobile
    ? (isViewer ? 132 : MOBILE_BOTTOM_NAV_HEIGHT + 12)
    : 24;

  return (
    <Tooltip title="Get help on WhatsApp" placement="left">
      <Fab
        component="a"
        href={href}
        target="_blank"
        rel="noopener"
        aria-label="Contact support on WhatsApp"
        sx={{
          position: 'fixed',
          right: { xs: 16, md: 24 },
          bottom: `calc(${bottomOffset}px + env(safe-area-inset-bottom))`,
          zIndex: (t) => t.zIndex.speedDial,
          bgcolor: '#25D366',
          color: '#fff',
          '&:hover': { bgcolor: '#1ebe5d' },
          boxShadow: '0 14px 28px -10px rgba(37, 211, 102, 0.55)',
        }}
      >
        <WhatsAppIcon />
      </Fab>
    </Tooltip>
  );
}
