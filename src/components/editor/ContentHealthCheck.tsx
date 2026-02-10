import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useEditor } from '@/contexts/EditorContext';

interface HealthIssue {
  severity: 'error' | 'warning';
  message: string;
  detail: string;
}

export function ContentHealthCheck() {
  const { content } = useEditor();
  if (!content) return null;

  const issues: HealthIssue[] = [];

  // Items missing URLs
  Object.values(content.items).forEach((item) => {
    if (['pdf', 'video', 'doc', 'ppt', 'spreadsheet', 'link', 'audio'].includes(item.type) && !item.url) {
      issues.push({ severity: 'warning', message: `"${item.title}" missing URL`, detail: item.type });
    }
    if (item.type === 'youtube' && !item.embedUrl) {
      issues.push({ severity: 'warning', message: `"${item.title}" missing embed URL`, detail: 'youtube' });
    }
    if (item.type === 'quiz' && (!item.quizQuestions || item.quizQuestions.length === 0)) {
      issues.push({ severity: 'error', message: `"${item.title}" has no questions`, detail: 'quiz' });
    }
  });

  // Modules with no items
  Object.values(content.modules).forEach((mod) => {
    if (mod.items.length === 0) {
      issues.push({ severity: 'warning', message: `Module "${mod.title}" is empty`, detail: '0 items' });
    }
  });

  // Courses with no modules
  Object.values(content.courses).forEach((course) => {
    if (course.modules.length === 0) {
      issues.push({ severity: 'warning', message: `Course "${course.title}" has no modules`, detail: 'empty' });
    }
  });

  const draftSize = (() => {
    try {
      const data = localStorage.getItem('lws_draft_content');
      return data ? (new Blob([data]).size / 1024).toFixed(1) : '0';
    } catch {
      return '0';
    }
  })();

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {issues.length === 0 ? (
              <><CheckIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'success.main' }} />Content Health: All Good</>
            ) : (
              <><WarningIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'warning.main' }} />{issues.length} Issue{issues.length !== 1 ? 's' : ''} Found</>
            )}
          </Typography>
          <Chip label={`Draft: ${draftSize} KB`} size="small" variant="outlined" />
        </Box>
        {issues.length > 0 && (
          <List dense disablePadding sx={{ maxHeight: 200, overflow: 'auto' }}>
            {issues.map((issue, i) => (
              <ListItem key={i} sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {issue.severity === 'error' ? <ErrorIcon color="error" fontSize="small" /> : <WarningIcon color="warning" fontSize="small" />}
                </ListItemIcon>
                <ListItemText primary={issue.message} />
                <Chip label={issue.detail} size="small" variant="outlined" />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
