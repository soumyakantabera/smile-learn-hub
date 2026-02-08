import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import type { QuizQuestion } from '@/types/content';

interface QuizEditorProps {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}

export function QuizEditor({ questions, onChange }: QuizEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: '',
    };
    onChange([...questions, newQuestion]);
    setExpandedIndex(questions.length);
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    onChange(updated);
  };

  const removeQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  return (
    <Box>
      {questions.map((q, qIndex) => (
        <Card key={q.id} sx={{ mb: 2 }}>
          <CardContent sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ flex: 1 }}>
                Q{qIndex + 1}: {q.question || '(untitled)'}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setExpandedIndex(expandedIndex === qIndex ? null : qIndex)}
              >
                {expandedIndex === qIndex ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
              <IconButton size="small" color="error" onClick={() => removeQuestion(qIndex)}>
                <DeleteIcon />
              </IconButton>
            </Box>

            <Collapse in={expandedIndex === qIndex}>
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Question"
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                  fullWidth
                  placeholder="e.g., What is the correct greeting for morning?"
                />

                <Typography variant="body2" fontWeight={500}>
                  Options (select correct answer):
                </Typography>
                <RadioGroup
                  value={q.correctIndex}
                  onChange={(e) => updateQuestion(qIndex, { correctIndex: parseInt(e.target.value) })}
                >
                  {q.options.map((opt, optIndex) => (
                    <Box key={optIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <FormControlLabel
                        value={optIndex}
                        control={<Radio size="small" />}
                        label=""
                        sx={{ mr: 0 }}
                      />
                      <TextField
                        size="small"
                        value={opt}
                        onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                        placeholder={`Option ${optIndex + 1}`}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: q.correctIndex === optIndex ? 'success.50' : 'transparent',
                          },
                        }}
                      />
                    </Box>
                  ))}
                </RadioGroup>

                <TextField
                  label="Explanation (optional)"
                  value={q.explanation || ''}
                  onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Explain why this is the correct answer..."
                />
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      ))}

      <Button startIcon={<AddIcon />} onClick={addQuestion} variant="outlined" fullWidth>
        Add Question
      </Button>

      {questions.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          No questions added yet. Click "Add Question" to create quiz questions.
        </Typography>
      )}
    </Box>
  );
}
