import { createTheme, ThemeOptions } from '@mui/material/styles';

const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: 'hsl(239, 84%, 60%)',
            light: 'hsl(250, 92%, 72%)',
            dark: 'hsl(239, 84%, 48%)',
            contrastText: '#ffffff',
          },
          secondary: {
            main: 'hsl(38, 92%, 50%)',
            light: 'hsl(38, 92%, 65%)',
            dark: 'hsl(38, 92%, 40%)',
            contrastText: 'hsl(222, 47%, 11%)',
          },
          background: {
            default: 'hsl(210, 40%, 98%)',
            paper: '#ffffff',
          },
          text: {
            primary: 'hsl(222, 47%, 11%)',
            secondary: 'hsl(215, 16%, 47%)',
          },
          success: { main: 'hsl(152, 65%, 44%)' },
          warning: { main: 'hsl(38, 92%, 50%)' },
          info: { main: 'hsl(217, 92%, 60%)' },
          error: { main: 'hsl(0, 84%, 60%)' },
          divider: 'hsl(220, 20%, 90%)',
        }
      : {
          primary: {
            main: 'hsl(239, 90%, 70%)',
            light: 'hsl(250, 95%, 80%)',
            dark: 'hsl(239, 90%, 60%)',
            contrastText: 'hsl(222, 47%, 8%)',
          },
          secondary: {
            main: 'hsl(38, 92%, 55%)',
            light: 'hsl(38, 92%, 70%)',
            dark: 'hsl(38, 92%, 45%)',
            contrastText: 'hsl(222, 47%, 11%)',
          },
          background: {
            default: 'hsl(222, 47%, 6%)',
            paper: 'hsl(222, 47%, 10%)',
          },
          text: {
            primary: 'hsl(210, 40%, 98%)',
            secondary: 'hsl(215, 20%, 70%)',
          },
          success: { main: 'hsl(152, 65%, 50%)' },
          warning: { main: 'hsl(38, 92%, 55%)' },
          info: { main: 'hsl(217, 92%, 65%)' },
          error: { main: 'hsl(0, 78%, 62%)' },
          divider: 'hsl(217, 33%, 22%)',
        }),
  },
  typography: {
    fontFamily: '"Manrope", ui-sans-serif, system-ui, "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Sora", "Manrope", sans-serif', fontWeight: 800, fontSize: '2.5rem', letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Sora", "Manrope", sans-serif', fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.015em' },
    h3: { fontFamily: '"Sora", "Manrope", sans-serif', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.01em' },
    h4: { fontFamily: '"Sora", "Manrope", sans-serif', fontWeight: 700, fontSize: '1.25rem' },
    h5: { fontFamily: '"Sora", "Manrope", sans-serif', fontWeight: 700, fontSize: '1.1rem' },
    h6: { fontFamily: '"Sora", "Manrope", sans-serif', fontWeight: 700, fontSize: '0.95rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*:focus-visible': {
          outline: `2px solid ${mode === 'dark' ? 'hsl(239 90% 75%)' : 'hsl(239 84% 55%)'}`,
          outlineOffset: 2,
        },
        '::selection': {
          background: mode === 'dark' ? 'hsl(239 90% 70% / 0.45)' : 'hsl(239 84% 60% / 0.25)',
          color: mode === 'dark' ? '#fff' : 'hsl(222 47% 11%)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12, padding: '10px 18px', fontWeight: 600 },
        contained: {
          boxShadow: '0 6px 18px -8px hsl(239 84% 30% / 0.25)',
          '&:hover': { boxShadow: '0 10px 28px -12px hsl(239 84% 30% / 0.4)' },
          '&.Mui-disabled': {
            // Standard MUI disabled fallback for non-gradient contained buttons.
            color: mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
          },
        },
        outlined: {
          '&.Mui-disabled': {
            color: mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.18)',
          },
        },
        text: {
          '&.Mui-disabled': {
            color: mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&.Mui-disabled': {
            color: mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 6px 18px -10px hsl(222 47% 11% / 0.12)',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiAppBar: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiDrawer: { styleOverrides: { paper: { borderRight: 'none' } } },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 8 },
        // Ensure outlined chips are visible on tinted/gradient surfaces.
        outlined: {
          borderColor: mode === 'dark' ? 'rgba(255,255,255,0.24)' : 'rgba(0,0,0,0.18)',
        },
      },
    },
    MuiTextField: { defaultProps: { variant: 'outlined' } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          // Ensure input text remains legible even when parent uses inherit/gradient color.
          color: mode === 'dark' ? 'hsl(210 40% 98%)' : 'hsl(222 47% 11%)',
          backgroundColor: mode === 'dark' ? 'hsl(222 47% 12%)' : '#ffffff',
        },
        input: {
          '&::placeholder': {
            color: mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
            opacity: 1,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: mode === 'dark' ? 'hsl(215 20% 75%)' : 'hsl(215 16% 40%)',
          '&.Mui-focused': {
            color: mode === 'dark' ? 'hsl(239 90% 75%)' : 'hsl(239 84% 50%)',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: mode === 'dark' ? 'hsl(222 47% 18%)' : 'hsl(222 47% 11%)',
          color: '#fff',
          fontSize: 12,
          fontWeight: 500,
        },
        arrow: { color: mode === 'dark' ? 'hsl(222 47% 18%)' : 'hsl(222 47% 11%)' },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
          borderRadius: 6,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: mode === 'dark' ? 'hsl(210 40% 98%)' : 'hsl(222 47% 11%)',
          backgroundColor: mode === 'dark' ? 'hsl(222 47% 12%)' : 'hsl(220 18% 97%)',
        },
      },
    },
  },
});

export const createAppTheme = (mode: 'light' | 'dark') => createTheme(getDesignTokens(mode));
