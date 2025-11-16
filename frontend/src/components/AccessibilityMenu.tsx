import { useState } from 'react';
import {
  Box,
  Fab,
  Drawer,
  Typography,
  IconButton,
  Stack,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Accessibility,
  Close,
  TextFields,
  Contrast,
  MotionPhotosOff,
  RestartAlt,
} from '@mui/icons-material';
import { useAccessibilityStore } from '../store/accessibilityStore';

const AccessibilityMenu = () => {
  const [open, setOpen] = useState(false);
  const {
    fontSize,
    highContrast,
    reducedMotion,
    setFontSize,
    setHighContrast,
    setReducedMotion,
    reset,
  } = useAccessibilityStore();

  const handleFontSizeChange = (size: 'small' | 'normal' | 'large' | 'extra-large') => {
    setFontSize(size);
  };

  const handleReset = () => {
    reset();
    setOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Tooltip title="Accessibility Menu" placement="left">
        <Fab
          color="primary"
          aria-label="accessibility menu"
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
              boxShadow: '0 12px 32px rgba(99, 102, 241, 0.5)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <Accessibility />
        </Fab>
      </Tooltip>

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(148, 163, 184, 0.1)',
          },
        }}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Accessibility sx={{ color: '#fff', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Accessibility
              </Typography>
            </Box>
            <IconButton
              onClick={() => setOpen(false)}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  background: 'rgba(99, 102, 241, 0.1)',
                },
              }}
            >
              <Close />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3, borderColor: 'rgba(148, 163, 184, 0.1)' }} />

          {/* Content */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <Stack spacing={4}>
              {/* Font Size */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <TextFields sx={{ color: '#818cf8', fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Font Size
                  </Typography>
                </Box>
                <Stack spacing={1.5}>
                  {(['small', 'normal', 'large', 'extra-large'] as const).map((size) => (
                    <Button
                      key={size}
                      variant={fontSize === size ? 'contained' : 'outlined'}
                      onClick={() => handleFontSizeChange(size)}
                      fullWidth
                      sx={{
                        justifyContent: 'flex-start',
                        textTransform: 'capitalize',
                        borderRadius: 2,
                        py: 1.5,
                        ...(fontSize === size
                          ? {
                              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                            }
                          : {
                              borderColor: 'rgba(148, 163, 184, 0.2)',
                              color: 'text.secondary',
                              '&:hover': {
                                borderColor: 'primary.main',
                                background: 'rgba(99, 102, 241, 0.1)',
                              },
                            }),
                      }}
                    >
                      {size === 'small' && 'Small (87.5%)'}
                      {size === 'normal' && 'Normal (100%)'}
                      {size === 'large' && 'Large (112.5%)'}
                      {size === 'extra-large' && 'Extra Large (125%)'}
                    </Button>
                  ))}
                </Stack>
              </Box>

              <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.1)' }} />

              {/* High Contrast */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Contrast sx={{ color: '#818cf8', fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    High Contrast
                  </Typography>
                </Box>
                <Paper
                  sx={{
                    p: 2,
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '1px solid rgba(99, 102, 241, 0.1)',
                    borderRadius: 2,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={highContrast}
                        onChange={(e) => setHighContrast(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#6366f1',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#6366f1',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary">
                        Increase contrast for better visibility
                      </Typography>
                    }
                  />
                </Paper>
              </Box>

              <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.1)' }} />

              {/* Reduced Motion */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <MotionPhotosOff sx={{ color: '#818cf8', fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Reduced Motion
                  </Typography>
                </Box>
                <Paper
                  sx={{
                    p: 2,
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '1px solid rgba(99, 102, 241, 0.1)',
                    borderRadius: 2,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={reducedMotion}
                        onChange={(e) => setReducedMotion(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#6366f1',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#6366f1',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary">
                        Reduce animations and transitions
                      </Typography>
                    }
                  />
                </Paper>
              </Box>

              <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.1)' }} />

              {/* Reset Button */}
              <Button
                variant="outlined"
                startIcon={<RestartAlt />}
                onClick={handleReset}
                fullWidth
                sx={{
                  borderRadius: 2,
                  borderColor: 'rgba(148, 163, 184, 0.2)',
                  color: 'text.secondary',
                  py: 1.5,
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    background: 'rgba(99, 102, 241, 0.1)',
                  },
                }}
              >
                Reset to Defaults
              </Button>
            </Stack>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              These settings are saved in your browser and will persist across sessions.
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default AccessibilityMenu;

