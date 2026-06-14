import React from 'react';
import { Box, Typography, Chip, Tooltip, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { SequenceEntry } from '@/lib/contentNavigation';

interface Props {
  sequence: SequenceEntry[];
  currentItemId: string;
  visited: Set<string>;
  courseTitle?: string;
  moduleTitle?: string;
}

export function CourseProgressRail({
  sequence,
  currentItemId,
  visited,
  courseTitle,
  moduleTitle,
}: Props) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const currentIdx = sequence.findIndex((s) => s.item.id === currentItemId);
  const total = sequence.length;
  const moduleIds = Array.from(new Set(sequence.map((s) => s.module.id)));
  const moduleIndex = sequence[currentIdx]
    ? moduleIds.indexOf(sequence[currentIdx].module.id)
    : -1;
  const pct = total > 0 ? Math.round(((currentIdx + 1) / total) * 100) : 0;

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 1,
          mb: 1,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          {!isMobile && courseTitle && (
            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1 }}>
              {courseTitle}
            </Typography>
          )}
          <Typography variant="body2" fontWeight={600} noWrap>
            {moduleTitle ? `${moduleTitle}` : 'Course progress'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Module {moduleIndex + 1} of {moduleIds.length} · Item {currentIdx + 1} of {total}
          </Typography>
          <Chip size="small" color="primary" label={`${pct}%`} sx={{ fontWeight: 700 }} />
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          gap: 0.5,
          width: '100%',
          height: 8,
          alignItems: 'stretch',
        }}
      >
        {moduleIds.map((modId) => {
          const modEntries = sequence.filter((s) => s.module.id === modId);
          const modTitle = modEntries[0]?.module.title || '';
          return (
            <Box
              key={modId}
              sx={{
                flex: modEntries.length,
                display: 'flex',
                gap: '2px',
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: 'action.hover',
              }}
            >
              {modEntries.map((entry) => {
                const active = entry.item.id === currentItemId;
                const done = visited.has(entry.item.id) && !active;
                return (
                  <Tooltip
                    key={entry.item.id}
                    title={`${modTitle} — ${entry.item.title}`}
                    arrow
                    placement="top"
                  >
                    <Box
                      component="button"
                      onClick={() => navigate(`/view/${entry.item.id}`)}
                      aria-label={`Jump to ${entry.item.title}`}
                      sx={{
                        appearance: 'none',
                        border: 0,
                        p: 0,
                        cursor: 'pointer',
                        flex: 1,
                        bgcolor: active
                          ? 'primary.main'
                          : done
                          ? 'primary.light'
                          : 'transparent',
                        boxShadow: active
                          ? `0 0 0 2px ${theme.palette.primary.main}66`
                          : 'none',
                        transition: 'background 160ms ease, transform 160ms ease',
                        '&:hover': { bgcolor: active ? 'primary.dark' : 'primary.main' },
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
