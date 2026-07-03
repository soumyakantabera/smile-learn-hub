import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Stack,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import {
  VolumeUp as ListenIcon,
  Stop as StopIcon,
  Translate as TranslateIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import type { ContentItem } from '@/types/content';
import { useTTS } from '@/hooks/useTTS';

interface Props {
  item: ContentItem;
}

const SPEAKER_COLORS = ['#0F3D2E', '#F26B5E', '#F5B921', '#4F46E5'];

export function ConversationViewer({ item }: Props) {
  const { supported, speak, cancel, speaking } = useTTS();
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const convo = item.conversation;
  const lines = convo?.lines || [];

  const speakerColor = (speaker: string) => {
    const speakers = Array.from(new Set(lines.map((l) => l.speaker)));
    const idx = Math.max(0, speakers.indexOf(speaker));
    return SPEAKER_COLORS[idx % SPEAKER_COLORS.length];
  };

  const playFrom = async (start: number) => {
    for (let i = start; i < lines.length; i++) {
      const line = lines[i];
      setActiveIdx(i);
      await new Promise<void>((resolve) => {
        speak(line.text, {
          voiceURI: line.voiceURI,
          lang: line.lang,
          rate: line.rate,
          pitch: line.pitch,
          onEnd: () => resolve(),
        });
      });
    }
    setActiveIdx(null);
  };

  if (lines.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">This conversation is empty.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {convo?.scenario && (
          <>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Scenario
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              {convo.scenario}
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </>
        )}

        <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
          <Button
            startIcon={speaking ? <StopIcon /> : <PlayIcon />}
            onClick={
              speaking
                ? () => {
                    cancel();
                    setActiveIdx(null);
                  }
                : () => playFrom(0)
            }
            variant="contained"
            disabled={!supported}
            sx={{ bgcolor: '#0F3D2E', '&:hover': { bgcolor: '#0a2c22' } }}
          >
            {speaking ? 'Stop' : 'Play conversation'}
          </Button>
          {!supported && (
            <Chip label="Your browser doesn't speak — text only" size="small" color="warning" />
          )}
        </Stack>

        <Stack spacing={1.5}>
          {lines.map((line, idx) => {
            const color = speakerColor(line.speaker);
            const isActive = activeIdx === idx;
            return (
              <Box
                key={line.id}
                sx={{
                  display: 'flex',
                  flexDirection: idx % 2 === 0 ? 'row' : 'row-reverse',
                  gap: 1.5,
                  alignItems: 'flex-start',
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: color,
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {line.speaker.slice(0, 2).toUpperCase()}
                </Box>
                <Box
                  sx={{
                    maxWidth: { xs: '85%', sm: '75%' },
                    bgcolor: isActive ? `${color}22` : 'background.default',
                    border: 1,
                    borderColor: isActive ? color : 'divider',
                    borderRadius: 3,
                    p: 1.5,
                    transition: 'all 0.2s',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="caption" fontWeight={700} sx={{ color }}>
                      {line.speaker}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() =>
                        speak(line.text, {
                          voiceURI: line.voiceURI,
                          lang: line.lang,
                          rate: line.rate,
                          pitch: line.pitch,
                        })
                      }
                      disabled={!supported}
                      aria-label="Listen to line"
                      sx={{ color }}
                    >
                      <ListenIcon fontSize="small" />
                    </IconButton>
                    {line.translation && (
                      <IconButton
                        size="small"
                        onClick={() => setRevealed((r) => ({ ...r, [line.id]: !r[line.id] }))}
                        aria-label="Show translation"
                      >
                        <TranslateIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                  <Typography variant="body1">{line.text}</Typography>
                  {line.translation && revealed[line.id] && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                      {line.translation}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
