import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { Home as HomeIcon, SearchOff as NotFoundIcon } from '@mui/icons-material';

export default function NotFoundPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3,
        textAlign: 'center',
      }}
    >
      <NotFoundIcon sx={{ fontSize: 120, color: 'primary.main', mb: 3, opacity: 0.5 }} />
      <Typography variant="h1" fontWeight={700} sx={{ mb: 2 }}>
        404
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button
        component={Link}
        to="/"
        variant="contained"
        size="large"
        startIcon={<HomeIcon />}
      >
        Back to Home
      </Button>
    </Box>
  );
}
