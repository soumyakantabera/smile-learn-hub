import React, { useEffect, useRef } from 'react';
import { Box, Tooltip, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { SequenceEntry } from '@/lib/contentNavigation';

interface Props {
  sequence: SequenceEntry[];
  currentItemId: string;
  visited: Set<string>;
}

export function ItemDotsStrip({ sequence, currentItemId, visited }: Props) {
  const theme = useTheme();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [currentItemId]);

  // Group dots visually by module via a thin separator
  let lastModuleId: string | null = null;

  return (
    <Box
      ref={containerRef}
      sx={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        overflowX: 'auto',
        px: 1,
        py: 0.5,
        '&::-webkit-scrollbar': { height: 4 },
        '&::-webkit-scrollbar-thumb': { background: theme.palette.divider, borderRadius: 4 },
      }}
    >
      {sequence.map((entry) => {
        const active = entry.item.id === currentItemId;
        const done = visited.has(entry.item.id) && !active;
        const newModule = entry.module.id !== lastModuleId;
        lastModuleId = entry.module.id;
        return (
          <React.Fragment key={entry.item.id}>
            {newModule && entry.indexInCourse > 0 && (
              <Box sx={{ width: 1, height: 14, bgcolor: 'divider', mx: 0.5, flexShrink: 0 }} />
            )}
            <Tooltip
              title={
                <Box sx={{ fontSize: 12 }}>
                  <Box sx={{ opacity: 0.7 }}>{entry.module.title}</Box>
                  <Box sx={{ fontWeight: 600 }}>{entry.item.title}</Box>
                </Box>
              }
              arrow
              placement="top"
            >
              <Box
                component="button"
                ref={active ? currentRef : undefined}
                onClick={() => navigate(`/view/${entry.item.id}`)}
                aria-label={`Go to ${entry.item.title}`}
                sx={{
                  appearance: 'none',
                  border: 0,
                  p: 0,
                  cursor: 'pointer',
                  flexShrink: 0,
                  width: active ? 22 : 10,
                  height: 10,
                  borderRadius: 5,
                  bgcolor: active
                    ? 'primary.main'
                    : done
                    ? 'primary.light'
                    : 'action.disabledBackground',
                  transition: 'all 160ms ease',
                  outline: active ? `2px solid ${theme.palette.primary.main}33` : 'none',
                  outlineOffset: 2,
                  '&:hover': {
                    transform: 'scale(1.25)',
                    bgcolor: active ? 'primary.dark' : 'primary.main',
                  },
                }}
              />
            </Tooltip>
          </React.Fragment>
        );
      })}
    </Box>
  );
}
