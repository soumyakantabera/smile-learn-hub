import React, { useState, useRef } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  DragIndicator as DragIcon,
  PlayArrow as PlayIcon,
  VolumeUp as ListenIcon,
} from '@mui/icons-material';
import type { QuizQuestion, QuestionType } from '@/types/content';
import { QuizPreviewDialog } from './QuizPreviewDialog';
import { useTTS } from '@/hooks/useTTS';

interface QuizEditorProps {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}

export function QuizEditor({ questions, onChange }: QuizEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const dragFrom = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);
  const { supported: ttsSupported, speak } = useTTS();

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: '',
      type: 'mcq',
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

  const handleDragEnd = () => {
    if (
      dragFrom.current !== null &&
      dragOver.current !== null &&
      dragFrom.current !== dragOver.current
    ) {
      const next = [...questions];
      const [moved] = next.splice(dragFrom.current, 1);
      next.splice(dragOver.current, 0, moved);
      onChange(next);
    }
    dragFrom.current = null;
    dragOver.current = null;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button
          size="small"
          startIcon={<PlayIcon />}
          onClick={() => setPreviewOpen(true)}
          disabled={questions.length === 0}
        >
          Take Quiz Preview
        </Button>
      </Box>

      {questions.map((q, qIndex) => (
        <Card
          key={q.id}
          sx={{ mb: 2, cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
          draggable
          onDragStart={() => (dragFrom.current = qIndex)}
          onDragEnter={() => (dragOver.current = qIndex)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.preventDefault()}
        >
          <CardContent sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DragIcon sx={{ color: 'text.disabled' }} aria-label="Drag to reorder" />
              <Typography variant="subtitle2" sx={{ flex: 1 }}>
                Q{qIndex + 1}: {q.question || '(untitled)'}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setExpandedIndex(expandedIndex === qIndex ? null : qIndex)}
                aria-label={expandedIndex === qIndex ? 'Collapse question' : 'Expand question'}
              >
                {expandedIndex === qIndex ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => removeQuestion(qIndex)}
                aria-label="Delete question"
              >
                <DeleteIcon />
              </IconButton>
            </Box>

            <Collapse in={expandedIndex === qIndex}>
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Question type</InputLabel>
                    <Select
                      label="Question type"
                      value={q.type || 'mcq'}
                      onChange={(e) =>
                        updateQuestion(qIndex, { type: e.target.value as QuestionType })
                      }
                    >
                      <MenuItem value="mcq">Multiple choice</MenuItem>
                      <MenuItem value="listen-choose">Listen &amp; choose (TTS)</MenuItem>
                      <MenuItem value="tap-order">Tap to arrange (word order)</MenuItem>
                      <MenuItem value="match">Match pairs</MenuItem>
                      <MenuItem value="fill-blank">Fill in the blank</MenuItem>
                    </Select>
                  </FormControl>
                  {(q.type || 'mcq') === 'listen-choose' && (
                    <Chip size="small" color="info" label="Learner hears audio, picks matching text" />
                  )}
                  {q.type === 'tap-order' && (
                    <Chip size="small" color="warning" label="Learner arranges shuffled words into correct order" />
                  )}
                  {q.type === 'match' && (
                    <Chip size="small" color="success" label="Learner matches left items to right items" />
                  )}
                  {q.type === 'fill-blank' && (
                    <Chip size="small" color="secondary" label='Use "___" in sentence for each blank' />
                  )}

                </Box>

                {(q.type || 'mcq') === 'listen-choose' ? (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <TextField
                      label="Text to speak"
                      value={q.audioText || ''}
                      onChange={(e) => updateQuestion(qIndex, { audioText: e.target.value })}
                      fullWidth
                      multiline
                      placeholder="e.g., Good morning, how are you?"
                    />
                    <TextField
                      label="Lang"
                      size="small"
                      value={q.audioLang || 'en-US'}
                      onChange={(e) => updateQuestion(qIndex, { audioLang: e.target.value })}
                      sx={{ width: 110 }}
                    />
                    <IconButton
                      onClick={() =>
                        q.audioText && speak(q.audioText, { lang: q.audioLang || 'en-US' })
                      }
                      disabled={!ttsSupported || !q.audioText}
                      aria-label="Preview audio"
                      sx={{ color: '#0F3D2E', mt: 1 }}
                    >
                      <ListenIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <TextField
                    label="Question"
                    value={q.question}
                    onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                    fullWidth
                    placeholder="e.g., What is the correct greeting for morning?"
                  />
                )}

                <Typography variant="body2" fontWeight={500}>
                  Options (select correct answer):
                </Typography>
                <RadioGroup
                  value={q.correctIndex}
                  onChange={(e) => updateQuestion(qIndex, { correctIndex: parseInt(e.target.value) })}
                >
                  {q.options.map((opt, optIndex) => (
                    <Box key={optIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <FormControlLabel value={optIndex} control={<Radio size="small" />} label="" sx={{ mr: 0 }} />
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

      <QuizPreviewDialog open={previewOpen} onClose={() => setPreviewOpen(false)} questions={questions} />
    </Box>
  );
}
