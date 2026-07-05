import React, { useState, useEffect, useMemo } from 'react';
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
  TextField,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as WrongIcon,
  Replay as RetryIcon,
  VolumeUp as ListenIcon,
  Favorite as HeartIcon,
  Close as ClearIcon,
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

const FOREST = '#0F3D2E';
const FOREST_DARK = '#0a2c22';
const AMBER = '#F5B921';
const CORAL = '#F26B5E';
const MINT = '#C8E6D3';
const SUCCESS_BG = '#DCFCE7';
const SUCCESS = '#16A34A';
const ERROR_BG = '#FEE2E2';
const ERROR = '#DC2626';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function evaluate(q: QuizQuestion, state: any): boolean {
  switch (q.type) {
    case 'tap-order': {
      const expected = q.correctOrder || [];
      const given: string[] = state.order || [];
      if (given.length !== expected.length) return false;
      return given.every((w, i) => w.trim().toLowerCase() === expected[i].trim().toLowerCase());
    }
    case 'match': {
      const pairs = q.pairs || [];
      const map: Record<string, string> = state.matches || {};
      return pairs.every((p) => (map[p.left] || '').trim().toLowerCase() === p.right.trim().toLowerCase());
    }
    case 'fill-blank': {
      const expected = q.blanks || [];
      const given: string[] = state.blanks || [];
      if (given.length < expected.length) return false;
      return expected.every((b, i) => (given[i] || '').trim().toLowerCase() === b.trim().toLowerCase());
    }
    default:
      return state.selected === q.correctIndex;
  }
}

/**
 * Duolingo-style one-question-at-a-time quiz viewer.
 * Supports mcq, listen-choose, tap-order, match, fill-blank.
 */
