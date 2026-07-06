import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  VideoLibrary as VideoIcon,
  Description as DocIcon,
  Slideshow as PptIcon,
  TableChart as SpreadsheetIcon,
  Link as LinkIcon,
  Assignment as HomeworkIcon,
  AccessTime as TimeIcon,
  YouTube as YouTubeIcon,
  Audiotrack as AudioIcon,
  Quiz as QuizIcon,
  Forum as ConversationIcon,
} from '@mui/icons-material';
import type { ContentItem, ItemType } from '@/types/content';

// LWS palette: forest, amber, coral, mint
const typeConfig: Record<ItemType, { icon: React.ReactNode; color: string; label: string }> = {
  pdf: { icon: <PdfIcon />, color: '#F26B5E', label: 'PDF' },
  video: { icon: <VideoIcon />, color: '#F5B921', label: 'Video' },
  doc: { icon: <DocIcon />, color: '#0F3D2E', label: 'Document' },
  ppt: { icon: <PptIcon />, color: '#F26B5E', label: 'Slides' },
  spreadsheet: { icon: <SpreadsheetIcon />, color: '#3E8E5A', label: 'Spreadsheet' },
  link: { icon: <LinkIcon />, color: '#0F3D2E', label: 'Link' },
  homework: { icon: <HomeworkIcon />, color: '#F5B921', label: 'Homework' },
  youtube: { icon: <YouTubeIcon />, color: '#F26B5E', label: 'YouTube' },
  audio: { icon: <AudioIcon />, color: '#3E8E5A', label: 'Audio' },
  quiz: { icon: <QuizIcon />, color: '#0F3D2E', label: 'Quiz' },
  conversation: { icon: <ConversationIcon />, color: '#3E8E5A', label: 'Conversation' },
};

interface RecentItemCardProps {
  item: ContentItem;
}

export function RecentItemCard({ item }: RecentItemCardProps) {
  const config = typeConfig[item.type];
  const publishedDate = new Date(item.publishedAt);
  const timeAgo = getTimeAgo(publishedDate);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'var(--hairline)',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'transform 220ms cubic-bezier(.2,.7,.2,1), box-shadow 220ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-md)',
        },
      }}
    >
      <CardActionArea
        component={Link}
        to={`/view/${item.id}`}
        sx={{ height: '100%' }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: `${config.color}15`,
                color: config.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {config.icon}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.title}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {item.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Chip
                  label={config.label}
                  size="small"
                  sx={{
                    bgcolor: `${config.color}15`,
                    color: config.color,
                    fontWeight: 500,
                    height: 22,
                    fontSize: '0.7rem',
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {timeAgo}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}
