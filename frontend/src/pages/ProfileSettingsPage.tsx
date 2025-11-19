import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Stack,
  Chip,
  CircularProgress,
  InputAdornment,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  ArrowBack,
  AccountCircle,
  Email,
  Save,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Lock,
  Person,
  Security,
  Info,
  CreditCard,
  ArrowForward,
  Warning,
  Delete,
  Notifications,
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileSkeleton } from '../components/LoadingSkeleton';

const ProfileSettingsPage = () => {
  const navigate = useNavigate();
  const { user, fetchUser } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailOnAnalysisComplete: true,
    emailOnRiskDetected: true,
    emailOnMonthlyReport: false,
    emailOnLimitReached: true,
  });
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email);
    }
  }, [user]);

  // Fetch notification settings for Business+ users
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      if (user && (user.subscriptionPlan === 'business' || user.subscriptionPlan === 'enterprise')) {
        setIsLoadingNotifications(true);
        try {
          const response = await authService.getNotificationSettings();
          setNotificationSettings(response.notificationSettings);
        } catch (error: any) {
          // If 403, user doesn't have access (shouldn't happen, but handle gracefully)
          if (error.response?.status !== 403) {
            console.error('Failed to fetch notification settings:', error);
          }
        } finally {
          setIsLoadingNotifications(false);
        }
      }
    };
    fetchNotificationSettings();
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name?: string; email?: string; password?: string; currentPassword?: string }) => {
      const response = await authService.updateProfile(data);
      return response;
    },
    onSuccess: () => {
      fetchUser();
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    },
  });

  const updateNotificationSettingsMutation = useMutation({
    mutationFn: async (settings: typeof notificationSettings) => {
      const response = await authService.updateNotificationSettings(settings);
      return response;
    },
    onSuccess: (data) => {
      setNotificationSettings(data.notificationSettings);
      toast.success('Notification settings updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update notification settings');
    },
  });

  const handleNotificationChange = (key: keyof typeof notificationSettings, value: boolean) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    updateNotificationSettingsMutation.mutate(newSettings);
  };

  const handleUpdateProfile = () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    const updates: { name?: string; email?: string; password?: string; currentPassword?: string } = {};
    
    if (name.trim() !== user?.name) {
      updates.name = name.trim();
    }
    
    if (email !== user?.email) {
      updates.email = email.trim();
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        toast.error('New password must be at least 6 characters');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (!currentPassword) {
        toast.error('Current password is required to change password');
        return;
      }
      updates.password = newPassword;
      updates.currentPassword = currentPassword;
    }

    if (Object.keys(updates).length === 0) {
      toast.error('No changes to save');
      return;
    }

    updateProfileMutation.mutate(updates);
  };

  const hasChanges = () => {
    const nameChanged = name.trim() !== (user?.name || '');
    const emailChanged = email !== (user?.email || '');
    const passwordChanged = newPassword.length > 0;
    return nameChanged || emailChanged || passwordChanged;
  };

  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', background: '#0a0a0f', position: 'relative' }}>
        <Container maxWidth="md" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          <ProfileSkeleton />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: '#0a0a0f', position: 'relative' }}>
      {/* Subtle background gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '40vh',
          background: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 3, md: 5 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: { xs: 3, md: 4 } }}>
          <IconButton
            onClick={() => navigate('/dashboard')}
            sx={{
              color: 'text.secondary',
              borderRadius: 2,
              '&:hover': {
                color: 'primary.main',
                background: 'rgba(99, 102, 241, 0.15)',
                transform: 'translateX(-2px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: 'text.primary',
              fontSize: { xs: '1.75rem', md: '2rem' },
            }}
          >
            Profile Settings
          </Typography>
        </Box>

        {/* Profile Header Card */}
        <Card
          sx={{
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            mb: 4,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '120px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
              zIndex: 0,
            }}
          />
          <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              <Avatar
                sx={{
                  width: { xs: 80, md: 100 },
                  height: { xs: 80, md: 100 },
                  background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #ec4899 100%)',
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  fontWeight: 700,
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.5)',
                  border: '4px solid rgba(15, 23, 42, 0.8)',
                }}
              >
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                  {user.name || 'User'}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2.5, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                  {user.email}
                </Typography>
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  <Chip
                    icon={<CheckCircle sx={{ fontSize: 16 }} />}
                    label={user.subscriptionPlan}
                    sx={{
                      background: 'rgba(99, 102, 241, 0.2)',
                      color: '#818cf8',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      height: 28,
                      fontSize: '0.875rem',
                    }}
                  />
                  <Chip
                    icon={<CheckCircle sx={{ fontSize: 16 }} />}
                    label={user.subscriptionStatus}
                    sx={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      height: 28,
                      fontSize: '0.875rem',
                    }}
                  />
                </Stack>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Left Column: Personal Information */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                  borderColor: 'rgba(99, 102, 241, 0.3)',
                },
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 3,
                    pb: 2,
                    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                  }}
                >
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
                    <Person sx={{ color: '#fff', fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
                    Personal Information
                  </Typography>
                </Box>
                <Stack spacing={3}>
                  <TextField
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle sx={{ color: '#818cf8' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(99, 102, 241, 0.05)',
                        borderColor: 'rgba(148, 163, 184, 0.2)',
                        '&:hover': {
                          background: 'rgba(99, 102, 241, 0.08)',
                          borderColor: 'rgba(99, 102, 241, 0.3)',
                        },
                        '&.Mui-focused': {
                          background: 'rgba(99, 102, 241, 0.1)',
                          borderColor: '#6366f1',
                        },
                      },
                    }}
                  />
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#818cf8' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(99, 102, 241, 0.05)',
                        borderColor: 'rgba(148, 163, 184, 0.2)',
                        '&:hover': {
                          background: 'rgba(99, 102, 241, 0.08)',
                          borderColor: 'rgba(99, 102, 241, 0.3)',
                        },
                        '&.Mui-focused': {
                          background: 'rgba(99, 102, 241, 0.1)',
                          borderColor: '#6366f1',
                        },
                      },
                    }}
                  />
                  {user.emailVerified === false && (
                    <Box
                      sx={{
                        p: 2,
                        background: 'rgba(251, 191, 36, 0.1)',
                        border: '1px solid rgba(251, 191, 36, 0.3)',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Warning sx={{ color: '#fbbf24', fontSize: 20 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ color: '#fbbf24', fontWeight: 600, mb: 0.5 }}>
                          Email Not Verified
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Please verify your email address to access all features.
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={async () => {
                          try {
                            setIsResendingVerification(true);
                            await authService.resendVerification();
                            toast.success('Verification email sent! Check your inbox.');
                          } catch (err: any) {
                            toast.error(err.response?.data?.error || 'Failed to resend verification email');
                          } finally {
                            setIsResendingVerification(false);
                          }
                        }}
                        disabled={isResendingVerification}
                        sx={{
                          borderColor: 'rgba(251, 191, 36, 0.5)',
                          color: '#fbbf24',
                          '&:hover': {
                            borderColor: '#fbbf24',
                            background: 'rgba(251, 191, 36, 0.1)',
                          },
                        }}
                      >
                        {isResendingVerification ? 'Sending...' : 'Resend'}
                      </Button>
                    </Box>
                  )}
                  {user.emailVerified === true && (
                    <Box
                      sx={{
                        p: 2,
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>
                        Email Verified
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column: Password Change */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                  borderColor: 'rgba(99, 102, 241, 0.3)',
                },
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 3,
                    pb: 2,
                    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Lock sx={{ color: '#fff', fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
                    Change Password
                  </Typography>
                </Box>
            <Stack spacing={3}>
              <TextField
                label="Current Password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#818cf8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                        sx={{ 
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'primary.main',
                            background: 'rgba(99, 102, 241, 0.1)',
                          },
                        }}
                      >
                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(99, 102, 241, 0.05)',
                    borderColor: 'rgba(148, 163, 184, 0.2)',
                    '&:hover': {
                      background: 'rgba(99, 102, 241, 0.08)',
                      borderColor: 'rgba(99, 102, 241, 0.3)',
                    },
                    '&.Mui-focused': {
                      background: 'rgba(99, 102, 241, 0.1)',
                      borderColor: '#6366f1',
                    },
                  },
                }}
              />
              <TextField
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                helperText="Must be at least 6 characters"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Security sx={{ color: '#818cf8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                        sx={{ 
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'primary.main',
                            background: 'rgba(99, 102, 241, 0.1)',
                          },
                        }}
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(99, 102, 241, 0.05)',
                    borderColor: 'rgba(148, 163, 184, 0.2)',
                    '&:hover': {
                      background: 'rgba(99, 102, 241, 0.08)',
                      borderColor: 'rgba(99, 102, 241, 0.3)',
                    },
                    '&.Mui-focused': {
                      background: 'rgba(99, 102, 241, 0.1)',
                      borderColor: '#6366f1',
                    },
                  },
                }}
              />
              <TextField
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                error={newPassword.length > 0 && newPassword !== confirmPassword}
                helperText={
                  newPassword.length > 0 && newPassword !== confirmPassword
                    ? 'Passwords do not match'
                    : ''
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Security sx={{ color: '#818cf8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ 
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'primary.main',
                            background: 'rgba(99, 102, 241, 0.1)',
                          },
                        }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(99, 102, 241, 0.05)',
                    borderColor: 'rgba(148, 163, 184, 0.2)',
                    '&:hover': {
                      background: 'rgba(99, 102, 241, 0.08)',
                      borderColor: 'rgba(99, 102, 241, 0.3)',
                    },
                    '&.Mui-focused': {
                      background: 'rgba(99, 102, 241, 0.1)',
                      borderColor: '#6366f1',
                    },
                  },
                }}
              />
            </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Account Info Card */}
        <Card
          sx={{
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            mb: 3,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
              borderColor: 'rgba(99, 102, 241, 0.3)',
            },
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 3,
                pb: 2,
                borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Info sx={{ color: '#fff', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
                Account Information
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '1px solid rgba(99, 102, 241, 0.1)',
                    height: '100%',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      display: 'block',
                      mb: 1.5,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Subscription Plan
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700, textTransform: 'capitalize' }}>
                    {user.subscriptionPlan}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '1px solid rgba(99, 102, 241, 0.1)',
                    height: '100%',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      display: 'block',
                      mb: 1.5,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Contracts Used This Month
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700 }}>
                    {user.contractsUsedThisMonth || 0}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Button
              component={Link}
              to="/pricing"
              variant="contained"
              fullWidth
              startIcon={<CreditCard />}
              endIcon={<ArrowForward />}
              sx={{
                mt: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                py: 1.5,
                '&:hover': {
                  background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
                  boxShadow: '0 6px 16px rgba(99, 102, 241, 0.5)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Manage Subscription
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings (Business+ only) */}
        {(user?.subscriptionPlan === 'business' || user?.subscriptionPlan === 'enterprise') && (
          <Card
            sx={{
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              mb: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                borderColor: 'rgba(99, 102, 241, 0.3)',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 3,
                  pb: 2,
                  borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Notifications sx={{ color: '#fff', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
                  Notification Settings
                </Typography>
              </Box>
              {isLoadingNotifications ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <Stack spacing={2.5}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.emailOnAnalysisComplete}
                        onChange={(e) => handleNotificationChange('emailOnAnalysisComplete', e.target.checked)}
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
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                          Email on Analysis Complete
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Receive an email when contract analysis is finished
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0 }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.emailOnRiskDetected}
                        onChange={(e) => handleNotificationChange('emailOnRiskDetected', e.target.checked)}
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
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                          Email on Risk Detected
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Get notified when high-risk clauses are found
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0 }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.emailOnMonthlyReport}
                        onChange={(e) => handleNotificationChange('emailOnMonthlyReport', e.target.checked)}
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
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                          Monthly Report
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Receive a monthly summary of your contract activity
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0 }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.emailOnLimitReached}
                        onChange={(e) => handleNotificationChange('emailOnLimitReached', e.target.checked)}
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
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                          Email on Limit Reached
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Get notified when you reach your monthly contract limit
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0 }}
                  />
                </Stack>
              )}
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap', mb: 6 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard')}
            sx={{
              borderRadius: 2,
              borderColor: 'rgba(148, 163, 184, 0.2)',
              color: 'text.secondary',
              px: 3,
              '&:hover': {
                borderColor: 'primary.main',
                color: 'primary.main',
                background: 'rgba(99, 102, 241, 0.1)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={
              updateProfileMutation.isPending ? (
                <CircularProgress size={16} sx={{ color: '#ffffff' }} />
              ) : (
                <Save />
              )
            }
            onClick={handleUpdateProfile}
            disabled={updateProfileMutation.isPending || !hasChanges()}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
                boxShadow: '0 6px 16px rgba(99, 102, 241, 0.5)',
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                background: 'rgba(148, 163, 184, 0.2)',
                boxShadow: 'none',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>

        {/* Divider */}
        <Box
          sx={{
            my: 6,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(148, 163, 184, 0.2) 50%, transparent 100%)',
          }}
        />

        {/* Account Deletion Section */}
        <Card
          sx={{
            background: 'rgba(239, 68, 68, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.15)',
            mb: 4,
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
            },
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                <Delete sx={{ color: '#ef4444', fontSize: 24 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#ef4444', mb: 1 }}>
                  Delete Account
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Once you delete your account, there is no going back. Please be certain. All your contracts, analysis results, and data will be permanently deleted.
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, borderTop: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteConfirmDialogOpen(true)}
                sx={{
                  borderColor: 'rgba(239, 68, 68, 0.5)',
                  color: '#ef4444',
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#ef4444',
                    background: 'rgba(239, 68, 68, 0.15)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Delete My Account
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={deleteConfirmDialogOpen}
          onClose={() => setDeleteConfirmDialogOpen(false)}
          PaperProps={{
            sx: {
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 3,
              maxWidth: 500,
            },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              color: '#ef4444',
              fontWeight: 700,
              pb: 2,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Warning sx={{ color: '#ef4444', fontSize: 24 }} />
            </Box>
            Confirm Account Deletion
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.7 }}>
              Are you sure you want to delete your account? This action cannot be undone.
            </DialogContentText>
            <Box
              sx={{
                p: 2,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 2,
                mb: 2,
              }}
            >
              <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 600, mb: 1 }}>
                This will permanently delete:
              </Typography>
              <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2, m: 0 }}>
                <li>All your contracts and analysis results</li>
                <li>Your account data and preferences</li>
                <li>Your subscription information</li>
                <li>All associated files and documents</li>
              </Typography>
            </Box>
            <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              If you're sure, click "Continue" to proceed with password verification.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button
              onClick={() => setDeleteConfirmDialogOpen(false)}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  background: 'rgba(148, 163, 184, 0.1)',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setDeleteConfirmDialogOpen(false);
                setDeleteDialogOpen(true);
              }}
              variant="contained"
              color="error"
              sx={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                },
              }}
            >
              Continue
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setDeletePassword('');
          }}
          PaperProps={{
            sx: {
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            },
          }}
        >
          <DialogTitle sx={{ color: '#ef4444', fontWeight: 700 }}>
            Delete Account
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: 'text.secondary', mb: 2 }}>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Enter your password to confirm"
              type="password"
              fullWidth
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(99, 102, 241, 0.05)',
                },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletePassword('');
              }}
              sx={{ color: 'text.secondary' }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  setIsDeleting(true);
                  await authService.deleteAccount(deletePassword);
                  toast.success('Account deleted successfully');
                  useAuthStore.getState().logout();
                  window.location.href = '/';
                } catch (err: any) {
                  toast.error(err.response?.data?.error || 'Failed to delete account');
                } finally {
                  setIsDeleting(false);
                  setDeleteDialogOpen(false);
                  setDeletePassword('');
                }
              }}
              color="error"
              variant="contained"
              disabled={!deletePassword || isDeleting}
              startIcon={isDeleting ? <CircularProgress size={16} /> : <Delete />}
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Legal Links Footer */}
        <Box
          sx={{
            mt: 6,
            pt: 4,
            borderTop: '1px solid rgba(148, 163, 184, 0.1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 3,
            flexWrap: 'wrap',
          }}
        >
          <Button
            component={Link}
            to="/privacy"
            variant="text"
            size="small"
            sx={{
              color: 'text.secondary',
              fontSize: '0.875rem',
              '&:hover': {
                color: 'primary.main',
                background: 'rgba(99, 102, 241, 0.1)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Privacy Policy
          </Button>
          <Box
            sx={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: 'rgba(148, 163, 184, 0.3)',
            }}
          />
          <Button
            component={Link}
            to="/terms"
            variant="text"
            size="small"
            sx={{
              color: 'text.secondary',
              fontSize: '0.875rem',
              '&:hover': {
                color: 'primary.main',
                background: 'rgba(99, 102, 241, 0.1)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Terms of Service
          </Button>
          <Box
            sx={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: 'rgba(148, 163, 184, 0.3)',
            }}
          />
          <Button
            component={Link}
            to="/contact"
            variant="text"
            size="small"
            sx={{
              color: 'text.secondary',
              fontSize: '0.875rem',
              '&:hover': {
                color: 'primary.main',
                background: 'rgba(99, 102, 241, 0.1)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Contact
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ProfileSettingsPage;

