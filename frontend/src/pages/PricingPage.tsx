import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack,
} from '@mui/material';
import { CheckCircle, Star } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PLAN_LIMITS } from '../../../shared/types';
import { useAuthStore } from '../store/authStore';
import { openCheckout, isPaddleLoaded } from '../services/paddle.service';
import toast from 'react-hot-toast';

const PricingPage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const handleSubscribe = (plan: 'pro' | 'business' | 'enterprise') => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }

    if (!isPaddleLoaded()) {
      toast.error('Payment system is loading. Please try again in a moment.');
      return;
    }

    try {
      openCheckout(plan, {
        email: user?.email,
        successCallback: (data) => {
          console.log('Checkout successful:', data);
          toast.success('Subscription activated! Redirecting...');
          setTimeout(() => {
            window.location.href = '/dashboard?checkout=success';
          }, 1500);
        },
        closeCallback: () => {
          console.log('Checkout closed');
        },
      });
    } catch (error) {
      console.error('Failed to open checkout:', error);
      toast.error('Failed to open checkout. Please try again.');
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      plan: 'free' as const,
      popular: false,
      description: 'Perfect for trying out ContractIQ',
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'month',
      plan: 'pro' as const,
      popular: true,
      description: 'For freelancers and small teams',
    },
    {
      name: 'Business',
      price: '$79',
      period: 'month',
      plan: 'business' as const,
      popular: false,
      description: 'For growing businesses',
    },
    {
      name: 'Enterprise',
      price: '$499',
      period: 'month',
      plan: 'enterprise' as const,
      popular: false,
      description: 'For large organizations',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: '#0a0a0f', position: 'relative', py: { xs: 8, md: 12 } }}>
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

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                mb: 2,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Choose the plan that's right for you. All plans include our core features.
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
          {plans.map((plan, index) => {
            const limits = PLAN_LIMITS[plan.plan];
            return (
              <Grid item xs={12} sm={6} md={3} key={plan.name}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  style={{ height: '100%' }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      position: 'relative',
                      border: plan.popular
                        ? '2px solid #6366f1'
                        : '1px solid rgba(148, 163, 184, 0.15)',
                      background: plan.popular
                        ? 'rgba(99, 102, 241, 0.05)'
                        : 'rgba(15, 23, 42, 0.6)',
                      borderRadius: 3,
                      overflow: 'visible',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: plan.popular ? '#818cf8' : 'rgba(99, 102, 241, 0.4)',
                        boxShadow: plan.popular
                          ? '0 12px 40px rgba(99, 102, 241, 0.25)'
                          : '0 8px 32px rgba(99, 102, 241, 0.15)',
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    {plan.popular && (
                      <Chip
                        icon={<Star sx={{ fontSize: 16 }} />}
                        label="Most Popular"
                        sx={{
                          position: 'absolute',
                          top: -12,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          height: 28,
                          boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
                        }}
                      />
                    )}
                    <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                          {plan.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {plan.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                          <Typography
                            variant="h3"
                            sx={{
                              fontWeight: 800,
                              background: plan.popular
                                ? 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)'
                                : 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}
                          >
                            {plan.price}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            /{plan.period}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {limits.contractsPerMonth === -1
                            ? 'Unlimited contracts'
                            : `${limits.contractsPerMonth} contracts/month`}
                        </Typography>
                      </Box>

                      <List
                        dense
                        sx={{
                          flex: 1,
                          mb: 3,
                          '& .MuiListItem-root': {
                            px: 0,
                            py: 0.75,
                          },
                        }}
                      >
                        {limits.features.map((feature, featureIndex) => (
                          <ListItem key={featureIndex}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckCircle
                                sx={{
                                  color: plan.popular ? 'primary.main' : 'success.main',
                                  fontSize: 20,
                                }}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={feature}
                              primaryTypographyProps={{
                                variant: 'body2',
                                sx: { color: 'text.primary' },
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>

                      {plan.name === 'Free' ? (
                        <Button
                          component={Link}
                          to={isAuthenticated ? '/dashboard' : '/register'}
                          variant={plan.popular ? 'contained' : 'outlined'}
                          fullWidth
                          sx={{ mt: 'auto' }}
                        >
                          Get Started
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleSubscribe(plan.plan as 'pro' | 'business' | 'enterprise')}
                          variant={plan.popular ? 'contained' : 'outlined'}
                          fullWidth
                          sx={{ mt: 'auto' }}
                          disabled={!isPaddleLoaded()}
                        >
                          Subscribe
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        {/* Additional Info */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            All plans include:
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {['AI-powered analysis', 'Risk detection', 'PDF reports', 'Secure storage'].map((feature) => (
              <Chip
                key={feature}
                label={feature}
                size="small"
                sx={{
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: 'primary.main',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  fontWeight: 600,
                }}
              />
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default PricingPage;
