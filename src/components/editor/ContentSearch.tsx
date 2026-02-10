import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Paper,
  Popper,
  ClickAwayListener,
  Typography,
  Fade,
} from '@mui/material';
import {
  Search as SearchIcon,
  School as SchoolIcon,
  Folder as FolderIcon,
  Description as ItemIcon,
} from '@mui/icons-material';
import { useEditor } from '@/contexts/EditorContext';

interface ContentSearchProps {
  onNavigate?: (section: string) => void;
}

interface SearchResult {
  type: 'course' | 'module' | 'item';
  id: string;
  title: string;
  subtitle: string;
}

export function ContentSearch({ onNavigate }: ContentSearchProps) {
  const { content } = useEditor();
  const [query, setQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const results = useMemo(() => {
    if (!content || query.length < 2) return [];
    const q = query.toLowerCase();
    const hits: SearchResult[] = [];

    Object.values(content.courses).forEach((c) => {
      if (c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) {
        hits.push({ type: 'course', id: c.id, title: c.title, subtitle: `${c.instructor} • ${c.level}` });
      }
    });
    Object.values(content.modules).forEach((m) => {
      if (m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)) {
        const course = content.courses[m.courseId];
        hits.push({ type: 'module', id: m.id, title: m.title, subtitle: course?.title || '' });
      }
    });
    Object.values(content.items).forEach((i) => {
      if (i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.tags.some((t) => t.toLowerCase().includes(q))) {
        hits.push({ type: 'item', id: i.id, title: i.title, subtitle: i.type });
      }
    });

    return hits.slice(0, 10);
  }, [content, query]);

  const icons = { course: <SchoolIcon fontSize="small" />, module: <FolderIcon fontSize="small" />, item: <ItemIcon fontSize="small" /> };
  const colors = { course: 'primary', module: 'success', item: 'warning' } as const;

  return (
    <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 360 }}>
        <TextField
          size="small"
          placeholder="Search content..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setAnchorEl(e.currentTarget);
          }}
          onFocus={(e) => setAnchorEl(e.currentTarget)}
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Popper open={!!anchorEl && results.length > 0} anchorEl={anchorEl} placement="bottom-start" sx={{ zIndex: 1300, width: anchorEl?.offsetWidth }} transition>
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={200}>
              <Paper elevation={8} sx={{ mt: 0.5, maxHeight: 320, overflow: 'auto' }}>
                <List dense disablePadding>
                  {results.map((r) => (
                    <ListItemButton
                      key={`${r.type}-${r.id}`}
                      onClick={() => {
                        onNavigate?.(r.type === 'course' ? 'courses' : r.type === 'module' ? 'modules' : 'items');
                        setQuery('');
                        setAnchorEl(null);
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>{icons[r.type]}</ListItemIcon>
                      <ListItemText primary={r.title} secondary={r.subtitle} />
                      <Chip label={r.type} size="small" color={colors[r.type]} variant="outlined" />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            </Fade>
          )}
        </Popper>
        {query.length >= 2 && results.length === 0 && anchorEl && (
          <Popper open anchorEl={anchorEl} placement="bottom-start" sx={{ zIndex: 1300, width: anchorEl?.offsetWidth }}>
            <Paper elevation={8} sx={{ mt: 0.5, p: 2 }}>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No results found
              </Typography>
            </Paper>
          </Popper>
        )}
      </Box>
    </ClickAwayListener>
  );
}
