import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Inbox as InboxIcon } from '@mui/icons-material';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Box
      sx={{
        py: 6,
        textAlign: 'center',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        borderStyle: 'dashed',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ color: 'text.disabled', mb: 1, '& svg': { fontSize: 48 } }}>{icon || <InboxIcon />}</Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 420, mx: 'auto' }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
