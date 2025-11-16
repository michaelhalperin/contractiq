import { useEffect } from 'react';
import { Box, Container, Typography, Paper, Stack, Divider } from '@mui/material';
import { Gavel } from '@mui/icons-material';
import { motion } from 'framer-motion';

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
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
                <Gavel sx={{ color: '#fff', fontSize: 32 }} />
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
                Terms of Service
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
                  title="1. Acceptance of Terms"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        By accessing and using ContractIQ ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        These Terms of Service ("Terms") govern your access to and use of ContractIQ's website, services, and applications. By using our Service, you agree to comply with and be bound by these Terms.
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="2. Description of Service"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        ContractIQ is an AI-powered contract analysis platform that helps users analyze, review, and understand legal contracts. Our Service includes:
                      </Typography>
                      <Typography component="ul" variant="body1" color="text.secondary" sx={{ pl: 3 }}>
                        <li>Contract upload and storage</li>
                        <li>AI-powered contract analysis and insights</li>
                        <li>Risk assessment and flagging</li>
                        <li>Contract summary generation</li>
                        <li>Key obligations and clauses identification</li>
                        <li>Shareable report generation</li>
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph sx={{ mt: 2 }}>
                        We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice.
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="3. User Accounts and Registration"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        To use certain features of our Service, you must register for an account. You agree to:
                      </Typography>
                      <Typography component="ul" variant="body1" color="text.secondary" sx={{ pl: 3, mb: 2 }}>
                        <li>Provide accurate, current, and complete information during registration</li>
                        <li>Maintain and promptly update your account information</li>
                        <li>Maintain the security of your password and account</li>
                        <li>Accept responsibility for all activities that occur under your account</li>
                        <li>Notify us immediately of any unauthorized use of your account</li>
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        You are responsible for maintaining the confidentiality of your account credentials. We are not liable for any loss or damage arising from your failure to comply with this section.
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="4. Subscription Plans and Payment"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        ContractIQ offers various subscription plans with different features and usage limits. By subscribing to a paid plan, you agree to:
                      </Typography>
                      <Typography component="ul" variant="body1" color="text.secondary" sx={{ pl: 3, mb: 2 }}>
                        <li>Pay all fees associated with your selected plan</li>
                        <li>Fees are billed in advance on a monthly or annual basis</li>
                        <li>We reserve the right to change our pricing with 30 days' notice</li>
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        Subscription plans automatically renew unless cancelled before the renewal date. You may cancel your subscription at any time, and cancellation will take effect at the end of the current billing period.
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="5. Refund Policy"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        <strong>General Policy:</strong> All subscription fees are non-refundable except as required by applicable law or as explicitly stated in this policy.
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        <strong>Subscription Cancellation:</strong> You may cancel your subscription at any time. Cancellation will take effect at the end of your current billing period. You will continue to have access to the Service until the end of the billing period for which you have already paid.
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        <strong>Refund Eligibility:</strong> Refunds may be considered in the following circumstances:
                      </Typography>
                      <Typography component="ul" variant="body1" color="text.secondary" sx={{ pl: 3, mb: 2 }}>
                        <li>Technical issues that prevent you from using the Service, provided you contact us within 7 days of your purchase</li>
                        <li>Duplicate charges or billing errors</li>
                        <li>As required by applicable consumer protection laws in your jurisdiction</li>
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        <strong>Refund Requests:</strong> To request a refund, please contact us at legal@contractiq.com with your account information and the reason for your refund request. We will review your request and respond within 5-7 business days.
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        <strong>Processing Time:</strong> If your refund request is approved, refunds will be processed to the original payment method within 10-14 business days.
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        <strong>No Refunds For:</strong> We do not provide refunds for partial billing periods, unused features, or if you simply change your mind after the 7-day period has elapsed.
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="6. Acceptable Use"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        You agree not to use the Service to:
                      </Typography>
                      <Typography component="ul" variant="body1" color="text.secondary" sx={{ pl: 3, mb: 2 }}>
                        <li>Upload, transmit, or distribute any content that is illegal, harmful, or violates any applicable laws</li>
                        <li>Upload contracts or documents containing sensitive personal information without proper authorization</li>
                        <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
                        <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                        <li>Use automated systems (bots, scrapers) to access the Service without permission</li>
                        <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                        <li>Resell or redistribute the Service without our written consent</li>
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        We reserve the right to suspend or terminate accounts that violate these terms.
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="7. Intellectual Property"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        The Service and its original content, features, and functionality are owned by ContractIQ and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        You retain ownership of any contracts or documents you upload to the Service. By uploading content, you grant us a limited license to use, store, and process your content solely for the purpose of providing the Service to you.
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        You may not copy, modify, distribute, sell, or lease any part of our Service without our prior written consent.
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="8. AI Analysis and Accuracy"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        ContractIQ uses artificial intelligence to analyze contracts. While we strive for accuracy, you acknowledge that:
                      </Typography>
                      <Typography component="ul" variant="body1" color="text.secondary" sx={{ pl: 3, mb: 2 }}>
                        <li>AI analysis may contain errors or inaccuracies</li>
                        <li>The Service is a tool to assist with contract review, not a substitute for professional legal advice</li>
                        <li>You should consult with qualified legal professionals for important legal decisions</li>
                        <li>We do not guarantee the accuracy, completeness, or reliability of AI-generated insights</li>
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        You are solely responsible for verifying the accuracy of any analysis and making your own informed decisions.
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="9. Data and Privacy"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand how we collect, use, and protect your information.
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        You are responsible for ensuring that any contracts or documents you upload comply with applicable privacy laws and that you have the necessary rights and permissions to upload such content.
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="10. Limitation of Liability"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        TO THE MAXIMUM EXTENT PERMITTED BY LAW, CONTRACTIQ SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        Our total liability for any claims arising from or related to the Service shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied.
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="11. Indemnification"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        You agree to indemnify, defend, and hold harmless ContractIQ and its officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including attorney's fees) arising from:
                      </Typography>
                      <Typography component="ul" variant="body1" color="text.secondary" sx={{ pl: 3 }}>
                        <li>Your use of the Service</li>
                        <li>Your violation of these Terms</li>
                        <li>Your violation of any third-party rights</li>
                        <li>Any content you upload or transmit through the Service</li>
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="12. Termination"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including if you breach these Terms.
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        Upon termination, your right to use the Service will immediately cease. We may delete your account and data, though we will provide reasonable notice when possible.
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        You may terminate your account at any time by contacting us or using the account deletion feature in your settings.
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="13. Changes to Terms"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last updated" date.
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        Your continued use of the Service after any changes constitutes acceptance of the new Terms. If you do not agree to the modified Terms, you must stop using the Service.
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="14. Governing Law"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which ContractIQ operates, without regard to its conflict of law provisions.
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration or in the courts of the applicable jurisdiction.
                      </Typography>
                    </>
                  }
                />

                <Section
                  title="15. Contact Information"
                  content={
                    <>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        If you have any questions about these Terms of Service, please contact us:
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Email: legal@contractiq.com
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

export default TermsOfService;

