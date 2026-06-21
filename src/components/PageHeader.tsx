import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Paper, Stack, Chip, useTheme, useMediaQuery, alpha } from '@mui/material';
import {
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

export interface CrumbItem {
  label: string;
  to?: string;
  icon?: React.ReactNode;
}

interface PageHeaderProps {
  crumbs: CrumbItem[];
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  iconColor?: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  compact?: boolean;
}

/**
 * App-wide page header with rich, icon-driven breadcrumb pills,
 * a prominent icon tile, title + subtitle, and optional actions.
 * Designed to work in both student and admin views.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  crumbs,
  title,
  subtitle,
  icon,
  iconColor,
  actions,
  meta,
  compact = false,
}) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isCompact = compact || isXs;
  const accent = iconColor || theme.palette.primary.main;

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        mb: 3,
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        background: `linear-gradient(135deg, ${alpha(accent, 0.08)} 0%, ${alpha(
          accent,
          0.02,
        )} 60%, transparent 100%)`,
      }}
    >
      {/* Decorative accent bar */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: `linear-gradient(180deg, ${accent}, ${alpha(accent, 0.4)})`,
        }}
      />

      {/* Breadcrumb pills */}
      <Box
        className="scrollbar-thin"
        sx={{
          mb: title || icon ? 1.5 : 0,
          overflowX: 'auto',
          overflowY: 'hidden',
          mx: -0.5,
          px: 0.5,
        }}
      >
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{ flexWrap: 'nowrap', width: 'max-content' }}
        >
          {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          const content = (
            <Chip
              size="small"
              icon={
                (c.icon as React.ReactElement) ||
                (i === 0 ? <HomeIcon /> : undefined)
              }
              label={c.label}
              clickable={Boolean(c.to) && !isLast}
              sx={{
                fontWeight: isLast ? 700 : 500,
                bgcolor: isLast
                  ? alpha(accent, 0.14)
                  : 'transparent',
                color: isLast ? accent : 'text.secondary',
                border: isLast
                  ? `1px solid ${alpha(accent, 0.3)}`
                  : '1px solid transparent',
                '& .MuiChip-icon': {
                  color: isLast ? accent : 'text.secondary',
                  ml: '6px',
                },
                '&:hover': c.to && !isLast
                  ? {
                      bgcolor: alpha(accent, 0.06),
                      color: 'text.primary',
                    }
                  : undefined,
                maxWidth: { xs: 160, sm: 280 },
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
              }}
            />
          );
          return (
            <React.Fragment key={`${c.label}-${i}`}>
              {c.to && !isLast ? (
                <RouterLink
                  to={c.to}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {content}
                </RouterLink>
              ) : (
                content
              )}
              {!isLast && (
                <ChevronRightIcon
                  fontSize="small"
                  sx={{ color: 'text.disabled' }}
                />
              )}
            </React.Fragment>
          );
        })}
        </Stack>
      </Box>

      {(title || icon || actions) && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0, flex: 1, width: '100%' }}>
            {icon && (
              <Box
                sx={{
                  width: isCompact ? 44 : 56,
                  height: isCompact ? 44 : 56,
                  borderRadius: 2.5,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: accent,
                  background: `linear-gradient(135deg, ${alpha(accent, 0.18)}, ${alpha(accent, 0.06)})`,
                  border: `1px solid ${alpha(accent, 0.25)}`,
                  boxShadow: `0 6px 16px -8px ${alpha(accent, 0.6)}`,
                  '& svg': { fontSize: isCompact ? 24 : 30 },
                }}
              >
                {icon}
              </Box>
            )}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              {title && (
                <Typography
                  variant={isCompact ? 'h6' : 'h5'}
                  fontWeight={800}
                  sx={{
                    lineHeight: 1.2,
                    wordBreak: 'break-word',
                    fontSize: { xs: '1.15rem', sm: '1.35rem' },
                  }}
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {subtitle}
                </Typography>
              )}
              {meta && <Box sx={{ mt: 1 }}>{meta}</Box>}
            </Box>
          </Stack>
          {actions && (
            <Box
              className="scrollbar-thin"
              sx={{
                display: 'flex',
                gap: 1,
                flexShrink: 0,
                width: { xs: '100%', sm: 'auto' },
                flexWrap: { xs: 'nowrap', sm: 'wrap' },
                overflowX: { xs: 'auto', sm: 'visible' },
                WebkitOverflowScrolling: 'touch',
                pb: { xs: 0.5, sm: 0 },
              }}
            >
              {actions}
            </Box>
          )}
        </Stack>
      )}
    </Paper>
  );
};

export default PageHeader;
