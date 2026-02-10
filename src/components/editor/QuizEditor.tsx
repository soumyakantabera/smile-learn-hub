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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Grid,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  DragIndicator as DragIcon,
  ContentCopy as DuplicateIcon,
  Visibility as PreviewIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import type { QuizQuestion, QuestionType } from '@/types/content';

interface QuizEditorProps {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}

const DIFFICULTY_COLORS = { easy: 'success', medium: 'warning', hard: 'error' } as const;

export function QuizEditor({ questions, onChange }: QuizEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const addQuestion = (type: QuestionType = 'multiple_choice') => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      question: '',
      options: type === 'true_false' ? ['True', 'False'] : type === 'fill_blank' ? [''] : ['', '', '', ''],
      correctIndex: 0,
      explanation: '',
      type,
      difficulty: 'medium',
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
    updated[qIndex] = { ...updated[qIndex], options: [...updated[qIndex].options] };
    updated[qIndex].options[optIndex] = value;
    onChange(updated);
  };

  const addOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex] = { ...updated[qIndex], options: [...updated[qIndex].options, ''] };
    onChange(updated);
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    const opts = updated[qIndex].options.filter((_, i) => i !== optIndex);
    updated[qIndex] = { ...updated[qIndex], options: opts, correctIndex: Math.min(updated[qIndex].correctIndex, opts.length - 1) };
    onChange(updated);
  };

  const removeQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const duplicateQuestion = (index: number) => {
    const q = { ...questions[index], id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` };
    const updated = [...questions];
    updated.splice(index + 1, 0, q);
    onChange(updated);
  };

  const handleDragStart = (index: number) => { dragItem.current = index; };
  const handleDragEnter = (index: number) => { dragOverItem.current = index; };
  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const updated = [...questions];
      const [moved] = updated.splice(dragItem.current, 1);
      updated.splice(dragOverItem.current, 0, moved);
      onChange(updated);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleImport = () => {
    // Parse: Q: question\nA: option\nB: option\nC: option\nD: option\nAnswer: A
    const blocks = importText.split(/\n\n+/);
    const imported: QuizQuestion[] = [];
    blocks.forEach((block) => {
      const lines = block.trim().split('\n');
      const qLine = lines.find((l) => l.match(/^Q:/i));
      if (!qLine) return;
      const opts = lines.filter((l) => l.match(/^[A-D]:/i)).map((l) => l.replace(/^[A-D]:\s*/i, ''));
      const ansLine = lines.find((l) => l.match(/^Answer:/i));
      const ansLetter = ansLine?.replace(/^Answer:\s*/i, '').trim().toUpperCase() || 'A';
      const correctIndex = 'ABCD'.indexOf(ansLetter);
      imported.push({
        id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        question: qLine.replace(/^Q:\s*/i, ''),
        options: opts.length > 0 ? opts : ['', '', '', ''],
        correctIndex: correctIndex >= 0 ? correctIndex : 0,
        type: 'multiple_choice',
        difficulty: 'medium',
      });
    });
    if (imported.length > 0) {
      onChange([...questions, ...imported]);
      setImportText('');
      setImportOpen(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Chip label={`${questions.length} Questions`} size="small" color="primary" />
        <Button size="small" variant="outlined" onClick={() => setImportOpen(!importOpen)}>
          Import Questions
        </Button>
      </Box>

      {importOpen && (
        <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>Paste questions in this format:</Typography>
          <Typography variant="caption" color="text.secondary" component="pre" sx={{ mb: 1, display: 'block', fontFamily: 'monospace', fontSize: 11 }}>
            {`Q: What is the capital of France?\nA: London\nB: Paris\nC: Berlin\nD: Madrid\nAnswer: B\n\nQ: Next question...`}
          </Typography>
          <TextField multiline rows={4} fullWidth value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Paste questions here..." sx={{ mb: 1 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" variant="contained" onClick={handleImport} disabled={!importText.trim()}>Parse & Import</Button>
            <Button size="small" onClick={() => setImportOpen(false)}>Cancel</Button>
          </Box>
        </Card>
      )}

      {questions.map((q, qIndex) => (
        <Card
          key={q.id}
          sx={{ mb: 2 }}
          draggable
          onDragStart={() => handleDragStart(qIndex)}
          onDragEnter={() => handleDragEnter(qIndex)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.preventDefault()}
        >
          <CardContent sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DragIcon sx={{ color: 'text.disabled', cursor: 'grab', flexShrink: 0 }} />
              <Typography variant="subtitle2" sx={{ flex: 1 }}>
                Q{qIndex + 1}: {q.question || '(untitled)'}
              </Typography>
              {q.difficulty && <Chip label={q.difficulty} size="small" color={DIFFICULTY_COLORS[q.difficulty]} variant="outlined" />}
              <Chip label={q.type?.replace('_', ' ') || 'MC'} size="small" variant="outlined" />
              <Tooltip title="Preview"><IconButton size="small" onClick={() => setPreviewIndex(previewIndex === qIndex ? null : qIndex)}><PreviewIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Duplicate"><IconButton size="small" onClick={() => duplicateQuestion(qIndex)}><DuplicateIcon fontSize="small" /></IconButton></Tooltip>
              <IconButton size="small" onClick={() => setExpandedIndex(expandedIndex === qIndex ? null : qIndex)}>
                {expandedIndex === qIndex ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
              <IconButton size="small" color="error" onClick={() => removeQuestion(qIndex)}>
                <DeleteIcon />
              </IconButton>
            </Box>

            {/* Preview Mode */}
            {previewIndex === qIndex && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>{q.question}</Typography>
                {q.imageUrl && <Box component="img" src={q.imageUrl} alt="" sx={{ maxHeight: 120, borderRadius: 1, mb: 1 }} />}
                {q.options.map((opt, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                    <Radio checked={i === q.correctIndex} size="small" disabled />
                    <Typography variant="body2" sx={{ fontWeight: i === q.correctIndex ? 700 : 400, color: i === q.correctIndex ? 'success.main' : 'text.primary' }}>
                      {opt || `Option ${i + 1}`}
                    </Typography>
                  </Box>
                ))}
                {q.explanation && <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>💡 {q.explanation}</Typography>}
              </Alert>
            )}

            <Collapse in={expandedIndex === qIndex}>
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 4 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Type</InputLabel>
                      <Select value={q.type || 'multiple_choice'} label="Type" onChange={(e) => {
                        const type = e.target.value as QuestionType;
                        const opts = type === 'true_false' ? ['True', 'False'] : type === 'fill_blank' ? [q.options[0] || ''] : q.options;
                        updateQuestion(qIndex, { type, options: opts });
                      }}>
                        <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                        <MenuItem value="true_false">True / False</MenuItem>
                        <MenuItem value="fill_blank">Fill in the Blank</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Difficulty</InputLabel>
                      <Select value={q.difficulty || 'medium'} label="Difficulty" onChange={(e) => updateQuestion(qIndex, { difficulty: e.target.value as any })}>
                        <MenuItem value="easy">Easy</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="hard">Hard</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField size="small" label="Image URL" value={q.imageUrl || ''} onChange={(e) => updateQuestion(qIndex, { imageUrl: e.target.value })} fullWidth placeholder="https://..." />
                  </Grid>
                </Grid>

                <TextField label="Question" value={q.question} onChange={(e) => updateQuestion(qIndex, { question: e.target.value })} fullWidth />

                {(q.type || 'multiple_choice') !== 'fill_blank' ? (
                  <>
                    <Typography variant="body2" fontWeight={500}>Options (select correct answer):</Typography>
                    <RadioGroup value={q.correctIndex} onChange={(e) => updateQuestion(qIndex, { correctIndex: parseInt(e.target.value) })}>
                      {q.options.map((opt, optIndex) => (
                        <Box key={optIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <FormControlLabel value={optIndex} control={<Radio size="small" />} label="" sx={{ mr: 0 }} />
                          <TextField size="small" value={opt} onChange={(e) => updateOption(qIndex, optIndex, e.target.value)} placeholder={`Option ${optIndex + 1}`} fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: q.correctIndex === optIndex ? 'success.50' : 'transparent' } }}
                          />
                          {q.options.length > 2 && (
                            <IconButton size="small" onClick={() => removeOption(qIndex, optIndex)}><DeleteIcon fontSize="small" /></IconButton>
                          )}
                        </Box>
                      ))}
                    </RadioGroup>
                    {(q.type || 'multiple_choice') === 'multiple_choice' && q.options.length < 6 && (
                      <Button size="small" startIcon={<AddIcon />} onClick={() => addOption(qIndex)}>Add Option</Button>
                    )}
                  </>
                ) : (
                  <TextField label="Correct Answer" value={q.options[0]} onChange={(e) => updateOption(qIndex, 0, e.target.value)} fullWidth placeholder="Type the correct answer..." />
                )}

                <TextField label="Explanation (optional)" value={q.explanation || ''} onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })} fullWidth multiline rows={2} />
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      ))}

      {/* Add Question Buttons */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button startIcon={<AddIcon />} onClick={() => addQuestion('multiple_choice')} variant="outlined">
          Multiple Choice
        </Button>
        <Button startIcon={<AddIcon />} onClick={() => addQuestion('true_false')} variant="outlined">
          True / False
        </Button>
        <Button startIcon={<AddIcon />} onClick={() => addQuestion('fill_blank')} variant="outlined">
          Fill in Blank
        </Button>
      </Box>

      {questions.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          No questions added yet. Choose a question type above to get started.
        </Typography>
      )}
    </Box>
  );
}
