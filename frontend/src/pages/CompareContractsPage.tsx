import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Description,
  Warning,
  CheckCircle,
  Info,
  TrendingUp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { contractService } from '../services/contract.service';
import toast from 'react-hot-toast';

interface ComparisonData {
  contracts: Array<{
    id: string;
    fileName: string;
    summary?: string;
    riskCount: number;
    keyParties?: {
      party1: string;
      party2: string;
    };
  }>;
  differences: {
    riskLevels: Array<{
      contractId: string;
      fileName: string;
      highRisks: number;
      mediumRisks: number;
      lowRisks: number;
    }>;
  };
}

const CompareContractsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contractIds = searchParams.get('ids')?.split(',').filter(Boolean) || [];

  const { data: comparison, isLoading, error } = useQuery<ComparisonData>({
    queryKey: ['compare', contractIds],
    queryFn: () => contractService.compareContracts(contractIds),
    enabled: contractIds.length >= 2,
  });

  useEffect(() => {
    if (contractIds.length < 2) {
      toast.error('Please select at least 2 contracts to compare');
      navigate('/dashboard');
    }
  }, [contractIds, navigate]);

  if (contractIds.length < 2) {
    return null;
  }

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', background: '#0a0a0f', position: 'relative' }}>
        <Container maxWidth="xl" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: '#6366f1' }} />
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', background: '#0a0a0f', position: 'relative' }}>
        <Container maxWidth="xl" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to load comparison. Please try again.
          </Alert>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Container>
      </Box>
    );
  }

  if (!comparison) {
    return null;
  }

  // Calculate risk totals for comparison
  const totalHighRisks = comparison.differences.riskLevels.reduce((sum, r) => sum + r.highRisks, 0);
  const totalMediumRisks = comparison.differences.riskLevels.reduce((sum, r) => sum + r.mediumRisks, 0);
  const totalLowRisks = comparison.differences.riskLevels.reduce((sum, r) => sum + r.lowRisks, 0);

  const maxHighRisks = Math.max(...comparison.differences.riskLevels.map(r => r.highRisks));
  const maxMediumRisks = Math.max(...comparison.differences.riskLevels.map(r => r.mediumRisks));
  const maxLowRisks = Math.max(...comparison.differences.riskLevels.map(r => r.lowRisks));

  return (
    <Box sx={{ minHeight: '100vh', background: '#0a0a0f', position: 'relative', pb: 6 }}>
      {/* Background gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '40vh',
          background: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pt: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{ mb: 3, color: 'text.secondary' }}
          >
            Back to Dashboard
          </Button>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 1,
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Contract Comparison
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Compare {comparison.contracts.length} contracts side-by-side
            </Typography>
          </motion.div>
        </Box>

        {/* Overview Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: 'rgba(239, 68, 68, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Warning sx={{ color: '#ef4444', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {totalHighRisks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      High Risk Flags
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: 'rgba(245, 158, 11, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Info sx={{ color: '#f59e0b', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {totalMediumRisks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Medium Risk Flags
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircle sx={{ color: '#10b981', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {totalLowRisks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Low Risk Flags
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Contracts Comparison Grid */}
        <Grid container spacing={3}>
          {comparison.contracts.map((contract, index) => {
            const riskData = comparison.differences.riskLevels.find(
              r => r.contractId === contract.id
            );
            const isHighestHigh = riskData?.highRisks === maxHighRisks && maxHighRisks > 0;
            const isHighestMedium = riskData?.mediumRisks === maxMediumRisks && maxMediumRisks > 0;
            const isHighestLow = riskData?.lowRisks === maxLowRisks && maxLowRisks > 0;

            return (
              <Grid item xs={12} md={6} lg={comparison.contracts.length === 2 ? 6 : 4} key={contract.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(148, 163, 184, 0.15)',
                      backdropFilter: 'blur(20px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'rgba(99, 102, 241, 0.4)',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 32px rgba(99, 102, 241, 0.15)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* Contract Header */}
                      <Box sx={{ mb: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Description sx={{ color: '#fff', fontSize: 24 }} />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {contract.fileName}
                            </Typography>
                            <Button
                              size="small"
                              onClick={() => navigate(`/contracts/${contract.id}`)}
                              sx={{ mt: 0.5, textTransform: 'none' }}
                            >
                              View Details
                            </Button>
                          </Box>
                        </Stack>
                      </Box>

                      <Divider sx={{ my: 3, borderColor: 'rgba(148, 163, 184, 0.1)' }} />

                      {/* Risk Summary */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                          Risk Summary
                        </Typography>
                        <Stack spacing={2}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              background: isHighestHigh
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(239, 68, 68, 0.05)',
                              border: `1px solid ${isHighestHigh ? '#ef4444' : 'rgba(239, 68, 68, 0.2)'}`,
                            }}
                          >
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Warning sx={{ color: '#ef4444', fontSize: 20 }} />
                                <Typography variant="body2" fontWeight={600}>
                                  High Risks
                                </Typography>
                              </Stack>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                  {riskData?.highRisks || 0}
                                </Typography>
                                {isHighestHigh && (
                                  <TrendingUp sx={{ color: '#ef4444', fontSize: 18 }} />
                                )}
                              </Stack>
                            </Stack>
                          </Box>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              background: isHighestMedium
                                ? 'rgba(245, 158, 11, 0.15)'
                                : 'rgba(245, 158, 11, 0.05)',
                              border: `1px solid ${isHighestMedium ? '#f59e0b' : 'rgba(245, 158, 11, 0.2)'}`,
                            }}
                          >
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Info sx={{ color: '#f59e0b', fontSize: 20 }} />
                                <Typography variant="body2" fontWeight={600}>
                                  Medium Risks
                                </Typography>
                              </Stack>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                  {riskData?.mediumRisks || 0}
                                </Typography>
                                {isHighestMedium && (
                                  <TrendingUp sx={{ color: '#f59e0b', fontSize: 18 }} />
                                )}
                              </Stack>
                            </Stack>
                          </Box>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              background: isHighestLow
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(16, 185, 129, 0.05)',
                              border: `1px solid ${isHighestLow ? '#10b981' : 'rgba(16, 185, 129, 0.2)'}`,
                            }}
                          >
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                                <Typography variant="body2" fontWeight={600}>
                                  Low Risks
                                </Typography>
                              </Stack>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                  {riskData?.lowRisks || 0}
                                </Typography>
                                {isHighestLow && (
                                  <TrendingUp sx={{ color: '#10b981', fontSize: 18 }} />
                                )}
                              </Stack>
                            </Stack>
                          </Box>
                        </Stack>
                      </Box>

                      <Divider sx={{ my: 3, borderColor: 'rgba(148, 163, 184, 0.1)' }} />

                      {/* Total Risk Count */}
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: 'rgba(99, 102, 241, 0.1)',
                          border: '1px solid rgba(99, 102, 241, 0.2)',
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Total Risk Flags
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#6366f1' }}>
                          {contract.riskCount}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 3, borderColor: 'rgba(148, 163, 184, 0.1)' }} />

                      {/* Key Parties */}
                      {contract.keyParties && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                            Key Parties
                          </Typography>
                          <Stack spacing={1}>
                            <Chip
                              label={contract.keyParties.party1}
                              size="small"
                              sx={{
                                background: 'rgba(99, 102, 241, 0.1)',
                                color: '#818cf8',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                              }}
                            />
                            <Chip
                              label={contract.keyParties.party2}
                              size="small"
                              sx={{
                                background: 'rgba(236, 72, 153, 0.1)',
                                color: '#f472b6',
                                border: '1px solid rgba(236, 72, 153, 0.3)',
                              }}
                            />
                          </Stack>
                        </Box>
                      )}

                      {/* Summary */}
                      {contract.summary && (
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                            Summary
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              lineHeight: 1.7,
                              display: '-webkit-box',
                              WebkitLineClamp: 4,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {contract.summary}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default CompareContractsPage;

