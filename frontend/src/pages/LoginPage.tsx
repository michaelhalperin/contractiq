import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { Description, ArrowBack } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { LanguageSelector } from '../components/LanguageSelector';
import { useTranslation } from '../utils/i18n';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState<string>('');
  const t = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      await login(data.email, data.password);
      toast.success(t('auth.welcomeBack'));
      navigate('/dashboard');
    } catch (err: unknown) {
      // Extract error message from axios error response
      let errorMessage = t('auth.loginFailed');
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        errorMessage = axiosError.response?.data?.error || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Login - ContractIQ",
    "description": "Sign in to your ContractIQ account to access AI-powered contract analysis tools.",
    "url": "https://contractiq-ivory.vercel.app/login"
  };

  return (
    <>
      <SEOHead
        title="Login - ContractIQ"
        description="Sign in to your ContractIQ account to access AI-powered contract analysis, risk detection, and plain English summaries."
        url="/login"
        structuredData={structuredData}
        noindex={true}
      />
      <Box
        sx={{
          minHeight: '100vh',
          background: '#0a0a0f',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
      {/* Background gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50vh',
          background: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
              sx={{
                color: 'text.secondary',
                textTransform: 'none',
                '&:hover': {
                  color: 'primary.main',
                  background: 'rgba(99, 102, 241, 0.1)',
                },
              }}
            >
              {t('common.backToHome')}
            </Button>
            <LanguageSelector />
          </Box>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 5 },
              width: '100%',
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              borderRadius: 3,
            }}
          >
            {/* Logo */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                }}
              >
                <Description sx={{ color: '#ffffff', fontSize: 32 }} />
              </Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ContractIQ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('auth.signIn')}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                {...register('email')}
                label={t('auth.email')}
                type="email"
                fullWidth
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ mb: 2 }}
                autoComplete="email"
              />
              <TextField
                {...register('password')}
                label={t('auth.password')}
                type="password"
                fullWidth
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{ mb: 3 }}
                autoComplete="current-password"
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  component={Link}
                  to="/forgot-password"
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    textTransform: 'none',
                    '&:hover': {
                      color: 'primary.main',
                      background: 'rgba(99, 102, 241, 0.1)',
                    },
                  }}
                >
                  {t('auth.forgotPasswordQuestion')}
                </Button>
              </Box>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isSubmitting}
                sx={{ mb: 3, py: 1.5 }}
              >
                {isSubmitting ? t('auth.signingIn') : t('auth.signInButton')}
              </Button>
            </form>

            <Typography variant="body2" align="center">
              {t('auth.noAccount')}{' '}
              <Link
                to="/register"
                style={{
                  color: '#818cf8',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                {t('auth.signUp')}
              </Link>
            </Typography>
          </Paper>
        </motion.div>
      </Container>
    </Box>
    </>
  );
};

export default LoginPage;
