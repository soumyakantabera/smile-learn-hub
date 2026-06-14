import React, { useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  ListAlt as ListAltIcon,
  KeyboardArrowUp as UpIcon,
} from '@mui/icons-material';
import type { SequenceEntry } from '@/lib/contentNavigation';
import { ItemDotsStrip } from './ItemDotsStrip';

interface Props {
  prev: SequenceEntry | null;
  next: SequenceEntry | null;
  current: SequenceEntry | null;
  sequence: SequenceEntry[];
  visited: Set<string>;
  courseId: string;
  moduleId?: string;
  currentItemId: string;
  onOpenOutline: () => void;
}

export function ItemNavBar({
  prev,
  next,
  current,
  sequence,
  visited,
  courseId,
  moduleId,
  currentItemId,
  onOpenOutline,
}: Props) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const touchStartX = useRef<number | null>(null);

  const total = sequence.length;
  const idx = current?.indexInCourse ?? 0;
  const pct = total > 0 ? ((idx + 1) / total) * 100 : 0;

  const goNext = () => next && navigate(`/view/${next.item.id}`);
  const goPrev = () => prev && navigate(`/view/${prev.item.id}`);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 60) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  /* -------------------- Mobile -------------------- */
  if (isMobile) {
    return (
      <Paper
        elevation={8}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: { xs: 56, sm: 0 }, // sit above MobileBottomNav on xs
          zIndex: (t) => t.zIndex.appBar,
          px: 1.25,
          pt: 0.75,
          pb: `calc(8px + env(safe-area-inset-bottom))`,
          borderTop: 1,
          borderColor: 'divider',
          borderRadius: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{ height: 4, borderRadius: 2 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.25, lineHeight: 1.1 }}
              noWrap
            >
              {current?.module.title} · Item {idx + 1} of {total}
            </Typography>
          </Box>
          {moduleId && (
            <Tooltip title="Up to module">
              <IconButton
                size="small"
                onClick={() => navigate(`/modules/${moduleId}?from=${currentItemId}`)}
              >
                <UpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Course outline">
            <IconButton size="small" onClick={onOpenOutline}>
              <ListAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            disabled={!prev}
            onClick={goPrev}
            startIcon={<ArrowBackIcon />}
            sx={{ flex: 1, minHeight: 48, textTransform: 'none' }}
          >
            Prev
          </Button>
          {next ? (
            <Button
              variant="contained"
              onClick={goNext}
              endIcon={<ArrowForwardIcon />}
              sx={{ flex: 1, minHeight: 48, textTransform: 'none' }}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              component={RouterLink}
              to={`/courses/${courseId}`}
              endIcon={<CheckCircleIcon />}
              sx={{ flex: 1, minHeight: 48, textTransform: 'none' }}
            >
              Finish
            </Button>
          )}
        </Box>
      </Paper>
    );
  }

  /* -------------------- Desktop -------------------- */
  return (
    <Paper
      elevation={6}
      sx={{
        position: 'sticky',
        bottom: 16,
        mt: 3,
        zIndex: 5,
        p: 1.25,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'stretch',
        gap: 1.25,
        backdropFilter: 'blur(8px)',
        bgcolor: (t) =>
          t.palette.mode === 'dark'
            ? 'rgba(30,30,30,0.92)'
            : 'rgba(255,255,255,0.92)',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Button
        variant="outlined"
        disabled={!prev}
        onClick={goPrev}
        startIcon={<ArrowBackIcon />}
        sx={{
          width: 240,
          justifyContent: 'flex-start',
          textAlign: 'left',
          textTransform: 'none',
          py: 1.25,
        }}
      >
        <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.7, lineHeight: 1 }}>
            {prev?.module.title || 'Previous'}
          </Typography>
          <Typography variant="body2" fontWeight={600} noWrap>
            {prev ? prev.item.title : 'Start of course'}
          </Typography>
        </Box>
      </Button>

      <ItemDotsStrip
        sequence={sequence}
        currentItemId={currentItemId}
        visited={visited}
      />

      <Tooltip title="Course outline">
        <IconButton onClick={onOpenOutline} sx={{ alignSelf: 'center' }}>
          <ListAltIcon />
        </IconButton>
      </Tooltip>

      {next ? (
        <Button
          variant="contained"
          onClick={goNext}
          endIcon={<ArrowForwardIcon />}
          sx={{
            width: 240,
            justifyContent: 'flex-end',
            textAlign: 'right',
            textTransform: 'none',
            py: 1.25,
          }}
        >
          <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
            <Typography variant="caption" sx={{ display: 'block', opacity: 0.85, lineHeight: 1 }}>
              {next.module.title}
            </Typography>
            <Typography variant="body2" fontWeight={600} noWrap>
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
          sx={{ width: 240, textTransform: 'none', py: 1.25 }}
        >
          Finish course
        </Button>
      )}
    </Paper>
  );
}
