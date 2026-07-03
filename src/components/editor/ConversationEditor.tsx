import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Card,
  CardContent,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Slider,
  Chip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  VolumeUp as ListenIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import type { ConversationData, ConversationLine } from '@/types/content';
import { useTTS } from '@/hooks/useTTS';

interface Props {
  value: ConversationData;
  onChange: (v: ConversationData) => void;
}

const genId = () => `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export function ConversationEditor({ value, onChange }: Props) {
  const { supported, voices, speak, cancel, speaking } = useTTS();
  const dragFrom = React.useRef<number | null>(null);
  const dragOver = React.useRef<number | null>(null);

  const lines = value.lines || [];

  const voiceOptions = useMemo(() => {
    const langs = Array.from(new Set(voices.map((v) => v.lang))).sort();
    return { voices, langs };
  }, [voices]);

  const addLine = () => {
    const line: ConversationLine = {
      id: genId(),
      speaker: lines.length % 2 === 0 ? 'Anna' : 'Ravi',
      text: '',
      lang: voices[0]?.lang || 'en-US',
    };
    onChange({ ...value, lines: [...lines, line] });
  };

  const updateLine = (idx: number, patch: Partial<ConversationLine>) => {
    const next = [...lines];
    next[idx] = { ...next[idx], ...patch };
    onChange({ ...value, lines: next });
  };

  const removeLine = (idx: number) => {
    onChange({ ...value, lines: lines.filter((_, i) => i !== idx) });
  };

  const handleDragEnd = () => {
    if (
      dragFrom.current !== null &&
      dragOver.current !== null &&
      dragFrom.current !== dragOver.current
    ) {
      const next = [...lines];
      const [moved] = next.splice(dragFrom.current, 1);
      next.splice(dragOver.current, 0, moved);
      onChange({ ...value, lines: next });
    }
    dragFrom.current = null;
    dragOver.current = null;
  };

  const playAll = async () => {
    for (const line of lines) {
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
  };

  return (
    <Box>
      {!supported && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Your browser doesn't support speech synthesis. Conversations will still display text; learners on
          modern browsers will hear the lines.
        </Alert>
      )}

      <TextField
        label="Scenario / Context"
        placeholder="e.g., Ordering coffee at a café"
        value={value.scenario || ''}
        onChange={(e) => onChange({ ...value, scenario: e.target.value })}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
      />

      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
        <Button
          size="small"
          startIcon={speaking ? <StopIcon /> : <ListenIcon />}
          onClick={speaking ? cancel : playAll}
          disabled={!supported || lines.length === 0}
          variant="outlined"
        >
          {speaking ? 'Stop' : 'Play all'}
        </Button>
        <Chip label={`${lines.length} line${lines.length !== 1 ? 's' : ''}`} size="small" />
      </Stack>

      {lines.map((line, idx) => (
        <Card
          key={line.id}
          sx={{ mb: 1.5, cursor: 'grab', borderLeft: 4, borderColor: idx % 2 === 0 ? '#0F3D2E' : '#F26B5E' }}
          draggable
          onDragStart={() => (dragFrom.current = idx)}
          onDragEnter={() => (dragOver.current = idx)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.preventDefault()}
        >
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'flex-start' }}>
              <DragIcon sx={{ color: 'text.disabled', mt: { sm: 1 } }} />
              <TextField
                label="Speaker"
                size="small"
                value={line.speaker}
                onChange={(e) => updateLine(idx, { speaker: e.target.value })}
                sx={{ minWidth: 110 }}
              />
              <TextField
                label="Line"
                size="small"
                value={line.text}
                onChange={(e) => updateLine(idx, { text: e.target.value })}
                fullWidth
                multiline
              />
              <Stack direction="row" spacing={0.5}>
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
                  disabled={!supported || !line.text.trim()}
                  aria-label="Preview line"
                  sx={{ color: '#0F3D2E' }}
                >
                  <ListenIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeLine(idx)}
                  aria-label="Delete line"
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
              <TextField
                label="Translation (optional)"
                size="small"
                value={line.translation || ''}
                onChange={(e) => updateLine(idx, { translation: e.target.value })}
                fullWidth
              />
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Voice</InputLabel>
                <Select
                  label="Voice"
                  value={line.voiceURI || ''}
                  onChange={(e) => {
                    const v = voices.find((v) => v.voiceURI === e.target.value);
                    updateLine(idx, { voiceURI: e.target.value as string, lang: v?.lang || line.lang });
                  }}
                >
                  <MenuItem value="">
                    <em>Auto ({line.lang || 'default'})</em>
                  </MenuItem>
                  {voiceOptions.voices.slice(0, 60).map((v) => (
                    <MenuItem key={v.voiceURI} value={v.voiceURI}>
                      {v.name} — {v.lang}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ minWidth: 120 }}>
                <Typography variant="caption" color="text.secondary">
                  Rate
                </Typography>
                <Slider
                  size="small"
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  value={line.rate ?? 1}
                  onChange={(_, val) => updateLine(idx, { rate: val as number })}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}

      <Button startIcon={<AddIcon />} onClick={addLine} variant="outlined" fullWidth>
        Add line
      </Button>
    </Box>
  );
}
