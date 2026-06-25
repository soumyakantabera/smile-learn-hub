import type { SxProps, Theme } from '@mui/material/styles';

/**
 * Reusable SX preset for buttons that use the primary brand gradient.
 * Ensures the disabled state stays readable instead of collapsing to MUI's
 * default "dark text on dark gradient" combination.
 */
export const gradientPrimaryBtnSx: SxProps<Theme> = {
  background: 'var(--gradient-primary)',
  color: '#ffffff',
  boxShadow: '0 8px 20px -10px hsl(239 84% 30% / 0.45)',
  '&:hover': {
    background: 'var(--gradient-primary)',
    filter: 'brightness(1.06)',
    boxShadow: '0 12px 26px -12px hsl(239 84% 30% / 0.55)',
  },
  '&.Mui-disabled': {
    background: 'var(--gradient-primary)',
    color: 'rgba(255,255,255,0.85)',
    opacity: 0.6,
    boxShadow: 'none',
  },
};

/** Background gradient + ensures any descendant text/icon is white. */
export const onGradientSurfaceSx: SxProps<Theme> = {
  background: 'var(--gradient-primary)',
  color: '#ffffff',
  '& .MuiTypography-root': { color: 'inherit' },
  '& .MuiSvgIcon-root': { color: 'inherit' },
};
