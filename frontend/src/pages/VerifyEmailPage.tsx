import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CheckCircle, Error as ErrorIcon, Email } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';

const VerifyEmailPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Invalid verification token');
        return;
      }

      try {
        await authService.verifyEmail(token);
        setStatus('success');
        toast.success('Email verified successfully!');
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } catch (err: any) {
        setStatus('error');
        const errorMsg = err.response?.data?.error || 'Failed to verify email';
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
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
          transition={{ duration: 0.5 }}
        >
          <Paper
            sx={{
              p: 4,
              background: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: 3,
              textAlign: 'center',
            }}
          >
            {status === 'loading' && (
              <>
                <CircularProgress sx={{ mb: 3, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  Verifying your email...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please wait while we verify your email address.
                </Typography>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle
                  sx={{
                    fontSize: 80,
                    color: 'success.main',
                    mb: 3,
                  }}
                />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2,
                  }}
                >
                  Email Verified!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Your email has been successfully verified. You'll be redirected to your dashboard shortly.
                </Typography>
                <Button
                  component={Link}
                  to="/dashboard"
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    },
                  }}
                >
                  Go to Dashboard
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <ErrorIcon
                  sx={{
                    fontSize: 80,
                    color: 'error.main',
                    mb: 3,
                  }}
                />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: 'error.main',
                    mb: 2,
                  }}
                >
                  Verification Failed
                </Typography>
                <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                  {errorMessage}
                </Alert>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  The verification link may have expired or is invalid. Please request a new verification email.
                </Typography>
                <Button
                  component={Link}
                  to="/profile"
                  variant="contained"
                  startIcon={<Email />}
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    },
                  }}
                >
                  Resend Verification Email
                </Button>
              </>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default VerifyEmailPage;

