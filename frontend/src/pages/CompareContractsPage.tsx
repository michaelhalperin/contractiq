import { useEffect, useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Menu,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ArrowBack,
  Description,
  Warning,
  CheckCircle,
  Info,
  TrendingUp,
  Download,
  ExpandMore,
  CalendarToday,
  AttachMoney,
  Gavel,
  Business,
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
    duration?: string;
    paymentTerms?: string;
    obligations?: string[];
    dates?: {
      startDate?: string;
      endDate?: string;
      signingDate?: string;
      effectiveDate?: string;
    };
    financialDetails?: {
      totalValue?: string;
      currency?: string;
      paymentAmounts?: Array<{
        amount: string;
        schedule: string;
        dueDate?: string;
      }>;
    };
    legalInfo?: {
      governingLaw?: string;
      jurisdiction?: string;
      disputeResolution?: string;
      venue?: string;
    };
    contractMetadata?: {
      contractType?: string;
      category?: string;
      signatories?: Array<{
        name: string;
        title?: string;
        role?: string;
        party: string;
      }>;
    };
    structuredTerms?: {
      renewal?: {
        autoRenewal: boolean;
        noticePeriod?: string;
        renewalTerm?: string;
        conditions?: string;
      };
      termination?: {
        noticePeriod?: string;
        terminationFees?: string;
        conditions?: string[];
      };
      intellectualProperty?: {
        ownership?: string;
        licensing?: string;
        restrictions?: string;
      };
      confidentiality?: {
        scope?: string;
        duration?: string;
        exceptions?: string[];
      };
    };
    riskFlags?: Array<{
      id: string;
      type: string;
      severity: 'high' | 'medium' | 'low';
      title: string;
      description: string;
    }>;
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
  insights?: {
    financialComparison?: Array<{
      contractId: string;
      fileName: string;
      totalValue?: string;
      currency?: string;
      paymentAmounts?: Array<{
        amount: string;
        schedule: string;
        dueDate?: string;
      }>;
    }>;
    dateComparison?: Array<{
      contractId: string;
      fileName: string;
      startDate?: string;
      endDate?: string;
      duration?: string;
    }>;
    legalComparison?: Array<{
      contractId: string;
      fileName: string;
      governingLaw?: string;
      jurisdiction?: string;
      disputeResolution?: string;
    }>;
    termsComparison?: Array<{
      contractId: string;
      fileName: string;
      renewal?: any;
      termination?: any;
      intellectualProperty?: any;
      confidentiality?: any;
    }>;
  };
}

const CompareContractsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contractIds = searchParams.get('ids')?.split(',').filter(Boolean) || [];
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

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

  const handleExport = (format: 'pdf' | 'csv' | 'json') => {
    if (!comparison) return;

    try {
      if (format === 'json') {
        const jsonData = JSON.stringify(comparison, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contract-comparison-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Comparison exported as JSON');
      } else if (format === 'csv') {
        // Create CSV with comparison data
        const rows: string[] = [];
        
        // Header
        rows.push('Contract,FileName,High Risks,Medium Risks,Low Risks,Total Risks,Total Value,Currency,Start Date,End Date,Duration,Governing Law');
        
        // Data rows
        comparison.contracts.forEach(contract => {
          const riskData = comparison.differences.riskLevels.find(r => r.contractId === contract.id);
          const financial = contract.financialDetails;
          const dates = contract.dates;
          const legal = contract.legalInfo;
          
          rows.push([
            contract.id,
            `"${contract.fileName}"`,
            riskData?.highRisks || 0,
            riskData?.mediumRisks || 0,
            riskData?.lowRisks || 0,
            contract.riskCount,
            financial?.totalValue || 'N/A',
            financial?.currency || 'N/A',
            dates?.startDate || 'N/A',
            dates?.endDate || 'N/A',
            contract.duration || 'N/A',
            legal?.governingLaw || 'N/A',
          ].join(','));
        });
        
        const csvContent = rows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contract-comparison-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Comparison exported as CSV');
      } else if (format === 'pdf') {
        // For PDF, we'll create a simple HTML table and use browser print
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Contract Comparison</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; }
                  h1 { color: #333; }
                  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                  th { background-color: #6366f1; color: white; }
                  tr:nth-child(even) { background-color: #f2f2f2; }
                </style>
              </head>
              <body>
                <h1>Contract Comparison Report</h1>
                <p>Generated: ${new Date().toLocaleString()}</p>
                <table>
                  <thead>
                    <tr>
                      <th>Contract</th>
                      <th>High Risks</th>
                      <th>Medium Risks</th>
                      <th>Low Risks</th>
                      <th>Total Risks</th>
                      <th>Total Value</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${comparison.contracts.map(contract => {
                      const riskData = comparison.differences.riskLevels.find(r => r.contractId === contract.id);
                      return `
                        <tr>
                          <td>${contract.fileName}</td>
                          <td>${riskData?.highRisks || 0}</td>
                          <td>${riskData?.mediumRisks || 0}</td>
                          <td>${riskData?.lowRisks || 0}</td>
                          <td>${contract.riskCount}</td>
                          <td>${contract.financialDetails?.totalValue || 'N/A'}</td>
                          <td>${contract.dates?.startDate || 'N/A'}</td>
                          <td>${contract.dates?.endDate || 'N/A'}</td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </body>
            </html>
          `);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.print();
          }, 250);
          toast.success('Opening PDF print dialog');
        }
      }
    } catch (error) {
      toast.error('Failed to export comparison');
    }
    
    setExportMenuAnchor(null);
  };

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
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
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
          <Button
            startIcon={<Download />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            variant="outlined"
            sx={{
              borderColor: 'rgba(148, 163, 184, 0.3)',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'primary.main',
                color: 'primary.main',
                background: 'rgba(99, 102, 241, 0.1)',
              },
            }}
          >
            Export
          </Button>
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={() => setExportMenuAnchor(null)}
            PaperProps={{
              sx: {
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
              },
            }}
          >
            <MenuItem onClick={() => handleExport('pdf')}>Export as PDF</MenuItem>
            <MenuItem onClick={() => handleExport('csv')}>Export as CSV</MenuItem>
            <MenuItem onClick={() => handleExport('json')}>Export as JSON</MenuItem>
          </Menu>
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

        {/* Detailed Comparison Tables */}
        <Stack spacing={3} sx={{ mb: 4 }}>
          {/* Financial Comparison */}
          {comparison.insights?.financialComparison && comparison.insights.financialComparison.some(f => f.totalValue) && (
            <Accordion
              defaultExpanded
              sx={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                backdropFilter: 'blur(20px)',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'primary.main' }} />}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <AttachMoney sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Financial Comparison
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>Contract</TableCell>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>Total Value</TableCell>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>Currency</TableCell>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>Payment Schedule</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {comparison.insights.financialComparison.map((financial, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ color: 'text.primary' }}>{financial.fileName}</TableCell>
                          <TableCell sx={{ color: 'text.primary' }}>{financial.totalValue || 'N/A'}</TableCell>
                          <TableCell sx={{ color: 'text.primary' }}>{financial.currency || 'N/A'}</TableCell>
                          <TableCell sx={{ color: 'text.primary' }}>
                            {financial.paymentAmounts && financial.paymentAmounts.length > 0
                              ? financial.paymentAmounts.map(p => `${p.amount} (${p.schedule})`).join(', ')
                              : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Date Comparison */}
          {comparison.insights?.dateComparison && comparison.insights.dateComparison.some(d => d.startDate || d.endDate) && (
            <Accordion
              defaultExpanded
              sx={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                backdropFilter: 'blur(20px)',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'primary.main' }} />}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <CalendarToday sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Date & Duration Comparison
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>Contract</TableCell>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>Start Date</TableCell>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>End Date</TableCell>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>Duration</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {comparison.insights.dateComparison.map((date, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ color: 'text.primary' }}>{date.fileName}</TableCell>
                          <TableCell sx={{ color: 'text.primary' }}>{date.startDate || 'N/A'}</TableCell>
                          <TableCell sx={{ color: 'text.primary' }}>{date.endDate || 'N/A'}</TableCell>
                          <TableCell sx={{ color: 'text.primary' }}>{date.duration || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Legal Comparison */}
          {comparison.insights?.legalComparison && comparison.insights.legalComparison.some(l => l.governingLaw || l.jurisdiction) && (
            <Accordion
              sx={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                backdropFilter: 'blur(20px)',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'primary.main' }} />}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Gavel sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Legal Information Comparison
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>Contract</TableCell>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>Governing Law</TableCell>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>Jurisdiction</TableCell>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>Dispute Resolution</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {comparison.insights.legalComparison.map((legal, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ color: 'text.primary' }}>{legal.fileName}</TableCell>
                          <TableCell sx={{ color: 'text.primary' }}>{legal.governingLaw || 'N/A'}</TableCell>
                          <TableCell sx={{ color: 'text.primary' }}>{legal.jurisdiction || 'N/A'}</TableCell>
                          <TableCell sx={{ color: 'text.primary' }}>{legal.disputeResolution || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Terms Comparison */}
          {comparison.insights?.termsComparison && (
            <Accordion
              sx={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                backdropFilter: 'blur(20px)',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'primary.main' }} />}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Business sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Terms & Conditions Comparison
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {comparison.insights.termsComparison.map((terms, idx) => (
                    <Grid item xs={12} md={6} key={idx}>
                      <Card
                        sx={{
                          background: 'rgba(15, 23, 42, 0.4)',
                          border: '1px solid rgba(148, 163, 184, 0.1)',
                          p: 2,
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                          {terms.fileName}
                        </Typography>
                        <Stack spacing={1.5}>
                          {terms.renewal && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                Renewal:
                              </Typography>
                              <Typography variant="body2" color="text.primary">
                                Auto-renewal: {terms.renewal.autoRenewal ? 'Yes' : 'No'}
                                {terms.renewal.noticePeriod && ` | Notice: ${terms.renewal.noticePeriod}`}
                                {terms.renewal.renewalTerm && ` | Term: ${terms.renewal.renewalTerm}`}
                              </Typography>
                            </Box>
                          )}
                          {terms.termination && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                Termination:
                              </Typography>
                              <Typography variant="body2" color="text.primary">
                                {terms.termination.noticePeriod && `Notice: ${terms.termination.noticePeriod}`}
                                {terms.termination.terminationFees && ` | Fees: ${terms.termination.terminationFees}`}
                              </Typography>
                            </Box>
                          )}
                          {terms.intellectualProperty && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                IP Ownership:
                              </Typography>
                              <Typography variant="body2" color="text.primary">
                                {terms.intellectualProperty.ownership || 'N/A'}
                              </Typography>
                            </Box>
                          )}
                          {terms.confidentiality && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                Confidentiality:
                              </Typography>
                              <Typography variant="body2" color="text.primary">
                                {terms.confidentiality.duration || 'N/A'}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}
        </Stack>

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
                          mb: 3,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Total Risk Flags
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#6366f1' }}>
                          {contract.riskCount}
                        </Typography>
                      </Box>

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
