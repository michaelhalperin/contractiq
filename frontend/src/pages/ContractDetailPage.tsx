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
} from '@mui/icons-material';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { contractService } from '../services/contract.service';
import { shareService } from '../services/share.service';
import { generatePDF } from '../utils/pdfGenerator';
import RiskFlags from '../components/RiskFlags';
import ContractTimeline from '../components/ContractTimeline';
import toast from 'react-hot-toast';

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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#0a0a0f',
        }}
      >
        <CircularProgress />
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

  const handleDownload = () => {
    try {
      generatePDF(contract, analysis);
      toast.success('PDF report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF report');
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
                onClick={handleDownload}
                size="small"
              >
                Download
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 3, md: 5 } }}>
        {/* Quick Info Bar - At the top for easy scanning */}
        {(analysis.keyParties || analysis.duration || analysis.paymentTerms) && (
          <Card sx={{ mb: 3, background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Grid container spacing={3}>
                {analysis.keyParties && (
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Parties
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.9375rem' }}>
                      {analysis.keyParties.party1} ↔ {analysis.keyParties.party2}
                    </Typography>
                  </Grid>
                )}
                {analysis.duration && (
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Duration
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.9375rem' }}>
                      {analysis.duration}
                    </Typography>
                  </Grid>
                )}
                {analysis.paymentTerms && (
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Payment Terms
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.9375rem' }}>
                      {analysis.paymentTerms}
                    </Typography>
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
