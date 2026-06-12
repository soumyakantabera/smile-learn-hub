import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Paper, Typography, useTheme, useMediaQuery } from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import type { SequenceEntry } from '@/lib/contentNavigation';

interface Props {
  prev: SequenceEntry | null;
  next: SequenceEntry | null;
  courseId: string;
  fixedOnMobile?: boolean;
}

export function ItemNavBar({ prev, next, courseId, fixedOnMobile = true }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const fixed = fixedOnMobile && isMobile;

  const content = (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        alignItems: 'stretch',
        width: '100%',
      }}
    >
      <Button
        variant="outlined"
        component={prev ? RouterLink : 'button'}
        to={prev ? `/view/${prev.item.id}` : undefined}
        disabled={!prev}
        startIcon={<ArrowBackIcon />}
        sx={{
          flex: 1,
          justifyContent: 'flex-start',
          textAlign: 'left',
          py: 1.25,
          textTransform: 'none',
          minWidth: 0,
        }}
      >
        <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.7, lineHeight: 1 }}>
            Previous
          </Typography>
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {prev ? prev.item.title : 'Start of course'}
          </Typography>
        </Box>
      </Button>

      {next ? (
        <Button
          variant="contained"
          component={RouterLink}
          to={`/view/${next.item.id}`}
          endIcon={<ArrowForwardIcon />}
          sx={{
            flex: 1,
            justifyContent: 'flex-end',
            textAlign: 'right',
            py: 1.25,
            textTransform: 'none',
            minWidth: 0,
          }}
        >
          <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
            <Typography variant="caption" sx={{ display: 'block', opacity: 0.85, lineHeight: 1 }}>
              Next
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {next.item.title}
            </Typography>
          </Box>
        </Button>
      ) : (
        <Button
          variant="contained"
          color="success"
          component={RouterLink}
          to={`/courses/${courseId}`}
          endIcon={<CheckCircleIcon />}
          sx={{ flex: 1, py: 1.25, textTransform: 'none' }}
        >
          Finish course
        </Button>
      )}
    </Box>
  );

  if (fixed) {
    return (
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: (t) => t.zIndex.appBar,
          px: 1.5,
          pt: 1,
          pb: `calc(8px + env(safe-area-inset-bottom))`,
          borderTop: 1,
          borderColor: 'divider',
          borderRadius: 0,
        }}
      >
        {content}
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 1.5, mt: 3, borderRadius: 2 }}>
      {content}
    </Paper>
  );
}
