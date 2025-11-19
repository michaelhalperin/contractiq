import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  InputBase,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  Share,
  CheckCircle,
  Article,
  ContentCopy,
  Check,
  Edit,
  Save,
  Cancel,
  ArrowDropDown,
  CalendarToday,
  AttachMoney,
  Gavel,
  Description,
  Refresh,
  Cancel as CancelIcon,
  Copyright,
  Lock,
  Warning as WarningIcon,
  Shield,
  TrendingUp,
  Assignment,
  Schedule,
} from '@mui/icons-material';
import { Menu, MenuItem } from '@mui/material';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { contractService } from '../services/contract.service';
import { shareService } from '../services/share.service';
import { generatePDF } from '../utils/pdfGenerator';
import RiskFlags from '../components/RiskFlags';
import ContractTimeline from '../components/ContractTimeline';
import toast from 'react-hot-toast';
import { ContractDetailSkeleton } from '../components/LoadingSkeleton';
import { useAuthStore } from '../store/authStore';

const ContractDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const isSavingRef = useRef(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const { user } = useAuthStore();

  const queryClient = useQueryClient();

  const { data: contract, isLoading, error } = useQuery({
    queryKey: ['contract', id],
    queryFn: () => contractService.getContract(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (contract?.fileName) {
      setEditedName(contract.fileName);
    }
  }, [contract?.fileName]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const updateContractMutation = useMutation({
    mutationFn: (updates: { fileName: string }) => contractService.updateContract(id!, updates),
    onSuccess: (updatedContract) => {
      queryClient.setQueryData(['contract', id], updatedContract);
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setIsEditingName(false);
      isSavingRef.current = false;
      toast.success('Contract name updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update contract name');
      setEditedName(contract?.fileName || '');
      isSavingRef.current = false;
    },
  });

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', background: '#0a0a0f', position: 'relative' }}>
        <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          <ContractDetailSkeleton />
        </Container>
      </Box>
    );
  }

  if (error || !contract) {
    return (
      <Box sx={{ minHeight: '100vh', background: '#0a0a0f', position: 'relative' }}>
        <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" color="error" gutterBottom>
              Contract not found
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/dashboard')}
              sx={{ mt: 2 }}
            >
              Back to Dashboard
            </Button>
          </Card>
        </Container>
      </Box>
    );
  }

  if (contract.status !== 'completed' || !contract.analysis) {
    return (
      <Box sx={{ minHeight: '100vh', background: '#0a0a0f', position: 'relative' }}>
        <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{ mb: 3 }}
          >
            Back
          </Button>
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 3 }} size={60} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              {contract.status === 'processing' ? 'Analysis in progress...' : 'Analysis not available'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              {contract.status === 'processing'
                ? 'Your contract is being analyzed. This may take a few moments.'
                : 'The analysis for this contract is not yet complete.'}
            </Typography>
          </Card>
        </Container>
      </Box>
    );
  }

  const { analysis } = contract;

  // Get available export formats based on plan
  const getAvailableExportFormats = () => {
    if (!user) return ['pdf'];
    const plan = user.subscriptionPlan;
    if (plan === 'business' || plan === 'enterprise') {
      return ['pdf', 'word', 'excel', 'csv', 'json'];
    }
    if (plan === 'pro') {
      return ['pdf', 'word', 'excel'];
    }
    return ['pdf'];
  };

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    const formats = getAvailableExportFormats();
    if (formats.length === 1) {
      // Only PDF available, download directly
      handleExport('pdf');
    } else {
      // Show menu for multiple formats
      setExportMenuAnchor(event.currentTarget);
    }
  };

  const handleExport = async (format: 'pdf' | 'word' | 'excel' | 'csv' | 'json') => {
    if (!id) return;
    setExportMenuAnchor(null);
    
    try {
      if (format === 'pdf') {
        // Use existing PDF generator
      generatePDF(contract, analysis);
      toast.success('PDF report downloaded successfully!');
      } else {
        // Use API export
        const blob = await contractService.exportContract(id, format);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const extension = format === 'word' ? 'docx' : format === 'excel' ? 'xlsx' : format;
        a.download = `${contract.fileName.replace(/\.[^/.]+$/, '')}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success(`${format.toUpperCase()} report downloaded successfully!`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to export ${format.toUpperCase()}`);
    }
  };

  const handleShare = async () => {
    if (!id) return;
    setIsGeneratingShare(true);
    try {
      const response = await shareService.createShare(id);
      setShareUrl(response.shareUrl);
      setShareDialogOpen(true);
      toast.success('Shareable link created!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create shareable link');
    } finally {
      setIsGeneratingShare(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setIsCopying(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
      setIsCopying(false);
    }
  };

  const handleStartEdit = () => {
    setIsEditingName(true);
    setEditedName(contract?.fileName || '');
  };

  const handleSaveName = () => {
    if (!editedName.trim()) {
      toast.error('Contract name cannot be empty');
      return;
    }
    if (editedName.trim() === contract?.fileName) {
      setIsEditingName(false);
      return;
    }
    isSavingRef.current = true;
    updateContractMutation.mutate({ fileName: editedName.trim() });
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!isSavingRef.current) {
        handleSaveName();
      }
      isSavingRef.current = false;
    }, 200);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName(contract?.fileName || '');
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#0a0a0f', position: 'relative' }}>
      {/* Subtle background gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '40vh',
          background: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Sticky Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: 'rgba(10, 10, 15, 0.95)',
          backdropFilter: 'blur(30px)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 2.5,
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
              <IconButton
                onClick={() => navigate('/dashboard')}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    background: 'rgba(99, 102, 241, 0.1)',
                  },
                }}
              >
                <ArrowBack />
              </IconButton>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {isEditingName ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InputBase
                      inputRef={nameInputRef}
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={handleNameKeyDown}
                      onBlur={handleInputBlur}
                      sx={{
                        flex: 1,
                        color: 'text.primary',
                        fontWeight: 700,
                        fontSize: '1.25rem',
                        '& .MuiInputBase-input': {
                          py: 0.5,
                          px: 1.5,
                          borderRadius: 1,
                          background: 'rgba(99, 102, 241, 0.1)',
                          border: '2px solid #6366f1',
                        },
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        isSavingRef.current = true;
                        handleSaveName();
                      }}
                      disabled={updateContractMutation.isPending}
                    >
                      <Save fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        isSavingRef.current = true;
                        handleCancelEdit();
                      }}
                      disabled={updateContractMutation.isPending}
                    >
                      <Cancel fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {contract.fileName}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={handleStartEdit}
                      sx={{
                        color: 'text.secondary',
                        opacity: 0.7,
                        '&:hover': {
                          color: 'primary.main',
                          opacity: 1,
                          background: 'rgba(99, 102, 241, 0.1)',
                        },
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                  <Chip
                    icon={<CheckCircle sx={{ fontSize: 12 }} />}
                    label="Completed"
                    size="small"
                    sx={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      fontWeight: 600,
                      height: 20,
                    }}
                  />
                  <Chip
                    label={contract.fileType.toUpperCase()}
                    size="small"
                    sx={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'text.secondary',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      height: 20,
                    }}
                  />
                </Stack>
              </Box>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={handleShare}
                size="small"
                disabled={isGeneratingShare}
              >
                {isGeneratingShare ? 'Creating...' : 'Share'}
              </Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                endIcon={getAvailableExportFormats().length > 1 ? <ArrowDropDown /> : null}
                onClick={handleExportClick}
                size="small"
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
                    mt: 1,
                  },
                }}
              >
                {getAvailableExportFormats().map((format) => (
                  <MenuItem
                    key={format}
                    onClick={() => handleExport(format as 'pdf' | 'word' | 'excel' | 'csv' | 'json')}
                    sx={{
                      color: 'text.primary',
                      '&:hover': {
                        background: 'rgba(99, 102, 241, 0.1)',
                      },
                    }}
                  >
                    Export as {format.toUpperCase()}
                  </MenuItem>
                ))}
              </Menu>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 3, md: 5 } }}>
        {/* Enhanced Quick Info Bar */}
        {(analysis.keyParties || analysis.duration || analysis.paymentTerms || analysis.dates || analysis.financialDetails || analysis.contractMetadata) && (
          <Card sx={{ mb: 3, background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Grid container spacing={3}>
                {analysis.contractMetadata?.contractType && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Description sx={{ color: 'primary.main', fontSize: 20 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>
                        {analysis.contractMetadata.contractType}
                        {analysis.contractMetadata.category && (
                          <Chip
                            label={analysis.contractMetadata.category}
                            size="small"
                            sx={{
                              ml: 1.5,
                              background: 'rgba(99, 102, 241, 0.15)',
                              color: 'primary.main',
                              border: '1px solid rgba(99, 102, 241, 0.3)',
                              height: 22,
                              fontSize: '0.7rem',
                            }}
                          />
                        )}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {analysis.keyParties && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Parties
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.9375rem' }}>
                      {analysis.keyParties.party1} ↔ {analysis.keyParties.party2}
                    </Typography>
                  </Grid>
                )}
                {analysis.duration && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Duration
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.9375rem' }}>
                      {analysis.duration}
                    </Typography>
                  </Grid>
                )}
                {analysis.paymentTerms && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Payment Terms
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.9375rem' }}>
                      {analysis.paymentTerms}
                    </Typography>
                  </Grid>
                )}
                {analysis.financialDetails?.totalValue && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Total Value
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AttachMoney sx={{ fontSize: 18, color: '#10b981' }} />
                      {analysis.financialDetails.totalValue}
                      {analysis.financialDetails.currency && ` ${analysis.financialDetails.currency}`}
                    </Typography>
                  </Grid>
                )}
                {analysis.dates && (analysis.dates.startDate || analysis.dates.endDate || analysis.dates.signingDate || analysis.dates.effectiveDate) && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Key Dates
                    </Typography>
                    <Stack spacing={0.5}>
                      {analysis.dates.startDate && (
                        <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                          Start: {analysis.dates.startDate}
                        </Typography>
                      )}
                      {analysis.dates.endDate && (
                        <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                          End: {analysis.dates.endDate}
                        </Typography>
                      )}
                      {analysis.dates.signingDate && (
                        <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                          Signed: {analysis.dates.signingDate}
                        </Typography>
                      )}
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )}

        <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
          {/* Left: Summary & Obligations */}
          <Grid item xs={12} lg={7} sx={{ display: 'flex' }}>
            <Stack spacing={3} sx={{ width: '100%' }}>
              {/* Summary Card */}
              <Card sx={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                    Summary
                  </Typography>
                  <Box
                    sx={{
                      '& p': {
                        margin: 0,
                        marginBottom: 1.5,
                        lineHeight: 1.8,
                        color: 'text.primary',
                        fontSize: '0.9375rem',
                      },
                      '& p:last-child': {
                        marginBottom: 0,
                      },
                      '& ul, & ol': {
                        margin: 0,
                        marginBottom: 1.5,
                        paddingLeft: 2.5,
                        color: 'text.primary',
                      },
                      '& li': {
                        marginBottom: 0.75,
                        lineHeight: 1.8,
                        fontSize: '0.9375rem',
                      },
                      '& strong, & b': {
                        fontWeight: 700,
                        color: 'text.primary',
                      },
                      '& code': {
                        background: 'rgba(99, 102, 241, 0.15)',
                        padding: '0.125rem 0.375rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.875em',
                        fontFamily: 'monospace',
                        color: '#818cf8',
                      },
                      '& pre': {
                        background: 'rgba(15, 23, 42, 0.8)',
                        padding: 1.5,
                        borderRadius: 1,
                        overflow: 'auto',
                        marginBottom: 1.5,
                        border: '1px solid rgba(148, 163, 184, 0.1)',
                      },
                      '& a': {
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      },
                    }}
                  >
                    <ReactMarkdown>{analysis.summary}</ReactMarkdown>
                  </Box>
                </CardContent>
              </Card>

              {/* Key Obligations */}
              {analysis.obligations && analysis.obligations.length > 0 && (
                <Card sx={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                      Key Obligations
                    </Typography>
                    <Stack spacing={2}>
                      {analysis.obligations.map((obligation, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            gap: 2,
                            alignItems: 'flex-start',
                            p: 2,
                            borderRadius: 2,
                            background: 'rgba(99, 102, 241, 0.05)',
                            border: '1px solid rgba(99, 102, 241, 0.1)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              background: 'rgba(99, 102, 241, 0.1)',
                              borderColor: 'rgba(99, 102, 241, 0.2)',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              mt: 0.25,
                              fontWeight: 700,
                              color: '#fff',
                              fontSize: '0.75rem',
                            }}
                          >
                            {index + 1}
                          </Box>
                          <Typography variant="body1" sx={{ lineHeight: 1.7, flex: 1, fontSize: '0.9375rem' }}>
                            {obligation}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Data Sections */}
              
              {/* Dates Section */}
              {analysis.dates && (analysis.dates.startDate || analysis.dates.endDate || analysis.dates.signingDate || analysis.dates.effectiveDate) && (
                <Card sx={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CalendarToday sx={{ color: '#fff', fontSize: 20 }} />
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                        Important Dates
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {analysis.dates.startDate && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 600 }}>
                            Start Date
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {analysis.dates.startDate}
                          </Typography>
                        </Grid>
                      )}
                      {analysis.dates.endDate && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 600 }}>
                            End Date
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {analysis.dates.endDate}
                          </Typography>
                        </Grid>
                      )}
                      {analysis.dates.signingDate && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 600 }}>
                            Signing Date
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {analysis.dates.signingDate}
                          </Typography>
                        </Grid>
                      )}
                      {analysis.dates.effectiveDate && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 600 }}>
                            Effective Date
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {analysis.dates.effectiveDate}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Financial Details */}
              {analysis.financialDetails && (
                <Card sx={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AttachMoney sx={{ color: '#fff', fontSize: 20 }} />
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                        Financial Details
                      </Typography>
                    </Box>
                    <Stack spacing={2}>
                      {analysis.financialDetails.totalValue && (
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 600 }}>
                            Total Contract Value
                        </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>
                            {analysis.financialDetails.totalValue}
                            {analysis.financialDetails.currency && ` ${analysis.financialDetails.currency}`}
                        </Typography>
                      </Box>
                    )}
                      {analysis.financialDetails.paymentAmounts && analysis.financialDetails.paymentAmounts.length > 0 && (
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5, fontWeight: 600 }}>
                            Payment Schedule
                          </Typography>
                          <Stack spacing={1.5}>
                            {analysis.financialDetails.paymentAmounts.map((payment, index) => (
                              <Box
                                key={index}
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  background: 'rgba(16, 185, 129, 0.1)',
                                  border: '1px solid rgba(16, 185, 129, 0.2)',
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {payment.amount} {analysis.financialDetails?.currency || ''}
                                  </Typography>
                                  <Chip
                                    label={payment.schedule}
                                    size="small"
                                    sx={{
                                      background: 'rgba(16, 185, 129, 0.2)',
                                      color: '#10b981',
                                      fontWeight: 600,
                                    }}
                                  />
                                </Box>
                                {payment.dueDate && (
                                  <Typography variant="caption" color="text.secondary">
                                    Due: {payment.dueDate}
                                  </Typography>
                                )}
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Legal Information */}
              {analysis.legalInfo && (analysis.legalInfo.governingLaw || analysis.legalInfo.jurisdiction || analysis.legalInfo.disputeResolution || analysis.legalInfo.venue) && (
                <Card sx={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Gavel sx={{ color: '#fff', fontSize: 20 }} />
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                        Legal Information
                      </Typography>
                    </Box>
                    <Stack spacing={2}>
                      {analysis.legalInfo.governingLaw && (
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 600 }}>
                            Governing Law
                        </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {analysis.legalInfo.governingLaw}
                          </Typography>
                      </Box>
                    )}
                      {analysis.legalInfo.jurisdiction && (
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 600 }}>
                            Jurisdiction
                        </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {analysis.legalInfo.jurisdiction}
                          </Typography>
                        </Box>
                      )}
                      {analysis.legalInfo.disputeResolution && (
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 600 }}>
                            Dispute Resolution
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {analysis.legalInfo.disputeResolution}
                          </Typography>
                        </Box>
                      )}
                      {analysis.legalInfo.venue && (
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 600 }}>
                            Venue
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {analysis.legalInfo.venue}
                          </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
              )}

              {/* Signatories */}
              {analysis.contractMetadata?.signatories && analysis.contractMetadata.signatories.length > 0 && (
                <Card sx={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CheckCircle sx={{ color: '#fff', fontSize: 20 }} />
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                        Signatories
                    </Typography>
                    </Box>
                    <Stack spacing={2}>
                      {analysis.contractMetadata.signatories.map((signatory, index) => (
                        <Box
                          key={index}
                            sx={{
                            p: 2,
                            borderRadius: 2,
                            background: 'rgba(236, 72, 153, 0.1)',
                            border: '1px solid rgba(236, 72, 153, 0.2)',
                          }}
                        >
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {signatory.name}
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                            {signatory.title && (
                              <Chip
                                label={signatory.title}
                                size="small"
                                sx={{
                                  background: 'rgba(236, 72, 153, 0.15)',
                                  color: '#ec4899',
                                  height: 22,
                                  fontSize: '0.7rem',
                                }}
                              />
                            )}
                            {signatory.role && (
                              <Chip
                                label={signatory.role}
                                size="small"
                                sx={{
                                  background: 'rgba(236, 72, 153, 0.15)',
                                  color: '#ec4899',
                                  height: 22,
                                  fontSize: '0.7rem',
                                }}
                              />
                            )}
                            <Chip
                              label={signatory.party === 'party1' ? analysis.keyParties.party1 : analysis.keyParties.party2}
                              size="small"
                              sx={{
                                background: 'rgba(99, 102, 241, 0.15)',
                                color: 'primary.main',
                                height: 22,
                                fontSize: '0.7rem',
                              }}
                            />
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Structured Terms */}
              {analysis.structuredTerms && (
                <Card sx={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                      Structured Terms
                    </Typography>
                    <Stack spacing={3}>
                      {/* Renewal Terms */}
                      {analysis.structuredTerms.renewal && (
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Refresh sx={{ color: 'primary.main', fontSize: 20 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                              Renewal Terms
                          </Typography>
                        </Box>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              background: 'rgba(99, 102, 241, 0.05)',
                              border: '1px solid rgba(99, 102, 241, 0.1)',
                            }}
                          >
                            <Stack spacing={1.5}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 120 }}>
                                  Auto-Renewal:
                                </Typography>
                                <Chip
                                  label={analysis.structuredTerms.renewal.autoRenewal ? 'Yes' : 'No'}
                                  size="small"
                                  sx={{
                                    background: analysis.structuredTerms.renewal.autoRenewal
                                      ? 'rgba(239, 68, 68, 0.15)'
                                      : 'rgba(16, 185, 129, 0.15)',
                                    color: analysis.structuredTerms.renewal.autoRenewal ? '#ef4444' : '#10b981',
                                    fontWeight: 600,
                                  }}
                                />
                              </Box>
                              {analysis.structuredTerms.renewal.noticePeriod && (
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Notice Period:
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {analysis.structuredTerms.renewal.noticePeriod}
                                  </Typography>
                                </Box>
                              )}
                              {analysis.structuredTerms.renewal.renewalTerm && (
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Renewal Term:
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {analysis.structuredTerms.renewal.renewalTerm}
                                  </Typography>
                                </Box>
                              )}
                              {analysis.structuredTerms.renewal.conditions && (
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Conditions:
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {analysis.structuredTerms.renewal.conditions}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          </Box>
                        </Box>
                      )}

                      {/* Termination Terms */}
                      {analysis.structuredTerms.termination && (
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <CancelIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                              Termination Terms
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              background: 'rgba(239, 68, 68, 0.05)',
                              border: '1px solid rgba(239, 68, 68, 0.1)',
                            }}
                          >
                            <Stack spacing={1.5}>
                              {analysis.structuredTerms.termination.noticePeriod && (
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Notice Period:
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {analysis.structuredTerms.termination.noticePeriod}
                                  </Typography>
                                </Box>
                              )}
                              {analysis.structuredTerms.termination.terminationFees && (
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Termination Fees:
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {analysis.structuredTerms.termination.terminationFees}
                                  </Typography>
                                </Box>
                              )}
                              {analysis.structuredTerms.termination.conditions && analysis.structuredTerms.termination.conditions.length > 0 && (
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Conditions:
                                  </Typography>
                                  <Stack spacing={0.5}>
                                    {analysis.structuredTerms.termination.conditions.map((condition, idx) => (
                                      <Typography key={idx} variant="body2" color="text.secondary" sx={{ pl: 1.5, position: 'relative', '&::before': { content: '"•"', position: 'absolute', left: 0 } }}>
                                        {condition}
                                      </Typography>
                                    ))}
                                  </Stack>
                                </Box>
                              )}
                            </Stack>
                          </Box>
                        </Box>
                      )}

                      {/* Intellectual Property */}
                      {analysis.structuredTerms.intellectualProperty && (
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Copyright sx={{ color: '#8b5cf6', fontSize: 20 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                              Intellectual Property
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              background: 'rgba(139, 92, 246, 0.05)',
                              border: '1px solid rgba(139, 92, 246, 0.1)',
                            }}
                          >
                            <Stack spacing={1.5}>
                              {analysis.structuredTerms.intellectualProperty.ownership && (
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Ownership:
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {analysis.structuredTerms.intellectualProperty.ownership}
                                  </Typography>
                                </Box>
                              )}
                              {analysis.structuredTerms.intellectualProperty.licensing && (
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Licensing:
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {analysis.structuredTerms.intellectualProperty.licensing}
                                  </Typography>
                                </Box>
                              )}
                              {analysis.structuredTerms.intellectualProperty.restrictions && (
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Restrictions:
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {analysis.structuredTerms.intellectualProperty.restrictions}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          </Box>
                        </Box>
                      )}

                      {/* Confidentiality */}
                      {analysis.structuredTerms.confidentiality && (
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Lock sx={{ color: '#f59e0b', fontSize: 20 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                              Confidentiality
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              background: 'rgba(245, 158, 11, 0.05)',
                              border: '1px solid rgba(245, 158, 11, 0.1)',
                            }}
                          >
                            <Stack spacing={1.5}>
                              {analysis.structuredTerms.confidentiality.scope && (
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Scope:
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {analysis.structuredTerms.confidentiality.scope}
                                  </Typography>
                                </Box>
                              )}
                              {analysis.structuredTerms.confidentiality.duration && (
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Duration:
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {analysis.structuredTerms.confidentiality.duration}
                                  </Typography>
                                </Box>
                              )}
                              {analysis.structuredTerms.confidentiality.exceptions && analysis.structuredTerms.confidentiality.exceptions.length > 0 && (
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Exceptions:
                                  </Typography>
                                  <Stack spacing={0.5}>
                                    {analysis.structuredTerms.confidentiality.exceptions.map((exception, idx) => (
                                      <Typography key={idx} variant="body2" color="text.secondary" sx={{ pl: 1.5, position: 'relative', '&::before': { content: '"•"', position: 'absolute', left: 0 } }}>
                                        {exception}
                                      </Typography>
                                    ))}
                                  </Stack>
                                </Box>
                              )}
                            </Stack>
                          </Box>
                        </Box>
                      )}

                      {/* Force Majeure */}
                      {analysis.structuredTerms.forceMajeure && (
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <WarningIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                              Force Majeure
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              background: 'rgba(245, 158, 11, 0.05)',
                              border: '1px solid rgba(245, 158, 11, 0.1)',
                            }}
                          >
                            <Stack spacing={1.5}>
                              {analysis.structuredTerms.forceMajeure.definition && (
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Definition:
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {analysis.structuredTerms.forceMajeure.definition}
                                  </Typography>
                                </Box>
                              )}
                              {analysis.structuredTerms.forceMajeure.consequences && (
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Consequences:
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {analysis.structuredTerms.forceMajeure.consequences}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          </Box>
                        </Box>
                      )}

                      {/* Insurance */}
                      {analysis.structuredTerms.insurance && (
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Shield sx={{ color: '#10b981', fontSize: 20 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                              Insurance Requirements
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              background: 'rgba(16, 185, 129, 0.05)',
                              border: '1px solid rgba(16, 185, 129, 0.1)',
                            }}
                          >
                            <Stack spacing={1.5}>
                              {analysis.structuredTerms.insurance.requirements && analysis.structuredTerms.insurance.requirements.length > 0 && (
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Required Types:
                                  </Typography>
                                  <Stack spacing={0.5}>
                                    {analysis.structuredTerms.insurance.requirements.map((req, idx) => (
                                      <Typography key={idx} variant="body2" color="text.secondary" sx={{ pl: 1.5, position: 'relative', '&::before': { content: '"•"', position: 'absolute', left: 0 } }}>
                                        {req}
                                      </Typography>
                                    ))}
                                  </Stack>
                                </Box>
                              )}
                              {analysis.structuredTerms.insurance.minimumCoverage && (
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Minimum Coverage:
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {analysis.structuredTerms.insurance.minimumCoverage}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          </Box>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Performance Metrics */}
              {analysis.performanceMetrics && (
                <Card sx={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <TrendingUp sx={{ color: '#fff', fontSize: 20 }} />
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                        Performance Metrics
                  </Typography>
                    </Box>
                    <Stack spacing={3}>
                      {analysis.performanceMetrics.slas && analysis.performanceMetrics.slas.length > 0 && (
                    <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <Schedule sx={{ color: 'primary.main', fontSize: 18 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                              Service Level Agreements (SLAs)
                      </Typography>
                          </Box>
                          <Stack spacing={1}>
                            {analysis.performanceMetrics.slas.map((sla, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  p: 1.5,
                                  borderRadius: 1.5,
                                  background: 'rgba(99, 102, 241, 0.05)',
                                  border: '1px solid rgba(99, 102, 241, 0.1)',
                                }}
                              >
                                <Typography variant="body2" color="text.primary">
                                  {sla}
                      </Typography>
                    </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}
                      {analysis.performanceMetrics.kpis && analysis.performanceMetrics.kpis.length > 0 && (
                    <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <TrendingUp sx={{ color: '#10b981', fontSize: 18 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                              Key Performance Indicators (KPIs)
                      </Typography>
                          </Box>
                          <Stack spacing={1}>
                            {analysis.performanceMetrics.kpis.map((kpi, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  p: 1.5,
                                  borderRadius: 1.5,
                                  background: 'rgba(16, 185, 129, 0.05)',
                                  border: '1px solid rgba(16, 185, 129, 0.1)',
                                }}
                              >
                                <Typography variant="body2" color="text.primary">
                                  {kpi}
                        </Typography>
                      </Box>
                            ))}
                          </Stack>
                    </Box>
                      )}
                      {analysis.performanceMetrics.deliverables && analysis.performanceMetrics.deliverables.length > 0 && (
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <Assignment sx={{ color: '#8b5cf6', fontSize: 18 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                              Deliverables
                            </Typography>
                          </Box>
                          <Stack spacing={1}>
                            {analysis.performanceMetrics.deliverables.map((deliverable, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  p: 1.5,
                                  borderRadius: 1.5,
                                  background: 'rgba(139, 92, 246, 0.05)',
                                  border: '1px solid rgba(139, 92, 246, 0.1)',
                                }}
                              >
                                <Typography variant="body2" color="text.primary">
                                  {deliverable}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}
                      {analysis.performanceMetrics.milestones && analysis.performanceMetrics.milestones.length > 0 && (
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <CalendarToday sx={{ color: '#f59e0b', fontSize: 18 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                              Milestones
                            </Typography>
                          </Box>
                          <Stack spacing={1.5}>
                            {analysis.performanceMetrics.milestones.map((milestone, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  p: 2,
                                  borderRadius: 1.5,
                                  background: 'rgba(245, 158, 11, 0.05)',
                                  border: '1px solid rgba(245, 158, 11, 0.1)',
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {milestone.name}
                                  </Typography>
                                  {milestone.date && (
                                    <Chip
                                      label={milestone.date}
                                      size="small"
                                      sx={{
                                        background: 'rgba(245, 158, 11, 0.15)',
                                        color: '#f59e0b',
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                      }}
                                    />
                                  )}
                                </Box>
                                {milestone.description && (
                                  <Typography variant="body2" color="text.secondary">
                                    {milestone.description}
                                  </Typography>
                                )}
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}
                  </Stack>
                </CardContent>
              </Card>
              )}
            </Stack>
          </Grid>

          {/* Right: Risk Flags & Clauses */}
          <Grid item xs={12} lg={5} sx={{ display: 'flex' }}>
            <Card
              sx={{
                position: { lg: 'sticky' },
                top: { lg: 100 },
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxHeight: { xs: '70vh', lg: 'calc(100vh - 100px)' },
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                  px: { xs: 2, md: 3 },
                  flexShrink: 0,
                }}
              >
                <Tabs
                  value={activeTab}
                  onChange={(_, newValue) => setActiveTab(newValue)}
                  sx={{
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      minHeight: 56,
                    },
                  }}
                >
                  <Tab
                    icon={<Article sx={{ fontSize: 18 }} />}
                    iconPosition="start"
                    label={`Risk Flags (${analysis.riskFlags.length})`}
                    sx={{ gap: 1 }}
                  />
                  {analysis.clauseExplanations && analysis.clauseExplanations.length > 0 && (
                    <Tab
                      icon={<Article sx={{ fontSize: 18 }} />}
                      iconPosition="start"
                      label={`Clauses (${analysis.clauseExplanations.length})`}
                      sx={{ gap: 1 }}
                    />
                  )}
                </Tabs>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  minHeight: 0,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(148, 163, 184, 0.05)',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(148, 163, 184, 0.2)',
                    borderRadius: '4px',
                    '&:hover': {
                      background: 'rgba(148, 163, 184, 0.3)',
                    },
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 3 } }}>
                {activeTab === 0 && <RiskFlags risks={analysis.riskFlags} />}
                {activeTab === 1 && analysis.clauseExplanations && (
                  <ContractTimeline clauses={analysis.clauseExplanations} />
                )}
              </CardContent>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Share Dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share Contract Analysis</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Share this link with others to view the contract analysis. The link will remain active until you delete it.
          </Typography>
          <TextField
            fullWidth
            value={shareUrl}
            variant="outlined"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleCopyLink}
                    edge="end"
                    sx={{
                      color: isCopying ? 'success.main' : 'text.secondary',
                    }}
                  >
                    {isCopying ? <Check /> : <ContentCopy />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<ContentCopy />}
            onClick={handleCopyLink}
          >
            {isCopying ? 'Copied!' : 'Copy Link'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractDetailPage;
