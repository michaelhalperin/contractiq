import { useNavigate } from "react-router-dom";
import { useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { CheckCircle, Star, TrendingUp, Check, Warning } from "@mui/icons-material";
import { motion } from "framer-motion";
import { PLAN_LIMITS } from "../../../shared/types";
import { useAuthStore } from "../store/authStore";
import { openCheckout, isPaddleLoaded } from "../services/paddle.service";
import { subscriptionService } from "../services/subscription.service";
import toast from "react-hot-toast";
import SEOHead from "../components/SEOHead";
import { useQuery } from "@tanstack/react-query";

const PricingPage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [downgradeModalOpen, setDowngradeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ plan: "free" | "pro" | "business"; name: string } | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch subscription status to get period end date
  const { data: subscriptionStatus } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: subscriptionService.getStatus,
    enabled: isAuthenticated && user?.subscriptionStatus === 'active' && user?.subscriptionPlan !== 'free',
  });

  const handleSubscribe = (plan: "pro" | "business") => {
    if (!isAuthenticated) {
      navigate("/register");
      return;
    }

    if (!isPaddleLoaded()) {
      toast.error("Payment system is loading. Please try again in a moment.");
      return;
    }

    try {
      openCheckout(plan, {
        email: user?.email,
        successCallback: (data) => {
          console.log("Checkout successful:", data);
          toast.success("Subscription activated! Redirecting...");
          setTimeout(() => {
            window.location.href = "/dashboard?checkout=success";
          }, 1500);
        },
        closeCallback: () => {
          console.log("Checkout closed");
        },
      });
    } catch (error) {
      console.error("Failed to open checkout:", error);
      toast.error("Failed to open checkout. Please try again.");
    }
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      plan: "free" as const,
      popular: false,
      description: "Perfect for trying out ContractIQ",
    },
    {
      name: "Pro",
      price: "$29",
      period: "month",
      plan: "pro" as const,
      popular: true,
      description: "For freelancers and small teams",
    },
    {
      name: "Business",
      price: "$79",
      period: "month",
      plan: "business" as const,
      popular: false,
      description: "For growing businesses",
      bestValue: true,
    },
  ];

  return (
    <>
      <SEOHead
        title="Pricing Plans - ContractIQ"
        description="Choose the perfect plan for your contract analysis needs. Free, Pro, and Business plans available. Start analyzing contracts today."
        url="/pricing"
      />
      <Box
        sx={{
          minHeight: "100vh",
          background: "#0a0a0f",
          position: "relative",
          py: { xs: 4, md: 6 },
        }}
      >
        {/* Background gradient */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "40vh",
            background:
              "radial-gradient(ellipse at top, rgba(99, 102, 241, 0.15) 0%, transparent 50%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: "center", mb: { xs: 4, md: 5 } }}>
              <Typography
                variant="h3"
                sx={{
                  mb: 1,
                  fontWeight: 800,
                  fontSize: { xs: "1.75rem", md: "2.5rem" },
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Simple, Transparent Pricing
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  maxWidth: 600,
                  mx: "auto",
                  fontSize: { xs: "0.875rem", md: "1rem" },
                }}
              >
                Choose the plan that's right for you
              </Typography>
            </Box>
          </motion.div>

          <Grid container spacing={3} sx={{ alignItems: "stretch", mb: 4 }}>
            {plans.map((plan, index) => {
              const limits = PLAN_LIMITS[plan.plan];
              const isCurrentPlan = user?.subscriptionPlan === plan.plan;
              const isDowngrade = user && (
                (user.subscriptionPlan === 'business' && plan.plan === 'pro') ||
                (user.subscriptionPlan === 'business' && plan.plan === 'free') ||
                (user.subscriptionPlan === 'pro' && plan.plan === 'free')
              );
              const isGoingToFree = user && plan.plan === 'free' && user.subscriptionPlan !== 'free';
              return (
                <Grid item xs={12} sm={6} md={4} key={plan.name}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    style={{ height: "100%" }}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        position: "relative",
                        border: plan.popular
                          ? "2px solid #6366f1"
                          : (plan as any).bestValue
                          ? "2px solid #10b981"
                          : "1px solid rgba(148, 163, 184, 0.15)",
                        background: plan.popular
                          ? "rgba(99, 102, 241, 0.05)"
                          : (plan as any).bestValue
                          ? "rgba(16, 185, 129, 0.05)"
                          : "rgba(15, 23, 42, 0.6)",
                        borderRadius: 3,
                        overflow: "visible",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          borderColor: plan.popular
                            ? "#818cf8"
                            : (plan as any).bestValue
                            ? "#34d399"
                            : "rgba(99, 102, 241, 0.4)",
                          boxShadow: plan.popular
                            ? "0 12px 40px rgba(99, 102, 241, 0.25)"
                            : (plan as any).bestValue
                            ? "0 12px 40px rgba(16, 185, 129, 0.25)"
                            : "0 8px 32px rgba(99, 102, 241, 0.15)",
                          transform: "translateY(-4px)",
                        },
                      }}
                    >
                      {plan.popular && (
                        <Chip
                          icon={<Star sx={{ fontSize: 16 }} />}
                          label="Most Popular"
                          sx={{
                            position: "absolute",
                            top: -12,
                            left: "50%",
                            transform: "translateX(-50%)",
                            background:
                              "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            height: 28,
                            boxShadow: "0 4px 16px rgba(99, 102, 241, 0.4)",
                          }}
                        />
                      )}
                      {(plan as any).bestValue && !isCurrentPlan && (
                        <Chip
                          icon={<TrendingUp sx={{ fontSize: 16 }} />}
                          label="Best Value"
                          sx={{
                            position: "absolute",
                            top: -12,
                            left: "50%",
                            transform: "translateX(-50%)",
                            background:
                              "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            height: 28,
                            boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)",
                          }}
                        />
                      )}
                      {isCurrentPlan && (
                        <Chip
                          icon={<Check sx={{ fontSize: 16 }} />}
                          label="Current Plan"
                          sx={{
                            position: "absolute",
                            top: -12,
                            left: "50%",
                            transform: "translateX(-50%)",
                            background:
                              "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            height: 28,
                            boxShadow: "0 4px 16px rgba(99, 102, 241, 0.4)",
                          }}
                        />
                      )}
                      <CardContent
                        sx={{
                          p: { xs: 2.5, md: 3 },
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              mb: 0.5,
                              fontSize: { xs: "1.1rem", md: "1.25rem" },
                            }}
                          >
                            {plan.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              mb: 1.5,
                              display: "block",
                              fontSize: "0.75rem",
                            }}
                          >
                            {plan.description}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "baseline",
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="h4"
                              sx={{
                                fontWeight: 800,
                                fontSize: { xs: "1.75rem", md: "2rem" },
                                background: plan.popular
                                  ? "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)"
                                  : (plan as any).bestValue
                                  ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                  : "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                              }}
                            >
                              {plan.price}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ ml: 0.5, fontSize: "0.75rem" }}
                            >
                              /{plan.period}
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              mb: 1,
                              display: "block",
                              fontSize: "0.75rem",
                            }}
                          >
                            {limits.contractsPerMonth === -1
                              ? "Unlimited contracts"
                              : `${limits.contractsPerMonth} contracts/month`}
                          </Typography>
                        </Box>

                        <List
                          dense
                          sx={{
                            flex: 1,
                            mb: 2,
                            maxHeight: { xs: "300px", md: "400px" },
                            overflowY: "auto",
                            "& .MuiListItem-root": {
                              px: 0,
                              py: 0.5,
                            },
                            "&::-webkit-scrollbar": {
                              width: "4px",
                            },
                            "&::-webkit-scrollbar-track": {
                              background: "rgba(148, 163, 184, 0.1)",
                              borderRadius: "2px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                              background: "rgba(99, 102, 241, 0.3)",
                              borderRadius: "2px",
                              "&:hover": {
                                background: "rgba(99, 102, 241, 0.5)",
                              },
                            },
                          }}
                        >
                          {limits.features.map((feature, featureIndex) => (
                            <ListItem key={featureIndex}>
                              <ListItemIcon sx={{ minWidth: 28 }}>
                                <CheckCircle
                                  sx={{
                                    color: plan.popular
                                      ? "primary.main"
                                      : "success.main",
                                    fontSize: 16,
                                  }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={feature}
                                primaryTypographyProps={{
                                  variant: "caption",
                                  sx: {
                                    color: "text.primary",
                                    fontSize: "0.75rem",
                                    lineHeight: 1.4,
                                  },
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>

                        {plan.name === "Free" ? (
                          <Button
                            onClick={() => {
                              if (isAuthenticated) {
                                if (isGoingToFree) {
                                  setSelectedPlan({ plan: 'free', name: 'Free' });
                                  setDowngradeModalOpen(true);
                                } else {
                                  navigate('/dashboard');
                                }
                              } else {
                                navigate('/register');
                              }
                            }}
                            variant={plan.popular ? "contained" : "outlined"}
                            fullWidth
                            size="small"
                            sx={{ mt: "auto", py: 1, fontSize: "0.875rem" }}
                            disabled={isCurrentPlan}
                          >
                            {isCurrentPlan ? "Current Plan" : "Get Started"}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              if (isDowngrade) {
                                setSelectedPlan({ plan: plan.plan, name: plan.name });
                                setDowngradeModalOpen(true);
                              } else {
                                handleSubscribe(plan.plan as "pro" | "business");
                              }
                            }}
                            variant={plan.popular && !isCurrentPlan ? "contained" : "outlined"}
                            fullWidth
                            size="small"
                            sx={{ 
                              mt: "auto", 
                              py: 1, 
                              fontSize: "0.875rem",
                              ...(isCurrentPlan && {
                                background: 'rgba(99, 102, 241, 0.1)',
                                borderColor: 'rgba(99, 102, 241, 0.3)',
                                color: 'primary.main',
                                '&:hover': {
                                  background: 'rgba(99, 102, 241, 0.15)',
                                },
                              }),
                              ...(isDowngrade && !isCurrentPlan && {
                                borderColor: 'rgba(148, 163, 184, 0.3)',
                                color: 'text.secondary',
                                background: 'rgba(148, 163, 184, 0.05)',
                                '&:hover': {
                                  background: 'rgba(148, 163, 184, 0.1)',
                                  borderColor: 'rgba(148, 163, 184, 0.4)',
                                  color: 'text.primary',
                                },
                              }),
                            }}
                            disabled={!isPaddleLoaded() || isCurrentPlan}
                            startIcon={isCurrentPlan ? <Check /> : undefined}
                          >
                            {isCurrentPlan 
                              ? "Current Plan" 
                              : isDowngrade 
                              ? "Downgrade" 
                              : "Subscribe"}
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
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1.5, display: "block", fontSize: "0.75rem" }}
            >
              All plans include:
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: "center", flexWrap: "wrap" }}
            >
              {[
                "AI-powered analysis",
                "Risk detection",
                "PDF reports",
                "Secure storage",
              ].map((feature) => (
                <Chip
                  key={feature}
                  label={feature}
                  size="small"
                  sx={{
                    background: "rgba(99, 102, 241, 0.1)",
                    color: "primary.main",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    height: 24,
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Downgrade Verification Modal */}
      <Dialog
        open={downgradeModalOpen}
        onClose={() => {
          setDowngradeModalOpen(false);
          setSelectedPlan(null);
        }}
        PaperProps={{
          sx: {
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
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
            color: 'text.primary',
            fontWeight: 700,
            pb: 2,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'rgba(245, 158, 11, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Warning sx={{ color: '#f59e0b', fontSize: 24 }} />
          </Box>
          Confirm Plan Change
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.7 }}>
            {selectedPlan?.plan === 'free' 
              ? 'Are you sure you want to switch to the Free plan?'
              : `Are you sure you want to downgrade to the ${selectedPlan?.name} plan?`}
          </DialogContentText>
          {subscriptionStatus?.subscription?.currentPeriodEnd && (
            <Box
              sx={{
                p: 2,
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 2,
                mb: 2,
              }}
            >
              <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, mb: 0.5 }}>
                Your subscription will continue until:
              </Typography>
              <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                {new Date(subscriptionStatus.subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                You'll have full access to all features until then. After that, your plan will switch to {selectedPlan?.name}.
              </Typography>
            </Box>
          )}
          <Box
            sx={{
              p: 2,
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: 2,
              mb: 2,
            }}
          >
            <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 600, mb: 1 }}>
              You may lose access to:
            </Typography>
            <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2, m: 0 }}>
              {selectedPlan?.plan === 'free' ? (
                <>
                  <li>All premium features</li>
                  <li>Advanced export formats</li>
                  <li>Bulk processing</li>
                  <li>Analytics dashboard</li>
                  <li>Custom notifications</li>
                </>
              ) : selectedPlan?.plan === 'pro' ? (
                <>
                  <li>Bulk contract processing</li>
                  <li>Advanced analytics dashboard</li>
                  <li>Custom notification settings</li>
                  <li>CSV and JSON export formats</li>
                  <li>Branded PDF reports</li>
                </>
              ) : (
                <>
                  <li>All premium features</li>
                  <li>Higher contract limits</li>
                  <li>Advanced export formats</li>
                </>
              )}
            </Typography>
          </Box>
          <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            This action cannot be undone. Your subscription will be updated immediately.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => {
              setDowngradeModalOpen(false);
              setSelectedPlan(null);
            }}
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
            onClick={async () => {
              if (selectedPlan?.plan === 'free') {
                // Cancel subscription at period end
                setIsCancelling(true);
                try {
                  await subscriptionService.cancelAtPeriodEnd();
                  toast.success('Subscription will be cancelled at the end of your billing period');
                  setDowngradeModalOpen(false);
                  setSelectedPlan(null);
                  setTimeout(() => {
                    window.location.href = '/dashboard';
                  }, 1500);
                } catch (error: any) {
                  toast.error(error.response?.data?.error || 'Failed to cancel subscription');
                } finally {
                  setIsCancelling(false);
                }
              } else {
                handleSubscribe(selectedPlan!.plan as "pro" | "business");
                setDowngradeModalOpen(false);
                setSelectedPlan(null);
              }
            }}
            disabled={isCancelling}
            variant="contained"
            sx={{
              background: selectedPlan?.plan === 'free' 
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              '&:hover': {
                background: selectedPlan?.plan === 'free'
                  ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                  : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
              },
            }}
            startIcon={<Warning />}
          >
            Confirm {selectedPlan?.plan === 'free' ? 'Switch' : 'Downgrade'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PricingPage;
