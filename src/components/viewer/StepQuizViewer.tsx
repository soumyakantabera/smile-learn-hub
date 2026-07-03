import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Alert,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as WrongIcon,
  Replay as RetryIcon,
  VolumeUp as ListenIcon,
  Favorite as HeartIcon,
} from '@mui/icons-material';
import type { ContentItem, QuizQuestion } from '@/types/content';
import { saveQuizAttempt } from '@/lib/progress';
import { getModule, getCourse } from '@/lib/content';
import { useContent } from '@/contexts/ContentContext';
import { useTTS } from '@/hooks/useTTS';

interface Props {
  item: ContentItem;
  hearts?: number;
}

/**
 * Duolingo-style one-question-at-a-time quiz viewer.
 * Supports `mcq` and `listen-choose` question types (fallback to MCQ).
 */
export function StepQuizViewer({ item, hearts = 3 }: Props) {
  const { content } = useContent();
  const { supported: ttsSupported, speak } = useTTS();
  const questions = item.quizQuestions || [];

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null),
  );
  const [remainingHearts, setRemainingHearts] = useState(hearts);
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState(false);

  const q = questions[idx];

  // Auto-play TTS for listen-choose
  useEffect(() => {
    if (!q) return;
    if (q.type === 'listen-choose' && q.audioText && ttsSupported) {
      const t = setTimeout(
        () => speak(q.audioText!, { lang: q.audioLang || 'en-US' }),
        250,
      );
      return () => clearTimeout(t);
    }
  }, [idx, q, ttsSupported, speak]);

  useEffect(() => {
    if (done && !saved) {
      const module = content ? getModule(content, item.moduleId) : null;
      const course = module && content ? getCourse(content, module.courseId) : null;
      saveQuizAttempt({
        itemId: item.id,
        courseId: course?.id,
        score,
        maxScore: questions.length,
        answers,
      });
      setSaved(true);
    }
  }, [done, saved, content, item, score, questions.length, answers]);

  if (questions.length === 0) {
    return <Alert severity="info">This activity has no questions configured yet.</Alert>;
  }

  const reset = () => {
    setIdx(0);
    setSelected(null);
    setChecked(false);
    setScore(0);
    setAnswers(new Array(questions.length).fill(null));
    setRemainingHearts(hearts);
    setDone(false);
    setSaved(false);
  };

  const check = () => {
    if (selected === null) return;
    setChecked(true);
    const correct = selected === q.correctIndex;
    if (correct) setScore((s) => s + 1);
    else setRemainingHearts((h) => Math.max(0, h - 1));
    const next = [...answers];
    next[idx] = selected;
    setAnswers(next);
  };

  const goNext = () => {
    if (idx >= questions.length - 1 || remainingHearts === 0) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
    setChecked(false);
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 70 && remainingHearts > 0;
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 5 }}>
          <Box
            sx={{
              width: 96,
              height: 96,
              mx: 'auto',
              mb: 2,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              bgcolor: passed ? '#0F3D2E' : '#F26B5E',
              color: '#fff',
            }}
          >
            <Typography variant="h4" fontWeight={800}>
              {pct}%
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {passed ? 'Nice work!' : 'Almost there'}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {score} of {questions.length} correct
            {remainingHearts === 0 ? ' — you ran out of hearts' : ''}
          </Typography>
          <Button
            variant="contained"
            startIcon={<RetryIcon />}
            onClick={reset}
            sx={{ bgcolor: '#0F3D2E', '&:hover': { bgcolor: '#0a2c22' } }}
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const progress = ((idx + (checked ? 1 : 0)) / questions.length) * 100;
  const isListen = q.type === 'listen-choose';

  return (
    <Card>
      <CardContent sx={{ pb: 8 }}>
        {/* Top bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              flex: 1,
              height: 10,
              borderRadius: 5,
              '& .MuiLinearProgress-bar': { bgcolor: '#0F3D2E' },
            }}
          />
          <Box sx={{ display: 'flex', gap: 0.25 }}>
            {Array.from({ length: hearts }).map((_, i) => (
              <HeartIcon
                key={i}
                fontSize="small"
                sx={{ color: i < remainingHearts ? '#F26B5E' : 'action.disabled' }}
              />
            ))}
          </Box>
        </Box>

        <Chip label={`Question ${idx + 1} of ${questions.length}`} size="small" sx={{ mb: 2 }} />

        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          {isListen ? 'Tap what you hear' : q.question || 'Choose the correct answer'}
        </Typography>

        {isListen && q.audioText && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <IconButton
              onClick={() => speak(q.audioText!, { lang: q.audioLang || 'en-US' })}
              disabled={!ttsSupported}
              sx={{
                width: 88,
                height: 88,
                bgcolor: '#0F3D2E',
                color: '#fff',
                '&:hover': { bgcolor: '#0a2c22' },
              }}
            >
              <ListenIcon sx={{ fontSize: 44 }} />
            </IconButton>
          </Box>
        )}

        {/* Options */}
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          {q.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = checked && i === q.correctIndex;
            const isWrongPick = checked && isSelected && i !== q.correctIndex;
            const bg = isCorrect
              ? '#DCFCE7'
              : isWrongPick
                ? '#FEE2E2'
                : isSelected
                  ? '#FEF3C7'
                  : 'background.paper';
            const border = isCorrect
              ? '#16A34A'
              : isWrongPick
                ? '#DC2626'
                : isSelected
                  ? '#F5B921'
                  : 'divider';
            return (
              <Button
                key={i}
                onClick={() => !checked && setSelected(i)}
                disabled={checked && !isSelected && !isCorrect}
                sx={{
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  p: 2,
                  borderRadius: 2,
                  border: 2,
                  borderColor: border,
                  bgcolor: bg,
                  color: 'text.primary',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': { bgcolor: isSelected ? bg : 'action.hover' },
                }}
              >
                <span>{opt}</span>
                {isCorrect && <CheckIcon sx={{ color: '#16A34A' }} />}
                {isWrongPick && <WrongIcon sx={{ color: '#DC2626' }} />}
              </Button>
            );
          })}
        </Box>

        {/* Feedback / Actions bar */}
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            mt: 3,
            mx: -3,
            px: 3,
            py: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: checked
              ? selected === q.correctIndex
                ? '#DCFCE7'
                : '#FEE2E2'
              : 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            {checked && (
              <>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: selected === q.correctIndex ? '#166534' : '#991B1B' }}>
                  {selected === q.correctIndex ? 'Correct!' : 'Not quite'}
                </Typography>
                {q.explanation && (
                  <Typography variant="body2" color="text.secondary">
                    {q.explanation}
                  </Typography>
                )}
              </>
            )}
          </Box>
          {!checked ? (
            <Button
              variant="contained"
              disabled={selected === null}
              onClick={check}
              sx={{ bgcolor: '#0F3D2E', '&:hover': { bgcolor: '#0a2c22' } }}
            >
              Check
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={goNext}
              sx={{
                bgcolor: selected === q.correctIndex ? '#16A34A' : '#F26B5E',
                '&:hover': { bgcolor: selected === q.correctIndex ? '#15803d' : '#dc4a3d' },
              }}
            >
              Continue
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
