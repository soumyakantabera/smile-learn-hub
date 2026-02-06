import { createTheme, ThemeOptions } from '@mui/material/styles';

// Shared theme options
const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode
          primary: {
            main: 'hsl(173, 58%, 39%)',
            light: 'hsl(173, 58%, 55%)',
            dark: 'hsl(173, 58%, 29%)',
            contrastText: '#ffffff',
          },
          secondary: {
            main: 'hsl(16, 85%, 66%)',
            light: 'hsl(16, 85%, 76%)',
            dark: 'hsl(16, 85%, 50%)',
            contrastText: '#ffffff',
          },
          background: {
            default: 'hsl(210, 20%, 98%)',
            paper: '#ffffff',
          },
          text: {
            primary: 'hsl(222, 47%, 11%)',
            secondary: 'hsl(215, 16%, 47%)',
          },
          success: {
            main: 'hsl(142, 71%, 45%)',
          },
          warning: {
            main: 'hsl(38, 92%, 50%)',
          },
          info: {
            main: 'hsl(199, 89%, 48%)',
          },
          error: {
            main: 'hsl(0, 84%, 60%)',
          },
          divider: 'hsl(214, 32%, 91%)',
        }
      : {
          // Dark mode
          primary: {
            main: 'hsl(173, 58%, 45%)',
            light: 'hsl(173, 58%, 55%)',
            dark: 'hsl(173, 58%, 35%)',
            contrastText: '#ffffff',
          },
          secondary: {
            main: 'hsl(16, 85%, 60%)',
            light: 'hsl(16, 85%, 70%)',
            dark: 'hsl(16, 85%, 45%)',
            contrastText: '#ffffff',
          },
          background: {
            default: 'hsl(222, 47%, 8%)',
            paper: 'hsl(222, 47%, 11%)',
          },
          text: {
            primary: 'hsl(210, 40%, 98%)',
            secondary: 'hsl(215, 20%, 65%)',
          },
          success: {
            main: 'hsl(142, 71%, 40%)',
          },
          warning: {
            main: 'hsl(38, 92%, 45%)',
          },
          info: {
            main: 'hsl(199, 89%, 45%)',
          },
          error: {
            main: 'hsl(0, 63%, 50%)',
          },
          divider: 'hsl(217, 33%, 20%)',
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

export const createAppTheme = (mode: 'light' | 'dark') => createTheme(getDesignTokens(mode));