export function StepQuizViewer({ item, hearts = 3 }: Props) {
  const { content } = useContent();
  const { supported: ttsSupported, speak } = useTTS();
  const questions = item.quizQuestions || [];

  const [idx, setIdx] = useState(0);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [remainingHearts, setRemainingHearts] = useState(hearts);
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState(false);

  // Per-question interactive state
  const [selected, setSelected] = useState<number | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [bankIndices, setBankIndices] = useState<number[]>([]); // indices into shuffled bank still available
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [pickedLeft, setPickedLeft] = useState<string | null>(null);
  const [blanks, setBlanks] = useState<string[]>([]);

  const q = questions[idx];

  // Shuffled token bank for tap-order (stable per question index)
  const shuffledTokens = useMemo(() => {
    if (!q || q.type !== 'tap-order') return [];
    const src = q.tokens && q.tokens.length ? q.tokens : q.correctOrder || [];
    return shuffle(src);
  }, [q, idx]);

  // Shuffled right column for match (stable per question index)
  const shuffledRights = useMemo(() => {
    if (!q || q.type !== 'match') return [];
    return shuffle((q.pairs || []).map((p) => p.right));
  }, [q, idx]);

  // Reset per-question state when idx changes
  useEffect(() => {
    if (!q) return;
    setChecked(false);
    setSelected(null);
    setOrder([]);
    setBankIndices(shuffledTokens.map((_, i) => i));
    setMatches({});
    setPickedLeft(null);
    setBlanks(new Array(((q.question || '').match(/___/g) || q.blanks || []).length).fill(''));
    if (q.type === 'listen-choose' && q.audioText && ttsSupported) {
      const t = setTimeout(() => speak(q.audioText!, { lang: q.audioLang || 'en-US' }), 250);
      return () => clearTimeout(t);
    }
  }, [idx, q, shuffledTokens, ttsSupported, speak]);

  useEffect(() => {
    if (done && !saved) {
      const module = content ? getModule(content, item.moduleId) : null;
      const course = module && content ? getCourse(content, module.courseId) : null;
      saveQuizAttempt({
        itemId: item.id,
        courseId: course?.id,
        score,
        maxScore: questions.length,
        answers: [],
      });
      setSaved(true);
    }
  }, [done, saved, content, item, score, questions.length]);

  if (questions.length === 0) {
    return <Alert severity="info">This activity has no questions configured yet.</Alert>;
  }

  const reset = () => {
    setIdx(0);
    setScore(0);
    setRemainingHearts(hearts);
    setDone(false);
    setSaved(false);
  };

  const canCheck = (() => {
    if (checked) return false;
    switch (q.type) {
      case 'tap-order':
        return order.length === (q.correctOrder || []).length && order.length > 0;
      case 'match':
        return (q.pairs || []).every((p) => matches[p.left]);
      case 'fill-blank':
        return blanks.length > 0 && blanks.every((b) => b.trim().length > 0);
      default:
        return selected !== null;
    }
  })();

  const isCorrect = (() => {
    switch (q.type) {
      case 'tap-order':
        return evaluate(q, { order });
      case 'match':
        return evaluate(q, { matches });
      case 'fill-blank':
        return evaluate(q, { blanks });
      default:
        return selected === q.correctIndex;
    }
  })();

  const check = () => {
    if (!canCheck) return;
    setChecked(true);
    if (isCorrect) setScore((s) => s + 1);
    else setRemainingHearts((h) => Math.max(0, h - 1));
  };

  const goNext = () => {
    if (idx >= questions.length - 1 || remainingHearts === 0) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
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
              bgcolor: passed ? FOREST : CORAL,
              color: '#fff',
            }}
          >
            <Typography variant="h4" fontWeight={800}>{pct}%</Typography>
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
            sx={{ bgcolor: FOREST, '&:hover': { bgcolor: FOREST_DARK } }}
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const progress = ((idx + (checked ? 1 : 0)) / questions.length) * 100;

  const prompt = (() => {
    switch (q.type) {
      case 'listen-choose':
        return 'Tap what you hear';
      case 'tap-order':
        return q.question || 'Tap the words in the correct order';
      case 'match':
        return q.question || 'Match the pairs';
      case 'fill-blank':
        return 'Fill in the blanks';
      default:
        return q.question || 'Choose the correct answer';
    }
  })();

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
              bgcolor: MINT,
              '& .MuiLinearProgress-bar': { bgcolor: FOREST },
            }}
          />
          <Box sx={{ display: 'flex', gap: 0.25 }}>
            {Array.from({ length: hearts }).map((_, i) => (
              <HeartIcon
                key={i}
                fontSize="small"
                sx={{ color: i < remainingHearts ? CORAL : 'action.disabled' }}
              />
            ))}
          </Box>
        </Box>

        <Chip label={`Question ${idx + 1} of ${questions.length}`} size="small" sx={{ mb: 2 }} />

        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          {prompt}
        </Typography>

        {/* ===== LISTEN & CHOOSE ===== */}
        {q.type === 'listen-choose' && q.audioText && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <IconButton
              onClick={() => speak(q.audioText!, { lang: q.audioLang || 'en-US' })}
              disabled={!ttsSupported}
              sx={{ width: 88, height: 88, bgcolor: FOREST, color: '#fff', '&:hover': { bgcolor: FOREST_DARK } }}
            >
              <ListenIcon sx={{ fontSize: 44 }} />
            </IconButton>
          </Box>
        )}

        {/* ===== TAP-ORDER ===== */}
        {q.type === 'tap-order' ? (
          <Box>
            {/* Answer tray */}
            <Box
              sx={{
                minHeight: 64,
                p: 1.5,
                mb: 2,
                borderRadius: 2,
                border: 2,
                borderStyle: 'dashed',
                borderColor: checked ? (isCorrect ? SUCCESS : ERROR) : 'divider',
                bgcolor: checked ? (isCorrect ? SUCCESS_BG : ERROR_BG) : 'background.default',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                alignItems: 'center',
              }}
            >
              {order.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Tap words below to build the sentence…
                </Typography>
              )}
              {order.map((w, i) => (
                <Chip
                  key={`${w}-${i}`}
                  label={w}
                  onDelete={
                    checked
                      ? undefined
                      : () => {
                          // Return token to bank
                          const returnIdx = shuffledTokens.findIndex(
                            (t, ti) => t === w && !bankIndices.includes(ti) && !order.slice(0, i).includes(t),
                          );
                          setOrder(order.filter((_, k) => k !== i));
                          if (returnIdx >= 0) setBankIndices([...bankIndices, returnIdx].sort((a, b) => a - b));
                        }
                  }
                  sx={{ bgcolor: '#fff', border: 1, borderColor: FOREST, color: FOREST, fontWeight: 600 }}
                />
              ))}
            </Box>
            {/* Token bank */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {shuffledTokens.map((tok, ti) => {
                const available = bankIndices.includes(ti);
                return (
                  <Button
                    key={ti}
                    onClick={() => {
                      if (checked || !available) return;
                      setOrder([...order, tok]);
                      setBankIndices(bankIndices.filter((b) => b !== ti));
                    }}
                    disabled={checked || !available}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      color: FOREST,
                      bgcolor: available ? '#fff' : MINT,
                      border: 2,
                      borderColor: available ? FOREST : 'transparent',
                      borderRadius: 2,
                      px: 2,
                      opacity: available ? 1 : 0.35,
                      '&:hover': { bgcolor: MINT },
                    }}
                  >
                    {tok}
                  </Button>
                );
              })}
            </Box>
            {checked && !isCorrect && (
              <Typography variant="body2" sx={{ mt: 2, color: ERROR }}>
                Correct: <strong>{(q.correctOrder || []).join(' ')}</strong>
              </Typography>
            )}
          </Box>
        ) : q.type === 'match' ? (
          /* ===== MATCH ===== */
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Box sx={{ display: 'grid', gap: 1 }}>
              {(q.pairs || []).map((p) => {
                const matched = !!matches[p.left];
                const rightMatched = matches[p.left];
                const correctPair = rightMatched === p.right;
                const bg = checked
                  ? correctPair
                    ? SUCCESS_BG
                    : matched
                      ? ERROR_BG
                      : '#fff'
                  : pickedLeft === p.left
                    ? '#FEF3C7'
                    : matched
                      ? MINT
                      : '#fff';
                return (
                  <Button
                    key={p.left}
                    onClick={() => !checked && !matched && setPickedLeft(p.left)}
                    disabled={checked || matched}
                    sx={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      textTransform: 'none',
                      fontWeight: 600,
                      color: FOREST,
                      bgcolor: bg,
                      border: 2,
                      borderColor: pickedLeft === p.left ? AMBER : matched ? FOREST : 'divider',
                      borderRadius: 2,
                      p: 1.5,
                    }}
                  >
                    {p.left}
                    {matched && (
                      <Chip
                        size="small"
                        label={rightMatched}
                        sx={{ ml: 'auto', bgcolor: '#fff', color: FOREST }}
                      />
                    )}
                  </Button>
                );
              })}
            </Box>
            <Box sx={{ display: 'grid', gap: 1 }}>
              {shuffledRights.map((right, ri) => {
                const usedByLeft = Object.entries(matches).find(([, v]) => v === right)?.[0];
                const used = !!usedByLeft;
                return (
                  <Button
                    key={ri}
                    onClick={() => {
                      if (checked || used || !pickedLeft) return;
                      setMatches({ ...matches, [pickedLeft]: right });
                      setPickedLeft(null);
                    }}
                    disabled={checked || used || !pickedLeft}
                    sx={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      textTransform: 'none',
                      fontWeight: 600,
                      color: FOREST,
                      bgcolor: used ? MINT : '#fff',
                      border: 2,
                      borderColor: used ? FOREST : 'divider',
                      borderRadius: 2,
                      p: 1.5,
                      opacity: used ? 0.5 : 1,
                    }}
                  >
                    {right}
                  </Button>
                );
              })}
            </Box>
            {Object.keys(matches).length > 0 && !checked && (
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={() => {
                  setMatches({});
                  setPickedLeft(null);
                }}
                sx={{ gridColumn: '1 / -1', color: FOREST }}
              >
                Reset matches
              </Button>
            )}
          </Box>
        ) : q.type === 'fill-blank' ? (
          /* ===== FILL-BLANK ===== */
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', lineHeight: 2.5 }}>
            {(() => {
              const parts = (q.question || '').split('___');
              return parts.map((part, i) => (
                <React.Fragment key={i}>
                  <Typography component="span" variant="h6" sx={{ color: 'text.primary' }}>
                    {part}
                  </Typography>
                  {i < parts.length - 1 && (
                    <TextField
                      size="small"
                      value={blanks[i] || ''}
                      onChange={(e) => {
                        const next = [...blanks];
                        next[i] = e.target.value;
                        setBlanks(next);
                      }}
                      disabled={checked}
                      placeholder="…"
                      sx={{
                        width: 120,
                        '& .MuiOutlinedInput-root': {
                          bgcolor: checked
                            ? (blanks[i] || '').trim().toLowerCase() ===
                              (q.blanks?.[i] || '').trim().toLowerCase()
                              ? SUCCESS_BG
                              : ERROR_BG
                            : '#fff',
                        },
                      }}
                    />
                  )}
                </React.Fragment>
              ));
            })()}
            {checked && !isCorrect && (
              <Typography variant="body2" sx={{ mt: 2, color: ERROR, width: '100%' }}>
                Correct: <strong>{(q.blanks || []).join(', ')}</strong>
              </Typography>
            )}
          </Box>
        ) : (
          /* ===== MCQ / LISTEN-CHOOSE options ===== */
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            {q.options.map((opt, i) => {
              const isSel = selected === i;
              const isRight = checked && i === q.correctIndex;
              const isWrongPick = checked && isSel && i !== q.correctIndex;
              const bg = isRight
                ? SUCCESS_BG
                : isWrongPick
                  ? ERROR_BG
                  : isSel
                    ? '#FEF3C7'
                    : 'background.paper';
              const border = isRight ? SUCCESS : isWrongPick ? ERROR : isSel ? AMBER : 'divider';
              return (
                <Button
                  key={i}
                  onClick={() => !checked && setSelected(i)}
                  disabled={checked && !isSel && !isRight}
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
                    '&:hover': { bgcolor: isSel ? bg : 'action.hover' },
                  }}
                >
                  <span>{opt}</span>
                  {isRight && <CheckIcon sx={{ color: SUCCESS }} />}
                  {isWrongPick && <WrongIcon sx={{ color: ERROR }} />}
                </Button>
              );
            })}
          </Box>
        )}

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
            bgcolor: checked ? (isCorrect ? SUCCESS_BG : ERROR_BG) : 'background.paper',
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
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: isCorrect ? '#166534' : '#991B1B' }}>
                  {isCorrect ? 'Correct!' : 'Not quite'}
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
              disabled={!canCheck}
              onClick={check}
              sx={{ bgcolor: FOREST, '&:hover': { bgcolor: FOREST_DARK } }}
            >
              Check
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={goNext}
              sx={{
                bgcolor: isCorrect ? SUCCESS : CORAL,
                '&:hover': { bgcolor: isCorrect ? '#15803d' : '#dc4a3d' },
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
