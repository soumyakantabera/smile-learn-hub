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
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  Description as DocIcon,
} from '@mui/icons-material';
import { AppLayout } from '@/components/AppLayout';
import { appConfig } from '@/config/app.config';

const faqItems = [
  {
    question: 'How do I access my course materials?',
    answer: 'After logging in with your batch passcode, you\'ll see your dashboard with all available courses. Click on any course to see its modules, then click on any module to access the learning materials.',
  },
  {
    question: 'How do I submit homework?',
    answer: 'Navigate to the homework item in any module. You\'ll see a submission panel where you can enter your name and submit via WhatsApp or Email. The message template will be pre-filled with your batch and course information.',
  },
  {
    question: 'Can I download the materials?',
    answer: 'Yes! Most materials (PDFs, documents, presentations, spreadsheets) have a download option. Click the "Download" button when viewing the material.',
  },
  {
    question: 'How do I search for specific content?',
    answer: 'Go to the Courses page and use the search bar at the top. You can also filter by content type (video, PDF, etc.) or by tags.',
  },
  {
    question: 'Why can\'t I view some documents?',
    answer: 'Some documents require an external viewer. Click "View in Google Docs" or "View in Microsoft Office" to open them in a compatible viewer.',
  },
  {
    question: 'How long does my login session last?',
    answer: `Your session lasts for ${appConfig.session.expiryHours} hours. After that, you'll need to log in again with your batch passcode.`,
  },
];

export default function HelpPage() {
  return (
    <AppLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Help & Instructions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Learn how to use the learning platform effectively
        </Typography>
      </Box>

      {/* Quick Start Guide */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <SchoolIcon color="primary" />
            <Typography variant="h5" fontWeight={600}>
              Quick Start Guide
            </Typography>
          </Box>
          <List>
            <ListItem>
              <ListItemIcon>
                <Chip label="1" size="small" color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Login with your Batch Passcode"
                secondary="Your instructor will provide you with a passcode for your batch"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Chip label="2" size="small" color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Browse Courses"
                secondary="View all available courses on your dashboard or the Courses page"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Chip label="3" size="small" color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Access Learning Materials"
                secondary="Click on modules to see videos, documents, and other resources"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Chip label="4" size="small" color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Submit Homework"
                secondary="Use the WhatsApp or Email submission options for assignments"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Content Types */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <DocIcon color="primary" />
            <Typography variant="h5" fontWeight={600}>
              Content Types
            </Typography>
          </Box>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <PlayIcon sx={{ color: '#1976D2' }} />
              </ListItemIcon>
              <ListItemText
                primary="Videos"
                secondary="Watch directly in the app with playback controls"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <DocIcon sx={{ color: '#D32F2F' }} />
              </ListItemIcon>
              <ListItemText
                primary="PDFs"
                secondary="View inline or download for offline reading"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <DocIcon sx={{ color: '#2196F3' }} />
              </ListItemIcon>
              <ListItemText
                primary="Documents, Presentations, Spreadsheets"
                secondary="Download or preview using Google Docs / Microsoft Office viewer"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <AssignmentIcon sx={{ color: '#FF9800' }} />
              </ListItemIcon>
              <ListItemText
                primary="Homework"
                secondary="View instructions and submit via WhatsApp or Email"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Homework Submission */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AssignmentIcon color="primary" />
            <Typography variant="h5" fontWeight={600}>
              Homework Submission
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            When you complete a homework assignment, follow these steps:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <Chip label="1" size="small" />
              </ListItemIcon>
              <ListItemText primary="Navigate to the homework item" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Chip label="2" size="small" />
              </ListItemIcon>
              <ListItemText primary="Enter your name in the submission form" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Chip label="3" size="small" />
              </ListItemIcon>
              <ListItemText primary="Choose your submission method:" />
            </ListItem>
          </List>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', ml: 4, mt: 1 }}>
            <Chip
              icon={<WhatsAppIcon />}
              label={`WhatsApp: +${appConfig.submission.whatsappNumber}`}
              color="success"
              variant="outlined"
            />
            <Chip
              icon={<EmailIcon />}
              label={`Email: ${appConfig.submission.email}`}
              color="primary"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert severity="info" sx={{ mb: 4 }} icon={<LockIcon />}>
        <Typography variant="subtitle2" fontWeight={600}>
          Security Notice
        </Typography>
        <Typography variant="body2">
          This platform uses client-side passcode validation for basic access control. 
          This is suitable for limiting access to educational materials but is not intended 
          for protecting highly sensitive information. All passcodes are stored as SHA-256 hashes.
        </Typography>
      </Alert>

      {/* FAQ */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <HelpIcon color="primary" />
          <Typography variant="h5" fontWeight={600}>
            Frequently Asked Questions
          </Typography>
        </Box>
        {faqItems.map((item, index) => (
          <Accordion key={index} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={500}>{item.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                {item.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Contact */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Need More Help?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Contact your instructor or batch coordinator for:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• Forgotten or lost batch passcodes" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Technical issues with viewing content" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Questions about homework or course material" />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
