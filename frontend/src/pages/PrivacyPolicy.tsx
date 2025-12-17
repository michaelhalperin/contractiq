import { useEffect } from 'react';
import { Box, Container, Typography, Paper, Stack, Divider } from '@mui/material';
import { PrivacyTip } from '@mui/icons-material';
import { motion } from 'framer-motion';
import SEOHead from '../components/SEOHead';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy - ContractIQ",
    "description": "ContractIQ Privacy Policy. Learn how we collect, use, and protect your personal information and contract data.",
    "url": "https://contractiq-ivory.vercel.app/privacy"
  };

  return (
    <>
      <SEOHead
        title="Privacy Policy - ContractIQ"
        description="ContractIQ Privacy Policy. Learn how we collect, use, and protect your personal information and contract data with industry-standard security."
        url="/privacy"
        structuredData={structuredData}
      />
      <Box sx={{ minHeight: '100vh', background: '#0a0a0f', position: 'relative', py: { xs: 8, md: 12 } }}>
      {/* Background gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '500px',
          background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Stack spacing={4}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  mb: 3,
                }}
              >
                <PrivacyTip sx={{ color: '#fff', fontSize: 32 }} />
              </Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '3rem' },
                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                }}
              >
                Privacy Policy
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>

            {/* Content */}
            <Paper
              sx={{
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: 3,
                p: { xs: 3, md: 5 },
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              <Stack spacing={4}>
                <Section
                  title="1. Introduction"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        Welcome to ContractIQ ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and in using our products and services.
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or interact with us. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site or use our services.
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="2. Information We Collect"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        We collect information that you provide directly to us, including:
                      </Typography>
                      <Typography component="ul" variant="body1" color="text.secondary" sx={{ pl: 3, mb: 2 }}>
                        <li>Account information (name, email address, password)</li>
                        <li>Contract documents and files you upload</li>
                        <li>Payment and billing information (processed securely through third-party payment processors)</li>
                        <li>Communication data when you contact us for support</li>
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        We also automatically collect certain information when you use our services, such as:
                      </Typography>
                      <Typography component="ul" variant="body1" color="text.secondary" sx={{ pl: 3 }}>
                        <li>Usage data and analytics</li>
                        <li>Device information and IP address</li>
                        <li>Cookies and similar tracking technologies</li>
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="3. How We Use Your Information"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        We use the information we collect to:
                      </Typography>
                      <Typography component="ul" variant="body1" color="text.secondary" sx={{ pl: 3 }}>
                        <li>Provide, maintain, and improve our services</li>
                        <li>Process your transactions and manage your account</li>
                        <li>Analyze contracts and provide AI-powered insights</li>
                        <li>Send you technical notices, updates, and support messages</li>
                        <li>Respond to your comments, questions, and requests</li>
                        <li>Monitor and analyze trends, usage, and activities</li>
                        <li>Detect, prevent, and address technical issues and security threats</li>
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="4. Data Storage and Security"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        We implement appropriate technical and organizational security measures to protect your personal information. Your contract documents are stored securely using industry-standard encryption and cloud storage services.
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="5. Data Sharing and Disclosure"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                      </Typography>
                      <Typography component="ul" variant="body1" color="text.secondary" sx={{ pl: 3 }}>
                        <li>With service providers who assist us in operating our platform (e.g., cloud storage, payment processing)</li>
                        <li>When required by law or to respond to legal process</li>
                        <li>To protect our rights, privacy, safety, or property</li>
                        <li>In connection with a business transfer or merger</li>
                        <li>With your explicit consent</li>
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="6. Your Rights and Choices"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        You have the right to:
                      </Typography>
                      <Typography component="ul" variant="body1" color="text.secondary" sx={{ pl: 3, mb: 2 }}>
                        <li>Access and receive a copy of your personal data</li>
                        <li>Rectify inaccurate or incomplete information</li>
                        <li>Request deletion of your personal data</li>
                        <li>Object to or restrict processing of your data</li>
                        <li>Data portability (receive your data in a structured format)</li>
                        <li>Withdraw consent at any time</li>
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        To exercise these rights, please contact us at the email address provided below.
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="7. Cookies and Tracking Technologies"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        However, if you do not accept cookies, you may not be able to use some portions of our service.
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="8. Third-Party Services"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        Our service may contain links to third-party websites or services that are not owned or controlled by ContractIQ. We have no control over, and assume no responsibility for, the privacy policies or practices of any third-party sites or services.
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        We use third-party services including:
                      </Typography>
                      <Typography component="ul" variant="body1" color="text.secondary" sx={{ pl: 3 }}>
                        <li>Paddle for payment processing</li>
                        <li>AWS for cloud storage and infrastructure</li>
                        <li>OpenAI for AI-powered contract analysis</li>
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="9. Data Retention"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal or regulatory purposes.
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="10. Children's Privacy"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        Our service is not intended for children under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="11. International Data Transfers"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ.
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        By using our service, you consent to the transfer of your information to facilities located outside your jurisdiction.
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="12. Changes to This Privacy Policy"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="13. Contact Us"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        If you have any questions about this Privacy Policy, please contact us:
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Email: privacy@contractiq.com
                      </Typography>
                    </>
                  }
                />
              </Stack>
            </Paper>
          </Stack>
        </motion.div>
      </Container>
    </Box>
    </>
  );
};

interface SectionProps {
  title: string;
  content: React.ReactNode;
}

const Section = ({ title, content }: SectionProps) => {
  return (
    <Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          mb: 2,
          color: 'text.primary',
          fontSize: { xs: '1.25rem', md: '1.5rem' },
        }}
      >
        {title}
      </Typography>
      {content}
      <Divider sx={{ mt: 3, borderColor: 'rgba(148, 163, 184, 0.1)' }} />
    </Box>
  );
};

export default PrivacyPolicy;

