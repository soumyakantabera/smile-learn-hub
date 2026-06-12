import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  VideoLibrary as VideoIcon,
  Description as DocIcon,
  Slideshow as PptIcon,
  TableChart as SpreadsheetIcon,
  Link as LinkIcon,
  Assignment as HomeworkIcon,
  YouTube as YouTubeIcon,
  Audiotrack as AudioIcon,
  Quiz as QuizIcon,
} from '@mui/icons-material';
import type { SequenceEntry } from '@/lib/contentNavigation';
import type { ItemType } from '@/types/content';

const typeIcons: Record<ItemType, React.ReactNode> = {
  pdf: <PdfIcon />,
  video: <VideoIcon />,
  doc: <DocIcon />,
  ppt: <PptIcon />,
  spreadsheet: <SpreadsheetIcon />,
  link: <LinkIcon />,
  homework: <HomeworkIcon />,
  youtube: <YouTubeIcon />,
  audio: <AudioIcon />,
  quiz: <QuizIcon />,
};

interface Props {
  open: boolean;
  onClose: () => void;
  sequence: SequenceEntry[];
  currentItemId: string;
  courseTitle?: string;
}

export function ModuleOutlineDrawer({ open, onClose, sequence, currentItemId, courseTitle }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Group by module
  const grouped: Record<string, { moduleTitle: string; entries: SequenceEntry[] }> = {};
  sequence.forEach((entry) => {
    if (!grouped[entry.module.id]) {
      grouped[entry.module.id] = { moduleTitle: entry.module.title, entries: [] };
    }
    grouped[entry.module.id].entries.push(entry);
  });

  return (
    <Drawer
      anchor={isMobile ? 'bottom' : 'right'}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : 360,
          height: isMobile ? '75vh' : '100%',
          borderTopLeftRadius: isMobile ? 16 : 0,
          borderTopRightRadius: isMobile ? 16 : 0,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1 }}>
            Course outline
          </Typography>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {courseTitle || 'Contents'}
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ overflowY: 'auto', flex: 1 }}>
        {Object.entries(grouped).map(([modId, { moduleTitle, entries }]) => (
          <Box key={modId}>
            <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                {moduleTitle}
              </Typography>
            </Box>
            <List disablePadding>
              {entries.map((entry) => {
                const active = entry.item.id === currentItemId;
                return (
                  <ListItem key={entry.item.id} disablePadding>
                    <ListItemButton
                      component={RouterLink}
                      to={`/view/${entry.item.id}`}
                      onClick={onClose}
                      selected={active}
                      sx={{
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          '& .MuiListItemIcon-root': { color: 'inherit' },
                          '&:hover': { bgcolor: 'primary.dark' },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>{typeIcons[entry.item.type]}</ListItemIcon>
                      <ListItemText
                        primary={entry.item.title}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: active ? 700 : 500,
                          noWrap: true,
                        }}
                      />
                      {active && <Chip label="Now" size="small" sx={{ ml: 1, bgcolor: 'rgba(255,255,255,0.25)', color: 'inherit' }} />}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
    </Drawer>
  );
}
