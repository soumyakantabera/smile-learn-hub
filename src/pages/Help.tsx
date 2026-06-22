import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Chip,
  Button,
  Stack,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  WhatsApp as WhatsAppIcon,
  Lock as LockIcon,
  PlayArrow as PlayIcon,
  Description as DocIcon,
} from '@mui/icons-material';
import { AppLayout } from '@/components/AppLayout';
import { appConfig } from '@/config/app.config';

const faqItems = [
  {
    question: 'How do I get an account?',
    answer:
      'Your instructor creates your account and shares your email and temporary password personally. There is no public sign up.',
  },
  {
    question: 'How do I access my course materials?',
    answer:
      'Once logged in, your dashboard shows all courses you have been enrolled in. Click a course → choose a module → open any item.',
  },
  {
    question: 'Will my progress sync across devices?',
    answer:
      'Yes. Progress, last opened item, and quiz attempts are stored in your account, so signing in on a different device will pick up exactly where you left off.',
  },
  {
    question: 'How do I submit homework?',
    answer:
      'Open a homework item and use the WhatsApp or Email submission button. The message is pre-filled with your name and course context.',
  },
  {
    question: 'I forgot my password — what now?',
    answer:
      'Tap "Support" or message the WhatsApp number below and an admin will reset your password.',
  },
];

export default function HelpPage() {
  const waUrl = `https://wa.me/${appConfig.support.whatsappNumber}?text=${encodeURIComponent(
    `Hi! I need help with ${appConfig.appName}.`,
  )}`;

  return (
    <AppLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Help & instructions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quick answers and a direct line to support.
        </Typography>
      </Box>

      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          background: 'var(--gradient-hero)',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            p: { xs: 2.5, sm: 3 },
          }}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <WhatsAppIcon sx={{ color: '#25D366' }} />
              <Typography variant="h6" fontWeight={800}>
                Talk to support on WhatsApp
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              We&apos;ll reply quickly at {appConfig.support.label}.
            </Typography>
          </Box>
          <Button
            href={waUrl}
            target="_blank"
            rel="noopener"
            variant="contained"
            size="large"
            startIcon={<WhatsAppIcon />}
            sx={{
              bgcolor: '#25D366',
              '&:hover': { bgcolor: '#1ebe5d' },
              px: 3,
            }}
          >
            Open WhatsApp
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <SchoolIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Quick start
            </Typography>
          </Stack>
          <List>
            {['Sign in with your email and password', 'Open a course from your dashboard', 'Pick a module and view items', 'Submit homework via WhatsApp/Email'].map(
              (text, i) => (
                <ListItem key={i}>
                  <ListItemIcon>
                    <Chip label={i + 1} size="small" color="primary" sx={{ fontWeight: 800 }} />
                  </ListItemIcon>
                  <ListItemText primary={text} primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItem>
              ),
            )}
          </List>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <DocIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Content types
            </Typography>
          </Stack>
          <List dense>
            <ListItem>
              <ListItemIcon><PlayIcon sx={{ color: 'hsl(217, 92%, 60%)' }} /></ListItemIcon>
              <ListItemText primary="Videos" secondary="Watch directly in the app" />
            </ListItem>
            <ListItem>
              <ListItemIcon><DocIcon sx={{ color: 'hsl(0, 84%, 60%)' }} /></ListItemIcon>
              <ListItemText primary="PDFs & documents" secondary="View inline or download" />
            </ListItem>
            <ListItem>
              <ListItemIcon><AssignmentIcon sx={{ color: 'hsl(38, 92%, 50%)' }} /></ListItemIcon>
              <ListItemText primary="Homework" secondary="Submit via WhatsApp or Email" />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ mb: 4, borderRadius: 3 }} icon={<LockIcon />}>
        <Typography variant="subtitle2" fontWeight={700}>
          Your data is private
        </Typography>
        <Typography variant="body2">
          You can only see your own progress and enrolled courses. Admins see everything for moderation.
        </Typography>
      </Alert>

      <Box>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <HelpIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Frequently asked questions
          </Typography>
        </Stack>
        {faqItems.map((item, index) => (
          <Accordion key={index} sx={{ mb: 1, borderRadius: 2, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>{item.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                {item.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </AppLayout>
  );
}
