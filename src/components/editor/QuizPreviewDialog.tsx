import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { QuizViewer } from '@/components/viewer/QuizViewer';
import type { QuizQuestion } from '@/types/content';

interface QuizPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
  title?: string;
}

export function QuizPreviewDialog({
  open,
  onClose,
  questions,
  title = 'Quiz Preview',
}: QuizPreviewDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <QuizViewer
          item={{
            id: 'preview',
            moduleId: '',
            title,
            description: '',
            type: 'quiz',
            tags: [],
            publishedAt: new Date().toISOString(),
            quizQuestions: questions,
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
