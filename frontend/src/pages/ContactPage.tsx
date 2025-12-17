import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Stack,
  Alert,
} from "@mui/material";
import {
  ArrowBack,
  Email,
  Send,
  Support,
  AccessTime,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import api from "../services/api";
import toast from "react-hot-toast";
import SEOHead from "../components/SEOHead";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);
      setSuccess(false);
      await api.post("/contact", data);
      setSuccess(true);
      reset();
      toast.success("Message sent successfully! We'll get back to you soon.");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Us - ContractIQ",
    "description": "Get in touch with ContractIQ. We're here to help with any questions about our AI contract analysis platform.",
    "url": "https://contractiq-ivory.vercel.app/contact",
    "mainEntity": {
      "@type": "Organization",
      "name": "ContractIQ",
      "email": "support@contractiq.com",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "email": "support@contractiq.com",
        "availableLanguage": "English"
      }
    }
  };

  return (
    <>
      <SEOHead
        title="Contact Us - ContractIQ"
        description="Get in touch with ContractIQ. We're here to help with any questions about our AI contract analysis platform."
        url="/contact"
        structuredData={structuredData}
      />
      <Box
        sx={{
          minHeight: "100vh",
          background: "#0a0a0f",
          position: "relative",
          py: { xs: 4, md: 8 },
          overflow: "hidden",
        }}
      >
        {/* Animated background gradients */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "60vh",
            background:
              "radial-gradient(ellipse at top, rgba(99, 102, 241, 0.2) 0%, transparent 50%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "40%",
            height: "40%",
            background:
              "radial-gradient(ellipse at bottom right, rgba(236, 72, 153, 0.15) 0%, transparent 50%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: { xs: 4, md: 8 } }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Button
                  component={Link}
                  to="/"
                  startIcon={<ArrowBack />}
                  sx={{
                    mb: 3,
                    color: "text.secondary",
                    borderRadius: 2,
                    px: 2,
                    "&:hover": {
                      color: "primary.main",
                      background: "rgba(99, 102, 241, 0.1)",
                      transform: "translateX(-4px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  Back to Home
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    fontSize: { xs: "2.25rem", md: "3.5rem" },
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 1.2,
                  }}
                >
                  Get in Touch
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{
                    maxWidth: 600,
                    mx: "auto",
                    fontWeight: 400,
                    fontSize: { xs: "1rem", md: "1.125rem" },
                    lineHeight: 1.7,
                  }}
                >
                  Have a question or need help? We're here to assist you. Send
                  us a message and we'll respond as soon as possible.
                </Typography>
              </motion.div>
            </Box>

            <Grid container spacing={4}>
              {/* Contact Info */}
              <Grid item xs={12} md={4}>
                <Box sx={{ position: "sticky", top: 100 }}>
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 3,
                        fontSize: "1.25rem",
                        color: "text.primary",
                      }}
                    >
                      Contact Information
                    </Typography>
                  </motion.div>
                  <Stack spacing={2.5}>
                    {[
                      {
                        icon: Email,
                        title: "Email",
                        value: "support@contractiq.com",
                        gradient:
                          "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        delay: 0.4,
                      },
                      {
                        icon: AccessTime,
                        title: "Response Time",
                        value: "Within 24-48 hours",
                        gradient:
                          "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        delay: 0.5,
                      },
                      {
                        icon: Support,
                        title: "Support Hours",
                        value: "Monday - Friday, 9 AM - 6 PM EST",
                        gradient:
                          "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
                        delay: 0.6,
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: item.delay }}
                        whileHover={{ scale: 1.02, y: -4 }}
                      >
                        <Paper
                          sx={{
                            p: 3,
                            background: "rgba(15, 23, 42, 0.7)",
                            backdropFilter: "blur(20px)",
                            border: "1px solid rgba(148, 163, 184, 0.15)",
                            borderRadius: 3,
                            transition: "all 0.3s ease",
                            cursor: "default",
                            "&:hover": {
                              borderColor: "rgba(99, 102, 241, 0.4)",
                              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
                              background: "rgba(15, 23, 42, 0.85)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 2.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 2.5,
                                background: item.gradient,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                              }}
                            >
                              <item.icon sx={{ color: "#fff", fontSize: 26 }} />
                            </Box>
                            <Box sx={{ flex: 1, pt: 0.5 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 700,
                                  mb: 0.75,
                                  color: "text.primary",
                                  fontSize: "0.9375rem",
                                }}
                              >
                                {item.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ lineHeight: 1.6 }}
                              >
                                {item.value}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
              </Grid>

              {/* Contact Form */}
              <Grid item xs={12} md={8}>
                <Paper
                  sx={{
                    p: { xs: 3, md: 4 },
                    background: "rgba(15, 23, 42, 0.8)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(148, 163, 184, 0.1)",
                    borderRadius: 3,
                  }}
                >
                  {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                      Thank you for contacting us! We'll get back to you soon.
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                      <TextField
                        {...register("name")}
                        label="Your Name"
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            background: "rgba(99, 102, 241, 0.05)",
                          },
                        }}
                      />

                      <TextField
                        {...register("email")}
                        label="Your Email"
                        type="email"
                        fullWidth
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            background: "rgba(99, 102, 241, 0.05)",
                          },
                        }}
                      />

                      <TextField
                        {...register("subject")}
                        label="Subject"
                        fullWidth
                        error={!!errors.subject}
                        helperText={errors.subject?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            background: "rgba(99, 102, 241, 0.05)",
                          },
                        }}
                      />

                      <TextField
                        {...register("message")}
                        label="Message"
                        multiline
                        rows={6}
                        fullWidth
                        error={!!errors.message}
                        helperText={errors.message?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            background: "rgba(99, 102, 241, 0.05)",
                          },
                        }}
                      />

                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={isSubmitting}
                        startIcon={<Send />}
                        sx={{
                          py: 1.5,
                          background:
                            "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                          },
                        }}
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </Stack>
                  </form>
                </Paper>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>
    </>
  );
};

export default ContactPage;
