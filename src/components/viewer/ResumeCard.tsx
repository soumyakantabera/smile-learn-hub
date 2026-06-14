import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Paper, Typography, Button, LinearProgress, Chip } from '@mui/material';
import { PlayArrow as PlayIcon, Replay as ReplayIcon } from '@mui/icons-material';
import type { SequenceEntry } from '@/lib/contentNavigation';

interface Props {
  resumeEntry: SequenceEntry | null;
  firstItemId?: string;
  sequenceLength: number;
  visitedCount: number;
  hasResume: boolean;
  onRestart: () => void;
}

export function ResumeCard({
  resumeEntry,
  firstItemId,
  sequenceLength,
  visitedCount,
  hasResume,
  onRestart,
}: Props) {
  const pct = sequenceLength > 0 ? Math.round((visitedCount / sequenceLength) * 100) : 0;
  const target = resumeEntry?.item.id || firstItemId;
  if (!target) return null;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        alignItems: { xs: 'stretch', sm: 'center' },
        mt: 3,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Chip
            size="small"
            color={hasResume ? 'primary' : 'default'}
            label={hasResume ? 'Continue where you left off' : 'Ready to start'}
            sx={{ fontWeight: 600 }}
          />
          <Typography variant="caption" color="text.secondary">
            {pct}% complete · {visitedCount}/{sequenceLength} items
          </Typography>
        </Box>
        {resumeEntry && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.2 }}>
              {resumeEntry.module.title}
            </Typography>
            <Typography variant="h6" fontWeight={700} noWrap>
              {resumeEntry.item.title}
            </Typography>
          </>
        )}
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{ height: 6, borderRadius: 3, mt: 1 }}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
        {hasResume && firstItemId && (
          <Button
            variant="outlined"
            startIcon={<ReplayIcon />}
            onClick={onRestart}
            component={RouterLink}
            to={`/view/${firstItemId}`}
            sx={{ textTransform: 'none' }}
          >
            Restart
          </Button>
        )}
        <Button
          variant="contained"
          size="large"
          startIcon={<PlayIcon />}
          component={RouterLink}
          to={`/view/${target}`}
          sx={{ textTransform: 'none' }}
        >
          {hasResume ? 'Resume' : 'Start course'}
        </Button>
      </Box>
    </Paper>
  );
}
