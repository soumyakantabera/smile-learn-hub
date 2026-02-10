import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import type { QuizSettings } from '@/types/content';

interface QuizSettingsPanelProps {
  settings: QuizSettings;
  onChange: (settings: QuizSettings) => void;
}

export function QuizSettingsPanel({ settings, onChange }: QuizSettingsPanelProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon fontSize="small" />
          Quiz Settings
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <TextField
              label="Time Limit (min)"
              type="number"
              size="small"
              fullWidth
              value={settings.timeLimit || ''}
              onChange={(e) => onChange({ ...settings, timeLimit: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="No limit"
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label="Passing Score (%)"
              type="number"
              size="small"
              fullWidth
              value={settings.passingScore || ''}
              onChange={(e) => onChange({ ...settings, passingScore: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="0-100"
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.shuffleQuestions || false}
                  onChange={(e) => onChange({ ...settings, shuffleQuestions: e.target.checked })}
                  size="small"
                />
              }
              label={<Typography variant="body2">Shuffle Questions</Typography>}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showExplanations || false}
                  onChange={(e) => onChange({ ...settings, showExplanations: e.target.checked })}
                  size="small"
                />
              }
              label={<Typography variant="body2">Show Explanations</Typography>}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
