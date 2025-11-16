import { createTheme } from '@mui/material/styles';

/**
 * Premium SaaS Theme
 * Inspired by Paddle, Resend, and Docupipe
 * Modern, clean, and high-trust design system
 */
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Indigo - premium, trustworthy
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ec4899', // Pink - modern, attention
      light: '#f472b6',
      dark: '#db2777',
    },
    background: {
      default: '#0a0a0f', // Deep black
      paper: 'rgba(15, 23, 42, 0.8)',
    },
    text: {
      primary: '#f8fafc', // Almost white
      secondary: '#94a3b8', // Slate gray
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    divider: 'rgba(148, 163, 184, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
      letterSpacing: '-0.03em',
      lineHeight: 1.1,
      color: '#f8fafc',
    },
    h2: {
      fontWeight: 700,
      fontSize: 'clamp(2rem, 5vw, 3.5rem)',
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
      color: '#f8fafc',
    },
    h3: {
      fontWeight: 700,
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
      color: '#f8fafc',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#cbd5e1',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#94a3b8',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
      fontSize: '0.9375rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '12px 28px',
          fontSize: '0.9375rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
            boxShadow: '0 12px 32px rgba(99, 102, 241, 0.35)',
          },
          '&:disabled': {
            background: 'rgba(99, 102, 241, 0.3)',
            color: 'rgba(255, 255, 255, 0.5)',
          },
        },
        outlined: {
          borderColor: 'rgba(148, 163, 184, 0.3)',
          color: '#f8fafc',
          borderWidth: '1.5px',
          '&:hover': {
            borderColor: '#6366f1',
            background: 'rgba(99, 102, 241, 0.08)',
            borderWidth: '1.5px',
          },
        },
        text: {
          color: '#cbd5e1',
          '&:hover': {
            background: 'rgba(99, 102, 241, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: 'rgba(99, 102, 241, 0.3)',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1.5px solid rgba(148, 163, 184, 0.2)',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: 'rgba(99, 102, 241, 0.4)',
            },
            '&.Mui-focused': {
              borderColor: '#6366f1',
              boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
            },
            '& fieldset': {
              border: 'none',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#94a3b8',
            '&.Mui-focused': {
              color: '#818cf8',
            },
          },
          '& .MuiInputBase-input': {
            color: '#f8fafc',
            '&::placeholder': {
              color: '#64748b',
              opacity: 1,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.75rem',
          height: 28,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9375rem',
            minHeight: 48,
            color: '#94a3b8',
            '&.Mui-selected': {
              color: '#f8fafc',
            },
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            background: 'linear-gradient(90deg, #6366f1 0%, #ec4899 100%)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          borderRadius: 20,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&:hover': {
            background: 'rgba(99, 102, 241, 0.1)',
          },
          '&.Mui-selected': {
            background: 'rgba(99, 102, 241, 0.15)',
            '&:hover': {
              background: 'rgba(99, 102, 241, 0.2)',
            },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 4,
          backgroundColor: 'rgba(148, 163, 184, 0.1)',
        },
        bar: {
          borderRadius: 4,
          background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 50%, #ec4899 100%)',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#6366f1',
        },
      },
    },
  },
});
