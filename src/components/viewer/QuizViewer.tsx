import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as WrongIcon,
  NavigateNext as NextIcon,
  Replay as RetryIcon,
} from '@mui/icons-material';
import type { ContentItem, QuizQuestion } from '@/types/content';

interface QuizViewerProps {
  item: ContentItem;
}

export function QuizViewer({ item }: QuizViewerProps) {
  const questions = item.quizQuestions || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));

  if (questions.length === 0) {
    return (
      <Alert severity="info">
        This quiz has no questions configured yet.
      </Alert>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers];
    newAnswers[currentIndex] = selectedAnswer;
    setAnswers(newAnswers);

    if (selectedAnswer === currentQuestion.correctIndex) {
      setScore(score + 1);
    }
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setIsComplete(false);
    setAnswers(new Array(questions.length).fill(null));
  };

  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              bgcolor: percentage >= 70 ? 'success.light' : percentage >= 50 ? 'warning.light' : 'error.light',
              color: percentage >= 70 ? 'success.dark' : percentage >= 50 ? 'warning.dark' : 'error.dark',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <Typography variant="h4" fontWeight={700}>
              {percentage}%
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Quiz Complete!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You scored {score} out of {questions.length} questions correctly.
          </Typography>
          <Chip
            label={percentage >= 70 ? 'Great job!' : percentage >= 50 ? 'Good effort!' : 'Keep practicing!'}
            color={percentage >= 70 ? 'success' : percentage >= 50 ? 'warning' : 'error'}
            sx={{ mb: 3 }}
          />
          <Box>
            <Button
              variant="contained"
              startIcon={<RetryIcon />}
              onClick={handleRetry}
              size="large"
            >
              Try Again
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Question {currentIndex + 1} of {questions.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Score: {score}/{currentIndex + (showResult ? 1 : 0)}
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
        </Box>

        {/* Question */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          {currentQuestion.question}
        </Typography>

        {/* Options */}
        <RadioGroup
          value={selectedAnswer}
          onChange={(e) => !showResult && setSelectedAnswer(parseInt(e.target.value))}
        >
          {currentQuestion.options.map((option, index) => {
            const isCorrect = index === currentQuestion.correctIndex;
            const isSelected = selectedAnswer === index;
            
            let bgColor = 'transparent';
            let borderColor = 'divider';
            
            if (showResult) {
              if (isCorrect) {
                bgColor = 'success.50';
                borderColor = 'success.main';
              } else if (isSelected && !isCorrect) {
                bgColor = 'error.50';
                borderColor = 'error.main';
              }
            }

            return (
              <Box
                key={index}
                sx={{
                  mb: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  border: 1,
                  borderColor,
                  bgcolor: bgColor,
                  transition: 'all 0.2s',
                  cursor: showResult ? 'default' : 'pointer',
                  '&:hover': showResult ? {} : { borderColor: 'primary.main', bgcolor: 'action.hover' },
                }}
              >
                <FormControlLabel
                  value={index}
                  control={<Radio disabled={showResult} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>{option}</Typography>
                      {showResult && isCorrect && <CheckIcon color="success" fontSize="small" />}
                      {showResult && isSelected && !isCorrect && <WrongIcon color="error" fontSize="small" />}
                    </Box>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </Box>
            );
          })}
        </RadioGroup>

        {/* Explanation */}
        {showResult && currentQuestion.explanation && (
          <Alert severity={selectedAnswer === currentQuestion.correctIndex ? 'success' : 'info'} sx={{ mt: 2, mb: 3 }}>
            <Typography variant="body2">
              <strong>Explanation:</strong> {currentQuestion.explanation}
            </Typography>
          </Alert>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          {!showResult ? (
            <Button
              variant="contained"
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              variant="contained"
              endIcon={<NextIcon />}
              onClick={handleNext}
            >
              {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
