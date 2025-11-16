import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Toolbar,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  AutoAwesome,
  Security,
  Speed,
  Description,
  CheckCircle,
  ArrowForward,
  Upload,
  Analytics,
  Shield,
  Language,
  Star,
  Article,
  Insights,
  FormatQuote,
  ArrowRight,
  Warning,
  TrendingUp,
  AccessTime,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";

const LandingPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [isNavbarVisible, setIsNavbarVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [activeSection, setActiveSection] = useState("");
  const lastScrollY = useRef(0);

  // Handle scroll to show/hide navbar and detect active section
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar after scrolling down 300px
      if (currentScrollY > 300) {
        setIsNavbarVisible(true);
      } else {
        setIsNavbarVisible(false);
      }

      // Detect active section
      const sections = ["features", "how-it-works"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section);
            break;
          }
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileMenuOpen(false);
  };

  const capabilities = [
    { label: "Unlimited Contracts", icon: <Article /> },
    { label: "PDF, DOCX, TXT", icon: <Description /> },
    { label: "AI Analysis", icon: <AutoAwesome /> },
    { label: "Risk Detection", icon: <Security /> },
  ];

  const features = [
    {
      icon: <AutoAwesome sx={{ fontSize: 40 }} />,
      title: "AI-Powered Analysis",
      description:
        "Advanced AI technology analyzes your contracts in seconds, extracting key information and identifying potential issues.",
      color: "#6366f1",
      badge: "Core Feature",
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: "Risk Detection",
      description:
        "Automatically flags red flags like non-compete clauses, auto-renewal terms, and liability issues before you sign.",
      color: "#ec4899",
      badge: "Smart Alerts",
    },
    {
      icon: <Language sx={{ fontSize: 40 }} />,
      title: "Plain English Summaries",
      description:
        "Complex legal jargon translated into clear, understandable language so you know exactly what you're agreeing to.",
      color: "#10b981",
      badge: "Easy to Understand",
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: "Lightning Fast",
      description:
        "Get comprehensive contract analysis in under 60 seconds. No waiting, no delays, just instant insights.",
      color: "#3b82f6",
      badge: "60s Average",
    },
    {
      icon: <Insights sx={{ fontSize: 40 }} />,
      title: "Detailed Insights",
      description:
        "Every legal term and clause explained in detail, helping you understand the fine print without a law degree.",
      color: "#f59e0b",
      badge: "Comprehensive",
    },
    {
      icon: <Shield sx={{ fontSize: 40 }} />,
      title: "Secure & Private",
      description:
        "Your contracts are encrypted and stored securely. We never share your data with third parties.",
      color: "#8b5cf6",
      badge: "Enterprise Grade",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Upload Your Contract",
      description:
        "Drag and drop your PDF, DOCX, or TXT file. Our system accepts all common contract formats instantly.",
      icon: <Upload />,
      color: "#6366f1",
    },
    {
      number: "02",
      title: "AI Analysis",
      description:
        "Our advanced AI analyzes every clause, extracts key terms, and identifies potential risks automatically.",
      icon: <Analytics />,
      color: "#ec4899",
    },
    {
      number: "03",
      title: "Get Insights",
      description:
        "Receive a comprehensive report with plain English summaries, risk flags, and detailed clause explanations.",
      icon: <Description />,
      color: "#10b981",
    },
    {
      number: "04",
      title: "Make Decisions",
      description:
        "Understand your contract fully and make informed decisions with confidence. Share reports with your team.",
      icon: <CheckCircle />,
      color: "#3b82f6",
    },
  ];

  const benefits = [
    "Save thousands on legal fees",
    "Understand contracts in minutes, not hours",
    "Never miss hidden risks or unfavorable terms",
    "Make confident decisions with AI-powered insights",
    "Share reports securely with your team",
    "Works with PDF, DOCX, and TXT formats",
  ];

  const testimonials = [
    {
      quote:
        "ContractIQ saved me hours of contract review. The AI analysis caught several red flags I would have missed.",
      author: "Sarah Chen",
      role: "Startup Founder",
      rating: 5,
    },
    {
      quote:
        "As a freelancer, I review contracts constantly. This tool is a game-changer for understanding complex terms.",
      author: "Michael Rodriguez",
      role: "Freelance Developer",
      rating: 5,
    },
    {
      quote:
        "The plain English summaries make it so easy to understand what I'm signing. Highly recommend!",
      author: "Emily Johnson",
      role: "Business Owner",
      rating: 5,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#0a0a0f",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Floating Navigation Bar */}
      <AnimatePresence>
        {isNavbarVisible && (
          <Box
            sx={{
              position: "fixed",
              top: { xs: 12, md: 20 },
              left: 0,
              right: 0,
              zIndex: 1000,
              display: "flex",
              justifyContent: "center",
              px: { xs: 1.5, md: 3 },
            }}
          >
            <Box
              component={motion.div}
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              style={{
                width: "100%",
                maxWidth: "1200px",
              }}
            >
              {/* Floating Navbar */}
              <Box
                sx={{
                  background: "rgba(15, 23, 42, 0.85)",
                  backdropFilter: "blur(40px) saturate(180%)",
                  border: "1px solid rgba(148, 163, 184, 0.12)",
                  borderRadius: 3,
                  boxShadow:
                    "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
                  <Toolbar
                    sx={{
                      py: { xs: 1.5, md: 2 },
                      minHeight: { xs: 56, md: 64 },
                      px: { xs: 1, md: 2 },
                    }}
                    disableGutters
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      {/* Logo with Animation */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Box
                          component={Link}
                          to="/"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            textDecoration: "none",
                            mr: { xs: 2, md: 4 },
                            position: "relative",
                          }}
                          onClick={() =>
                            window.scrollTo({ top: 0, behavior: "smooth" })
                          }
                        >
                          <Box
                            sx={{
                              width: { xs: 32, md: 40 },
                              height: { xs: 32, md: 40 },
                              borderRadius: 1.5,
                              background:
                                "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mr: 1.5,
                              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
                            }}
                          >
                            <Description
                              sx={{
                                color: "#fff",
                                fontSize: { xs: 18, md: 22 },
                              }}
                            />
                          </Box>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 900,
                              background:
                                "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              fontSize: { xs: "1.25rem", md: "1.5rem" },
                              letterSpacing: "-0.02em",
                            }}
                          >
                            ContractIQ
                          </Typography>
                        </Box>
                      </motion.div>

                      {/* Desktop Navigation with Animated Underlines */}
                      <Box
                        sx={{
                          display: { xs: "none", md: "flex" },
                          alignItems: "center",
                          gap: 0.5,
                          flex: 1,
                          justifyContent: "center",
                        }}
                      >
                        {[
                          { id: "features", label: "Features" },
                          { id: "pricing", label: "Pricing", isLink: true },
                          { id: "how-it-works", label: "How It Works" },
                        ].map((item) => {
                          const isActive = activeSection === item.id;
                          const NavButton = item.isLink ? (
                            <Button
                              key={item.id}
                              component={Link}
                              to="/pricing"
                              sx={{
                                color: isActive
                                  ? "text.primary"
                                  : "text.secondary",
                                fontSize: "0.9375rem",
                                fontWeight: isActive ? 600 : 500,
                                px: 2,
                                py: 1,
                                position: "relative",
                                transition: "all 0.3s ease",
                                "&::after": {
                                  content: '""',
                                  position: "absolute",
                                  bottom: 0,
                                  left: "50%",
                                  transform: isActive
                                    ? "translateX(-50%) scaleX(1)"
                                    : "translateX(-50%) scaleX(0)",
                                  width: "60%",
                                  height: "2px",
                                  background:
                                    "linear-gradient(90deg, #6366f1, #ec4899)",
                                  borderRadius: 1,
                                  transition: "transform 0.3s ease",
                                },
                                "&:hover": {
                                  color: "text.primary",
                                  "&::after": {
                                    transform: "translateX(-50%) scaleX(1)",
                                  },
                                },
                              }}
                            >
                              {item.label}
                            </Button>
                          ) : (
                            <Button
                              key={item.id}
                              onClick={() => scrollToSection(item.id)}
                              sx={{
                                color: isActive
                                  ? "text.primary"
                                  : "text.secondary",
                                fontSize: "0.9375rem",
                                fontWeight: isActive ? 600 : 500,
                                px: 2,
                                py: 1,
                                position: "relative",
                                transition: "all 0.3s ease",
                                "&::after": {
                                  content: '""',
                                  position: "absolute",
                                  bottom: 0,
                                  left: "50%",
                                  transform: isActive
                                    ? "translateX(-50%) scaleX(1)"
                                    : "translateX(-50%) scaleX(0)",
                                  width: "60%",
                                  height: "2px",
                                  background:
                                    "linear-gradient(90deg, #6366f1, #ec4899)",
                                  borderRadius: 1,
                                  transition: "transform 0.3s ease",
                                },
                                "&:hover": {
                                  color: "text.primary",
                                  "&::after": {
                                    transform: "translateX(-50%) scaleX(1)",
                                  },
                                },
                              }}
                            >
                              {item.label}
                            </Button>
                          );
                          return NavButton;
                        })}
                      </Box>

                      {/* Right Side Actions */}
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: "center" }}
                      >
                        <Button
                          component={Link}
                          to="/login"
                          variant="text"
                          size="small"
                          sx={{
                            display: { xs: "none", sm: "inline-flex" },
                            color: "text.secondary",
                            px: 2,
                            py: 1,
                            fontWeight: 500,
                            "&:hover": {
                              color: "text.primary",
                              background: "rgba(99, 102, 241, 0.08)",
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          Login
                        </Button>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            component={Link}
                            to="/register"
                            variant="contained"
                            size="small"
                            endIcon={<ArrowForward />}
                            sx={{
                              background:
                                "linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #ec4899 100%)",
                              backgroundSize: "200% 200%",
                              px: 3,
                              py: 1,
                              borderRadius: 2,
                              fontWeight: 700,
                              boxShadow: "0 4px 16px rgba(99, 102, 241, 0.4)",
                              "&:hover": {
                                background:
                                  "linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #f472b6 100%)",
                                backgroundPosition: "100% 50%",
                                boxShadow: "0 6px 20px rgba(99, 102, 241, 0.5)",
                              },
                              transition: "all 0.3s ease",
                            }}
                          >
                            Get Started
                          </Button>
                        </motion.div>

                        {/* Mobile Menu Button */}
                        <Button
                          onClick={(e) => {
                            setMobileMenuAnchor(e.currentTarget);
                            setMobileMenuOpen(true);
                          }}
                          sx={{
                            display: { xs: "inline-flex", md: "none" },
                            color: "text.primary",
                            minWidth: "auto",
                            p: 1.5,
                            borderRadius: 1.5,
                            "&:hover": {
                              background: "rgba(99, 102, 241, 0.1)",
                            },
                          }}
                        >
                          <MenuIcon />
                        </Button>
                      </Stack>
                    </Box>
                  </Toolbar>
                </Container>
              </Box>
            </Box>
          </Box>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={mobileMenuOpen}
        onClose={() => {
          setMobileMenuOpen(false);
          setMobileMenuAnchor(null);
        }}
        sx={{
          "& .MuiPaper-root": {
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(30px)",
            border: "1px solid rgba(148, 163, 184, 0.1)",
            mt: 1,
            minWidth: 200,
          },
        }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          onClick={() => {
            scrollToSection("features");
            setMobileMenuOpen(false);
            setMobileMenuAnchor(null);
          }}
          sx={{
            color: "text.primary",
            "&:hover": {
              background: "rgba(99, 102, 241, 0.1)",
            },
          }}
        >
          Features
        </MenuItem>
        <MenuItem
          component={Link}
          to="/pricing"
          onClick={() => {
            setMobileMenuOpen(false);
            setMobileMenuAnchor(null);
          }}
          sx={{
            color: "text.primary",
            "&:hover": {
              background: "rgba(99, 102, 241, 0.1)",
            },
          }}
        >
          Pricing
        </MenuItem>
        <MenuItem
          onClick={() => {
            scrollToSection("how-it-works");
            setMobileMenuOpen(false);
            setMobileMenuAnchor(null);
          }}
          sx={{
            color: "text.primary",
            "&:hover": {
              background: "rgba(99, 102, 241, 0.1)",
            },
          }}
        >
          How It Works
        </MenuItem>
        <MenuItem
          component={Link}
          to="/login"
          onClick={() => {
            setMobileMenuOpen(false);
            setMobileMenuAnchor(null);
          }}
          sx={{
            color: "text.primary",
            "&:hover": {
              background: "rgba(99, 102, 241, 0.1)",
            },
          }}
        >
          Login
        </MenuItem>
        <MenuItem
          component={Link}
          to="/register"
          onClick={() => {
            setMobileMenuOpen(false);
            setMobileMenuAnchor(null);
          }}
          sx={{
            color: "text.primary",
            "&:hover": {
              background: "rgba(99, 102, 241, 0.1)",
            },
          }}
        >
          Sign Up
        </MenuItem>
      </Menu>

      {/* Animated Background Elements */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <Box
          component={motion.div}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          sx={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <Box
          component={motion.div}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          sx={{
            position: "absolute",
            top: "10%",
            right: "-15%",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        <Box
          component={motion.div}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          sx={{
            position: "absolute",
            bottom: "-10%",
            left: "20%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
      </Box>

      {/* Hero Section */}
      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
          pt: { xs: 7, md: 7 },
          pb: { xs: 10, md: 16 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Social Proof Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Chip
                icon={<Star sx={{ color: "#fbbf24" }} />}
                label="Loved by 10,000+ Users"
                sx={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  color: "text.primary",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  py: 2.5,
                  px: 1,
                  "& .MuiChip-icon": {
                    color: "#fbbf24",
                  },
                }}
              />
            </Box>
          </motion.div>

          {/* Main Headline */}
          <Box sx={{ textAlign: "center", maxWidth: 1100, mx: "auto", mb: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Typography
                variant="h1"
                sx={{
                  mb: 3,
                  fontWeight: 900,
                  fontSize: {
                    xs: "2.75rem",
                    sm: "4rem",
                    md: "5rem",
                    lg: "6rem",
                  },
                  letterSpacing: "-0.05em",
                  lineHeight: 1.05,
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #cbd5e1 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Answers You Can Trust.
                <br />
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #818cf8 30%, #ec4899 70%, #f472b6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    position: "relative",
                    backgroundSize: "200% 200%",
                    animation: "gradientShift 4s ease infinite",
                    "@keyframes gradientShift": {
                      "0%, 100%": {
                        backgroundPosition: "0% 50%",
                      },
                      "50%": {
                        backgroundPosition: "100% 50%",
                      },
                    },
                  }}
                >
                  Sources You Can See.
                  <Box
                    component={motion.span}
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    sx={{
                      position: "absolute",
                      bottom: "-6px",
                      left: 0,
                      right: 0,
                      height: "5px",
                      background:
                        "linear-gradient(90deg, transparent, #6366f1, #ec4899, transparent)",
                      backgroundSize: "200% 100%",
                      borderRadius: 2,
                      opacity: 0.7,
                    }}
                  />
                </Box>
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{
                  mb: 3,
                  maxWidth: 750,
                  mx: "auto",
                  fontSize: { xs: "1.15rem", md: "1.5rem" },
                  lineHeight: 1.6,
                  fontWeight: 400,
                }}
              >
                AI-powered contract analysis that saves you time and money.
                <br />
                <Box
                  component="span"
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                  }}
                >
                  Understand any contract in plain English—no legal degree
                  required.
                </Box>
              </Typography>
            </motion.div>

            {/* Capabilities Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                flexWrap="wrap"
                sx={{ mb: 4 }}
              >
                {capabilities.map((cap, index) => (
                  <Chip
                    key={index}
                    icon={cap.icon}
                    label={cap.label}
                    sx={{
                      background: "rgba(15, 23, 42, 0.5)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      color: "text.secondary",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      py: 1.5,
                      "& .MuiChip-icon": {
                        color: "#6366f1",
                        fontSize: "1.1rem",
                      },
                    }}
                  />
                ))}
              </Stack>
            </motion.div>
          </Box>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: { xs: 3, sm: 6, md: 8 },
                mb: 6,
                flexWrap: "wrap",
              }}
            >
              {[
                { value: "60s", label: "Average Analysis Time" },
                { value: "10K+", label: "Contracts Analyzed" },
                { value: "99.9%", label: "Uptime" },
              ].map((stat, index) => (
                <Box
                  key={index}
                  sx={{
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      background:
                        "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      mb: 0.5,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.875rem" }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2.5}
              justifyContent="center"
              alignItems="center"
              sx={{ mb: 5 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.99 }}
                style={{ width: "100%", maxWidth: "280px" }}
              >
                <Button
                  component={Link}
                  to={"/register"}
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  fullWidth
                  sx={{
                    px: 5,
                    py: 2,
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    borderRadius: 2,
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #ec4899 100%)",
                    backgroundSize: "200% 200%",
                    boxShadow: "0 8px 32px rgba(99, 102, 241, 0.4)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #f472b6 100%)",
                      backgroundPosition: "100% 50%",
                      boxShadow: "0 10px 36px rgba(99, 102, 241, 0.45)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Start Free Trial
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.99 }}
                style={{ width: "100%", maxWidth: "280px" }}
              >
                <Button
                  component={Link}
                  to="/pricing"
                  variant="outlined"
                  size="large"
                  fullWidth
                  sx={{
                    px: 5,
                    py: 2,
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    borderRadius: 2,
                    borderWidth: "2px",
                    borderColor: "rgba(148, 163, 184, 0.4)",
                    color: "text.primary",
                    "&:hover": {
                      borderColor: "rgba(99, 102, 241, 0.7)",
                      background: "rgba(99, 102, 241, 0.08)",
                      borderWidth: "2px",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  View Pricing
                </Button>
              </motion.div>
            </Stack>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.875rem", mb: 1 }}
              >
                No Card Needed · Cancel Anytime
              </Typography>
            </Box>
          </motion.div>
        </motion.div>
      </Container>

      {/* Features Section */}
      <Box
        id="features"
        sx={{
          position: "relative",
          zIndex: 1,
          py: { xs: 8, md: 12 },
          background: "rgba(15, 23, 42, 0.3)",
          scrollMarginTop: "80px",
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <Typography
                variant="h2"
                sx={{
                  mb: 2,
                  fontWeight: 800,
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Everything You Need
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 600, mx: "auto" }}
              >
                Powerful features to help you understand and analyze contracts
                with confidence
              </Typography>
            </Box>
          </motion.div>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      background: "rgba(15, 23, 42, 0.6)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(148, 163, 184, 0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: `${feature.color}40`,
                        boxShadow: `0 8px 32px ${feature.color}20`,
                        transform: "translateY(-4px)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: `linear-gradient(135deg, ${feature.color}20 0%, ${feature.color}10 100%)`,
                            border: `1px solid ${feature.color}30`,
                          }}
                        >
                          <Box sx={{ color: feature.color }}>
                            {feature.icon}
                          </Box>
                        </Box>
                        {feature.badge && (
                          <Chip
                            label={feature.badge}
                            size="small"
                            sx={{
                              background: `linear-gradient(135deg, ${feature.color}15 0%, ${feature.color}05 100%)`,
                              border: `1px solid ${feature.color}30`,
                              color: feature.color,
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              height: 24,
                            }}
                          />
                        )}
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.7 }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box
        id="how-it-works"
        sx={{
          position: "relative",
          zIndex: 1,
          py: { xs: 8, md: 12 },
          scrollMarginTop: "80px",
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <Typography
                variant="h2"
                sx={{
                  mb: 2,
                  fontWeight: 800,
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                How It Works
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 600, mx: "auto" }}
              >
                Get comprehensive contract analysis in four simple steps
              </Typography>
            </Box>
          </motion.div>

          <Box sx={{ position: "relative" }}>
            <Grid container spacing={2} sx={{ mb: 8, alignItems: "center" }}>
              {steps.map((step, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                  >
                    <Box sx={{ textAlign: "center", position: "relative" }}>
                      {/* Connecting Arrow - Desktop */}
                      {index < steps.length - 1 && (
                        <Box
                          sx={{
                            display: { xs: "none", md: "flex" },
                            position: "absolute",
                            top: "60px",
                            right: { md: "-32px", lg: "-40px" },
                            zIndex: 1,
                            alignItems: "center",
                            width: { md: "64px", lg: "80px" },
                          }}
                        >
                          <Box
                            sx={{
                              width: "100%",
                              height: "2px",
                              background: `linear-gradient(90deg, ${
                                step.color
                              }50, ${steps[index + 1]?.color || step.color}50)`,
                              borderRadius: 1,
                            }}
                          />
                          <ArrowRight
                            sx={{
                              color: `${
                                steps[index + 1]?.color || step.color
                              }60`,
                              fontSize: 20,
                              ml: -0.5,
                            }}
                          />
                        </Box>
                      )}

                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mx: "auto",
                          mb: 3,
                          background: `linear-gradient(135deg, ${step.color}20 0%, ${step.color}10 100%)`,
                          border: `2px solid ${step.color}40`,
                          position: "relative",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "scale(1.05)",
                            boxShadow: `0 8px 24px ${step.color}30`,
                            borderColor: `${step.color}60`,
                          },
                        }}
                      >
                        <Box sx={{ color: step.color, fontSize: 40 }}>
                          {step.icon}
                        </Box>
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, mb: 1.5, fontSize: "1.1rem" }}
                      >
                        {step.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.7, fontSize: "0.9375rem" }}
                      >
                        {step.description}
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {/* Mobile/Tablet connecting lines with arrows */}
            <Box
              sx={{
                display: { xs: "flex", sm: "flex", md: "none" },
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                mb: 4,
                flexWrap: "wrap",
              }}
            >
              {steps.slice(0, -1).map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.15 + 0.3 }}
                >
                  <ArrowRight
                    sx={{
                      color: `${step.color}60`,
                      fontSize: 32,
                      mx: 1,
                    }}
                  />
                </motion.div>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          py: { xs: 8, md: 12 },
          background: "rgba(15, 23, 42, 0.3)",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    mb: 3,
                    fontWeight: 800,
                    background:
                      "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Why Choose ContractIQ?
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}
                >
                  Stop spending hours reading contracts or thousands on legal
                  fees. ContractIQ gives you the power to understand any
                  contract instantly with AI-powered analysis.
                </Typography>
                <Stack spacing={2}>
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <CheckCircle
                          sx={{
                            color: "success.main",
                            fontSize: 28,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="body1"
                          sx={{ fontSize: "1.05rem", fontWeight: 500 }}
                        >
                          {benefit}
                        </Typography>
                      </Box>
                    </motion.div>
                  ))}
                </Stack>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card
                  sx={{
                    background: "rgba(15, 23, 42, 0.6)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(148, 163, 184, 0.1)",
                    p: 3,
                    borderRadius: 3,
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      minHeight: 400,
                      borderRadius: 2,
                      background:
                        "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.6) 100%)",
                      border: "1px solid rgba(99, 102, 241, 0.2)",
                      position: "relative",
                      overflow: "hidden",
                      p: 3,
                    }}
                  >
                    {/* Mock Analysis Interface */}
                    <Box
                      sx={{ position: "relative", height: "100%", zIndex: 1 }}
                    >
                      {/* Header */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 3,
                          pb: 2,
                          borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1.5,
                              background:
                                "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Description sx={{ color: "#fff", fontSize: 20 }} />
                          </Box>
                          <Box>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                            >
                              Service Agreement
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.75rem" }}
                            >
                              Analyzed 2 minutes ago
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label="Complete"
                          size="small"
                          sx={{
                            background: "rgba(16, 185, 129, 0.2)",
                            color: "#10b981",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            fontSize: "0.75rem",
                          }}
                          icon={<CheckCircle sx={{ fontSize: 14 }} />}
                        />
                      </Box>

                      {/* Analysis Cards */}
                      <Stack spacing={2}>
                        {/* Risk Detection Card */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              background: "rgba(236, 72, 153, 0.1)",
                              border: "1px solid rgba(236, 72, 153, 0.2)",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                mb: 1,
                              }}
                            >
                              <Warning
                                sx={{ color: "#ec4899", fontSize: 20 }}
                              />
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 600, fontSize: "0.8125rem" }}
                              >
                                3 Risk Flags Detected
                              </Typography>
                            </Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.75rem", lineHeight: 1.5 }}
                            >
                              Auto-renewal clause • Non-compete agreement •
                              Liability terms
                            </Typography>
                          </Box>
                        </motion.div>

                        {/* Summary Card */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                        >
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              background: "rgba(99, 102, 241, 0.1)",
                              border: "1px solid rgba(99, 102, 241, 0.2)",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                mb: 1,
                              }}
                            >
                              <Language
                                sx={{ color: "#6366f1", fontSize: 20 }}
                              />
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 600, fontSize: "0.8125rem" }}
                              >
                                Plain English Summary
                              </Typography>
                            </Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.75rem", lineHeight: 1.5 }}
                            >
                              This is a 12-month service agreement with
                              automatic renewal. Payment is due monthly...
                            </Typography>
                          </Box>
                        </motion.div>

                        {/* Key Terms Card */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.6 }}
                        >
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              background: "rgba(16, 185, 129, 0.1)",
                              border: "1px solid rgba(16, 185, 129, 0.2)",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                mb: 1.5,
                              }}
                            >
                              <Insights
                                sx={{ color: "#10b981", fontSize: 20 }}
                              />
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 600, fontSize: "0.8125rem" }}
                              >
                                Key Terms Extracted
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 1,
                              }}
                            >
                              {[
                                "Duration: 12 months",
                                "Price: $99/mo",
                                "Termination: 30 days",
                              ].map((term, idx) => (
                                <Chip
                                  key={idx}
                                  label={term}
                                  size="small"
                                  sx={{
                                    background: "rgba(16, 185, 129, 0.15)",
                                    color: "#10b981",
                                    border: "1px solid rgba(16, 185, 129, 0.3)",
                                    fontSize: "0.7rem",
                                    height: 24,
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </motion.div>

                        {/* Stats Row */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.8 }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              gap: 2,
                              pt: 2,
                              borderTop: "1px solid rgba(148, 163, 184, 0.1)",
                            }}
                          >
                            <Box sx={{ flex: 1, textAlign: "center" }}>
                              <AccessTime
                                sx={{
                                  color: "#3b82f6",
                                  fontSize: 18,
                                  mb: 0.5,
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                }}
                              >
                                45s
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: "0.7rem" }}
                              >
                                Analysis
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1, textAlign: "center" }}>
                              <TrendingUp
                                sx={{
                                  color: "#10b981",
                                  fontSize: 18,
                                  mb: 0.5,
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                }}
                              >
                                95%
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: "0.7rem" }}
                              >
                                Confidence
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1, textAlign: "center" }}>
                              <Article
                                sx={{
                                  color: "#6366f1",
                                  fontSize: 18,
                                  mb: 0.5,
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                }}
                              >
                                12
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: "0.7rem" }}
                              >
                                Clauses
                              </Typography>
                            </Box>
                          </Box>
                        </motion.div>
                      </Stack>

                      {/* Animated background gradient */}
                      <Box
                        component={motion.div}
                        animate={{
                          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background:
                            "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(236, 72, 153, 0.05) 50%, rgba(16, 185, 129, 0.05) 100%)",
                          backgroundSize: "200% 200%",
                          zIndex: 0,
                          pointerEvents: "none",
                        }}
                      />
                    </Box>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          py: { xs: 8, md: 12 },
          background: "rgba(15, 23, 42, 0.3)",
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <Typography
                variant="h2"
                sx={{
                  mb: 2,
                  fontWeight: 800,
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Loved by 10,000+ Users
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 600, mx: "auto" }}
              >
                See what our users are saying about ContractIQ
              </Typography>
            </Box>
          </motion.div>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      background: "rgba(15, 23, 42, 0.6)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(148, 163, 184, 0.1)",
                      p: 3,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "rgba(99, 102, 241, 0.4)",
                        boxShadow: "0 8px 32px rgba(99, 102, 241, 0.2)",
                        transform: "translateY(-4px)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} sx={{ color: "#fbbf24", fontSize: 20 }} />
                      ))}
                    </Box>
                    <FormatQuote
                      sx={{
                        fontSize: 40,
                        color: "primary.main",
                        opacity: 0.3,
                        mb: 1,
                      }}
                    />
                    <Typography
                      variant="body1"
                      sx={{ mb: 3, lineHeight: 1.7, fontStyle: "italic" }}
                    >
                      "{testimonial.quote}"
                    </Typography>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {testimonial.author}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.875rem" }}
                      >
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          position: "relative",
          zIndex: 1,
          py: { xs: 6, md: 8 },
          borderTop: "1px solid rgba(148, 163, 184, 0.1)",
          background: "rgba(10, 10, 15, 0.8)",
          backdropFilter: "blur(20px)",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Brand Section */}
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    mb: 1,
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  ContractIQ
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ maxWidth: 280, lineHeight: 1.7 }}
                >
                  AI-powered contract analysis that helps you understand and
                  protect yourself from unfavorable terms.
                </Typography>
              </Box>
            </Grid>

            {/* Links Section */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 2, fontSize: "0.875rem" }}
              >
                Product
              </Typography>
              <Stack spacing={1.5}>
                <Button
                  component={Link}
                  to="/pricing"
                  variant="text"
                  size="small"
                  color="inherit"
                  sx={{
                    justifyContent: "flex-start",
                    fontSize: "0.875rem",
                    color: "text.secondary",
                    "&:hover": {
                      color: "text.primary",
                    },
                  }}
                >
                  Pricing
                </Button>
                <Button
                  component={Link}
                  to="/dashboard"
                  variant="text"
                  size="small"
                  color="inherit"
                  sx={{
                    justifyContent: "flex-start",
                    fontSize: "0.875rem",
                    color: "text.secondary",
                    "&:hover": {
                      color: "text.primary",
                    },
                  }}
                >
                  Features
                </Button>
              </Stack>
            </Grid>

            {/* Company Section */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 2, fontSize: "0.875rem" }}
              >
                Company
              </Typography>
              <Stack spacing={1.5}>
                <Button
                  component={Link}
                  to="/privacy"
                  variant="text"
                  size="small"
                  color="inherit"
                  sx={{
                    justifyContent: "flex-start",
                    fontSize: "0.875rem",
                    color: "text.secondary",
                    "&:hover": {
                      color: "text.primary",
                    },
                  }}
                >
                  Privacy
                </Button>
                <Button
                  component={Link}
                  to="/terms"
                  variant="text"
                  size="small"
                  color="inherit"
                  sx={{
                    justifyContent: "flex-start",
                    fontSize: "0.875rem",
                    color: "text.secondary",
                    "&:hover": {
                      color: "text.primary",
                    },
                  }}
                >
                  Terms
                </Button>
              </Stack>
            </Grid>

            {/* Auth Section */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 2, fontSize: "0.875rem" }}
              >
                Account
              </Typography>
              <Stack spacing={1.5}>
                {!isAuthenticated ? (
                  <>
                    <Button
                      component={Link}
                      to="/login"
                      variant="text"
                      size="small"
                      color="inherit"
                      sx={{
                        justifyContent: "flex-start",
                        fontSize: "0.875rem",
                        color: "text.secondary",
                        "&:hover": {
                          color: "text.primary",
                        },
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      component={Link}
                      to="/register"
                      variant="text"
                      size="small"
                      color="inherit"
                      sx={{
                        justifyContent: "flex-start",
                        fontSize: "0.875rem",
                        color: "text.secondary",
                        "&:hover": {
                          color: "text.primary",
                        },
                      }}
                    >
                      Sign Up
                    </Button>
                  </>
                ) : (
                  <Button
                    component={Link}
                    to="/dashboard"
                    variant="text"
                    size="small"
                    color="inherit"
                    sx={{
                      justifyContent: "flex-start",
                      fontSize: "0.875rem",
                      color: "text.secondary",
                      "&:hover": {
                        color: "text.primary",
                      },
                    }}
                  >
                    Dashboard
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>

          {/* Bottom Bar */}
          <Box
            sx={{
              mt: 6,
              pt: 4,
              borderTop: "1px solid rgba(148, 163, 184, 0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.8125rem" }}
            >
              © {new Date().getFullYear()} ContractIQ. All rights reserved.
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.75rem" }}
              >
                Made with
              </Typography>
              <Box
                component="span"
                sx={{
                  color: "#ec4899",
                  fontSize: "0.875rem",
                  mx: 0.5,
                }}
              >
                ♥
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.75rem" }}
              >
                by{" "}
                <Box
                  component="a"
                  href="https://portfolio-two-sigma-8ktq5rj0zc.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "#6366f1",
                    textDecoration: "none",
                    fontWeight: 600,
                    "&:hover": {
                      color: "#ec4899",
                      textDecoration: "underline",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  MCD webs
                </Box>{" "}
                for contractIQ
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
