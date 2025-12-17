import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  InputBase,
  Paper,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  LinearProgress,
  Stack,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Checkbox,
} from "@mui/material";
import {
  Upload,
  Description,
  Logout,
  Search,
  AccountCircle,
  Close,
  Sort,
  CheckCircle,
  HourglassEmpty,
  Error as ErrorIcon,
  MoreVert,
  Visibility,
  Delete,
  Add,
  CompareArrows,
  CreditCard,
  Star,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { contractService } from "../services/contract.service";
import { useQuery } from "@tanstack/react-query";
import UploadZone from "../components/UploadZone";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import { LanguageSelector } from "../components/LanguageSelector";
import { useTranslation } from "../utils/i18n";
import toast from "react-hot-toast";
import { DashboardSkeleton } from "../components/LoadingSkeleton";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const t = useTranslation();
  const [showUpload, setShowUpload] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "status">("date");
  const [contractMenuAnchor, setContractMenuAnchor] = useState<{
    el: HTMLElement;
    id: string;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [viewMode, setViewMode] = useState<"all" | "completed" | "processing" | "analytics">(
    "all"
  );
  const lastScrollY = useRef(0);
  const [bulkUploadFiles, setBulkUploadFiles] = useState<File[]>([]);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [selectedContracts, setSelectedContracts] = useState<Set<string>>(new Set());
  
  // Check if user has comparison feature (Pro+)
  const hasComparison = user?.subscriptionPlan === 'pro' || 
                        user?.subscriptionPlan === 'business' || 
                        user?.subscriptionPlan === 'enterprise';

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[placeholder*="Search"]'
        ) as HTMLInputElement;
        searchInput?.focus();
      }
      if (e.key === "Escape") {
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Hide/show header on scroll
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
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleContractMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    contractId: string
  ) => {
    event.stopPropagation();
    setContractMenuAnchor({ el: event.currentTarget, id: contractId });
  };

  const handleContractMenuClose = () => {
    setContractMenuAnchor(null);
  };

  const {
    data: contracts,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["contracts"],
    queryFn: contractService.getContracts,
  });

  // Analytics query (Business+ only)
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ["analytics"],
    queryFn: contractService.getAnalytics,
    enabled: (user?.subscriptionPlan === 'business' || user?.subscriptionPlan === 'enterprise') && viewMode === 'analytics',
  });

  // Poll for processing contracts
  useEffect(() => {
    if (!contracts || !Array.isArray(contracts)) return;
    const hasProcessing = contracts.some((c) => c.status === "processing");
    if (!hasProcessing) return;
    const interval = setInterval(() => {
      refetch().catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [contracts, refetch]);

  const handleUploadComplete = (_contractId?: string) => {
    setShowUpload(false);
    setViewMode("all");
    refetch();
    toast.success("Contract uploaded! Analysis in progress...");
  };

  const handleDeleteClick = (contractId: string) => {
    setContractToDelete(contractId);
    setDeleteDialogOpen(true);
    handleContractMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!contractToDelete) return;
    setIsDeleting(true);
    try {
      await contractService.deleteContract(contractToDelete);
      toast.success("Contract deleted");
      refetch();
      setDeleteDialogOpen(false);
      setContractToDelete(null);
    } catch (error) {
      toast.error("Failed to delete contract");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return {
          color: "#10b981",
          bg: "rgba(16, 185, 129, 0.15)",
          icon: <CheckCircle />,
        };
      case "processing":
        return {
          color: "#f59e0b",
          bg: "rgba(245, 158, 11, 0.15)",
          icon: <HourglassEmpty />,
        };
      case "failed":
        return {
          color: "#ef4444",
          bg: "rgba(239, 68, 68, 0.15)",
          icon: <ErrorIcon />,
        };
      default:
        return { color: "#94a3b8", bg: "rgba(148, 163, 184, 0.1)", icon: null };
    }
  };

  // Handle bulk upload
  const handleBulkUpload = async () => {
    if (bulkUploadFiles.length === 0) return;
    
    if (!user || (user.subscriptionPlan !== 'business' && user.subscriptionPlan !== 'enterprise')) {
      toast.error('Bulk upload is only available for Business and Enterprise plans');
      return;
    }

    setIsBulkUploading(true);
    try {
      const response = await contractService.bulkUpload(bulkUploadFiles);
      toast.success(`Uploaded ${response.results.filter((r: any) => r.status === 'processing').length} contracts successfully`);
      setBulkUploadFiles([]);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload contracts');
    } finally {
      setIsBulkUploading(false);
    }
  };

  // Handle contract selection
  const handleContractSelect = (contractId: string, event: React.ChangeEvent<HTMLInputElement> | React.MouseEvent) => {
    event.stopPropagation();
    const newSelected = new Set(selectedContracts);
    if (newSelected.has(contractId)) {
      newSelected.delete(contractId);
    } else {
      newSelected.add(contractId);
    }
    setSelectedContracts(newSelected);
  };

  // Handle compare
  const handleCompare = () => {
    if (selectedContracts.size < 2) {
      toast.error('Please select at least 2 contracts to compare');
      return;
    }
    const ids = Array.from(selectedContracts).join(',');
    navigate(`/compare?ids=${ids}`);
  };

  // Clear selection when view mode changes
  useEffect(() => {
    setSelectedContracts(new Set());
  }, [viewMode]);

  // Filter and sort contracts
  let filteredContracts =
    contracts?.filter((contract) => {
      const matchesSearch = contract.fileName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesView = viewMode === "all" || contract.status === viewMode;
    return matchesSearch && matchesView;
  }) || [];

  filteredContracts = [...filteredContracts].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.fileName.localeCompare(b.fileName);
      case "status":
        return a.status.localeCompare(b.status);
      case "date":
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });

  const completedCount =
    contracts?.filter((c) => c.status === "completed").length || 0;
  const processingCount =
    contracts?.filter((c) => c.status === "processing").length || 0;
  const totalCount = contracts?.length || 0;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#0a0a0f",
        position: "relative",
        pb: 6,
      }}
    >
      {/* Subtle background gradient */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50vh",
          background:
            "radial-gradient(ellipse at top, rgba(99, 102, 241, 0.1) 0%, transparent 50%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Floating Header */}
      <Box
        sx={{
          position: "sticky",
          top: 16,
          zIndex: 1000,
          px: 2,
          transform: isHeaderVisible ? "translateY(0)" : "translateY(-120%)",
          transition: "transform 0.3s ease-in-out",
        }}
      >
        <Container maxWidth="xl">
          <Paper
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 2,
              px: 3,
              gap: 3,
              background: "rgba(15, 23, 42, 0.8)",
              backdropFilter: "blur(40px)",
              borderRadius: 3,
              border: "1px solid rgba(148, 163, 184, 0.15)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Logo */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/dashboard")}
                >
                  <Description sx={{ color: "#ffffff", fontSize: 22 }} />
                </Box>
              </motion.div>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/dashboard")}
              >
                ContractIQ
              </Typography>
            </Box>

            {/* Search Bar */}
            <Paper
              component="form"
              onSubmit={(e) => e.preventDefault()}
              sx={{
                flex: 1,
                maxWidth: 600,
                display: "flex",
                alignItems: "center",
                px: 2,
                py: 1,
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(148, 163, 184, 0.15)",
                borderRadius: 2,
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "rgba(99, 102, 241, 0.3)",
                },
                "&:focus-within": {
                  borderColor: "#6366f1",
                  boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                },
              }}
            >
              <Search sx={{ color: "text.secondary", mr: 1.5, fontSize: 20 }} />
              <InputBase
                placeholder={t("dashboard.searchContracts")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  flex: 1,
                  color: "text.primary",
                  fontSize: "0.9375rem",
                }}
              />
              {searchQuery && (
                <IconButton
                  size="small"
                  onClick={() => setSearchQuery("")}
                  sx={{ color: "text.secondary", ml: 1 }}
                >
                  <Close fontSize="small" />
                </IconButton>
              )}
            </Paper>

            {/* Subscription Button - Prominent */}
            {user && (user.subscriptionPlan === 'free' || user.subscriptionStatus !== 'active') && (
              <Button
                variant="contained"
                startIcon={<Star />}
                onClick={() => navigate("/pricing")}
                sx={{
                  background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
                  color: "#ffffff",
                  fontWeight: 600,
                  px: 2.5,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(245, 158, 11, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                    boxShadow: "0 6px 16px rgba(245, 158, 11, 0.5)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                  display: { xs: "none", md: "flex" },
                }}
              >
                {t("dashboard.upgradePlan")}
              </Button>
            )}

            {/* Language Selector */}
            <LanguageSelector />

            {/* User Menu */}
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                p: 0.5,
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "rgba(99, 102, 241, 0.1)",
                  transform: "scale(1.05)",
                },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                }}
              >
                {user?.name?.[0]?.toUpperCase() ||
                  user?.email?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Paper>
        </Container>

        {/* User Menu Dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ px: 3, py: 2, minWidth: 240 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  marginRight: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 120,
                }}
              >
                {user?.name || user?.email?.split("@")[0] || "User"}
            </Typography>
            <Chip
                label={user?.subscriptionPlan || "free"}
              size="small"
              sx={{
                  ml: 0.5,
                  background: "rgba(99, 102, 241, 0.15)",
                  color: "#818cf8",
                fontWeight: 600,
                  textTransform: "capitalize",
                  height: 22,
                  fontSize: "0.75rem",
              }}
            />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate("/pricing");
            }}
            sx={{
              background: user?.subscriptionPlan === 'free' 
                ? 'rgba(245, 158, 11, 0.1)' 
                : 'transparent',
              '&:hover': {
                background: user?.subscriptionPlan === 'free'
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'rgba(99, 102, 241, 0.1)',
              },
            }}
          >
            <CreditCard sx={{ mr: 2, fontSize: 20, color: user?.subscriptionPlan === 'free' ? '#f59e0b' : 'inherit' }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.subscriptionPlan === 'free' ? t('dashboard.upgradePlan') : t('dashboard.manageSubscription')}
              </Typography>
              {user?.subscriptionPlan === 'free' && (
                <Typography variant="caption" sx={{ color: '#f59e0b', display: 'block' }}>
                  {t('dashboard.unlockPremium')}
                </Typography>
              )}
            </Box>
            {user?.subscriptionPlan === 'free' && (
              <Star sx={{ fontSize: 16, color: '#f59e0b' }} />
            )}
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate("/profile");
            }}
          >
            <AccountCircle sx={{ mr: 2, fontSize: 20 }} />
            {t("auth.settings")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              logout();
            }}
            sx={{ color: "error.main" }}
          >
            <Logout sx={{ mr: 2, fontSize: 20 }} />
            {t("auth.logout")}
          </MenuItem>
        </Menu>
      </Box>

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, pt: 6 }}>
        {/* Upload Section */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ mb: 5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {t("dashboard.uploadContract")}
                  </Typography>
                  <IconButton
                    onClick={() => {
                      setShowUpload(false);
                      refetch();
                      setViewMode("all");
                    }}
                  >
                    <Close />
                  </IconButton>
                </Box>
                <UploadZone onUploadComplete={handleUploadComplete} />
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {!showUpload && (
          <>
            {/* Section Header */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {t("dashboard.myContracts")}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1.5}>
                  <Tooltip title={t("dashboard.sortContracts")}>
                    <Button
                      variant="outlined"
                      startIcon={<Sort />}
                      onClick={() => {
                        const options = ["date", "name", "status"];
                        const currentIndex = options.indexOf(sortBy);
                        setSortBy(
                          options[
                            (currentIndex + 1) % options.length
                          ] as typeof sortBy
                        );
                      }}
                      size="small"
                    >
                      {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                    </Button>
                  </Tooltip>
                  {hasComparison && selectedContracts.size >= 2 && (
                    <Button
                      variant="contained"
                      startIcon={<CompareArrows />}
                      onClick={handleCompare}
                      size="small"
                      sx={{
                        background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #818cf8 0%, #f472b6 100%)",
                        },
                      }}
                    >
                      {t("dashboard.compare")} ({selectedContracts.size})
                    </Button>
                  )}
                  {(user?.subscriptionPlan === 'business' || user?.subscriptionPlan === 'enterprise') && (
                    <Button
                      variant="outlined"
                      startIcon={<Upload />}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.multiple = true;
                        input.accept = '.pdf,.docx,.txt';
                        input.onchange = (e) => {
                          const files = Array.from((e.target as HTMLInputElement).files || []);
                          if (files.length > 0) {
                            setBulkUploadFiles(files);
                            handleBulkUpload();
                          }
                        };
                        input.click();
                      }}
                      disabled={isBulkUploading}
                      size="small"
                    >
                      {isBulkUploading ? t('dashboard.uploading') : t('dashboard.bulkUpload')}
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setShowUpload(true)}
                    size="small"
                  >
                    {t('dashboard.upload')}
                  </Button>
                </Stack>
              </Box>

              {/* View Mode Tabs */}
              <Tabs
                value={viewMode}
                onChange={(_, newValue) => setViewMode(newValue)}
                sx={{
                  borderBottom: 1,
                  borderColor: "rgba(148, 163, 184, 0.1)",
                }}
              >
                <Tab label={`${t('dashboard.all')} (${totalCount})`} value="all" />
                <Tab
                  label={`${t('dashboard.completed')} (${completedCount})`}
                  value="completed"
                />
                <Tab
                  label={`${t('dashboard.processing')} (${processingCount})`}
                  value="processing"
                />
                {(user?.subscriptionPlan === 'business' || user?.subscriptionPlan === 'enterprise') && (
                  <Tab label={t('dashboard.analytics')} value="analytics" />
                )}
              </Tabs>
            </Box>

            {/* Analytics Dashboard (Business+ only) */}
            {viewMode === 'analytics' && (user?.subscriptionPlan === 'business' || user?.subscriptionPlan === 'enterprise') && (
              <Container maxWidth="xl" sx={{ mt: 4 }}>
                <AnalyticsDashboard
                  analytics={analytics}
                  isLoading={isLoadingAnalytics}
                  onRefresh={() => refetch()}
                />
              </Container>
            )}

            {/* Contracts Grid */}
            {viewMode !== 'analytics' && (
              <>
                {isLoading ? (
                  <Container maxWidth="xl" sx={{ mt: 4 }}>
                    <DashboardSkeleton />
                  </Container>
            ) : filteredContracts.length > 0 ? (
              <Grid container spacing={3}>
                {filteredContracts.map((contract, index) => {
                  const statusStyle = getStatusColor(contract.status);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={contract.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card
                          sx={{
                            cursor: "pointer",
                            height: "100%",
                            background: selectedContracts.has(contract.id)
                              ? "rgba(99, 102, 241, 0.15)"
                              : "rgba(15, 23, 42, 0.6)",
                            border: selectedContracts.has(contract.id)
                              ? "2px solid #6366f1"
                              : "1px solid rgba(148, 163, 184, 0.1)",
                            position: "relative",
                            overflow: "hidden",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              borderColor: selectedContracts.has(contract.id)
                                ? "#818cf8"
                                : "rgba(99, 102, 241, 0.4)",
                              background: selectedContracts.has(contract.id)
                                ? "rgba(99, 102, 241, 0.2)"
                                : "rgba(15, 23, 42, 0.8)",
                              transform: "translateY(-4px)",
                              boxShadow: "0 12px 32px rgba(99, 102, 241, 0.15)",
                              "& .contract-actions": {
                                opacity: 1,
                              },
                            },
                          }}
                          onClick={() => navigate(`/contracts/${contract.id}`)}
                        >
                          {contract.status === "processing" && (
                            <LinearProgress
                              sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 3,
                              }}
                            />
                          )}
                          <CardContent sx={{ p: 3 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                mb: 2,
                              }}
                            >
                              {hasComparison && contract.status === "completed" && (
                                <Checkbox
                                  checked={selectedContracts.has(contract.id)}
                                  onChange={(e) => handleContractSelect(contract.id, e)}
                                  onClick={(e) => e.stopPropagation()}
                                  sx={{
                                    color: "#6366f1",
                                    "&.Mui-checked": {
                                      color: "#6366f1",
                                    },
                                    position: "absolute",
                                    top: 8,
                                    left: 8,
                                    zIndex: 10,
                                  }}
                                />
                              )}
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  flex: 1,
                                  minWidth: 0,
                                  ml: hasComparison && contract.status === "completed" ? 4 : 0,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: statusStyle.bg,
                                    color: statusStyle.color,
                                    flexShrink: 0,
                                  }}
                                >
                                  {statusStyle.icon || <Description />}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      fontWeight: 600,
                                      mb: 0.5,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {contract.fileName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {new Date(
                                      contract.createdAt
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </Typography>
                                </Box>
                              </Box>
                              <IconButton
                                className="contract-actions"
                                size="small"
                                onClick={(e) =>
                                  handleContractMenuOpen(e, contract.id)
                                }
                                sx={{
                                  opacity: 0,
                                  transition: "opacity 0.2s",
                                }}
                              >
                                <MoreVert />
                              </IconButton>
                            </Box>
                            <Stack
                              direction="row"
                              spacing={1}
                              flexWrap="wrap"
                              gap={1}
                            >
                              <Chip
                                label={contract.status}
                                size="small"
                                icon={statusStyle.icon || undefined}
                                sx={{
                                  background: statusStyle.bg,
                                  color: statusStyle.color,
                                  border: `1px solid ${statusStyle.color}40`,
                                  fontWeight: 600,
                                }}
                              />
                              <Chip
                                label={contract.fileType.toUpperCase()}
                                size="small"
                                sx={{
                                  background: "rgba(255, 255, 255, 0.05)",
                                  color: "text.secondary",
                                  border: "1px solid rgba(255, 255, 255, 0.1)",
                                }}
                              />
                            </Stack>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Card
                sx={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(148, 163, 184, 0.1)",
                  textAlign: "center",
                  py: 10,
                }}
              >
                <CardContent>
                  <Description
                    sx={{
                      fontSize: 72,
                      color: "text.secondary",
                      opacity: 0.2,
                      mb: 3,
                    }}
                  />
                  <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 600 }}>
                    {searchQuery || viewMode !== "all"
                      ? "No contracts found"
                      : "No contracts yet"}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4, maxWidth: 500, mx: "auto" }}
                  >
                    {searchQuery || viewMode !== "all"
                      ? "Try adjusting your filters or search terms"
                      : "Upload your first contract to get started with AI-powered analysis"}
                  </Typography>
                  {!searchQuery && viewMode === "all" && (
                    <Button
                      variant="contained"
                      startIcon={<Upload />}
                      onClick={() => setShowUpload(true)}
                    >
                      Upload Your First Contract
                    </Button>
                  )}
                  {(searchQuery || viewMode !== "all") && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSearchQuery("");
                        setViewMode("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
                )}
              </>
            )}
          </>
        )}

        {/* Contract Menu */}
        <Menu
          anchorEl={contractMenuAnchor?.el || null}
          open={Boolean(contractMenuAnchor)}
          onClose={handleContractMenuClose}
        >
          <MenuItem
            onClick={() => {
              if (contractMenuAnchor) {
                navigate(`/contracts/${contractMenuAnchor.id}`);
              }
              handleContractMenuClose();
            }}
          >
            <Visibility sx={{ mr: 2, fontSize: 20 }} />
            View Details
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (contractMenuAnchor) {
                handleDeleteClick(contractMenuAnchor.id);
              }
            }}
            sx={{ color: "error.main" }}
          >
            <Delete sx={{ mr: 2, fontSize: 20 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setContractToDelete(null);
          }}
        >
          <DialogTitle>Delete Contract</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this contract? This action cannot
              be undone.
            </DialogContentText>
            {contractToDelete &&
              contracts?.find((c) => c.id === contractToDelete) && (
              <DialogContentText sx={{ mt: 2, fontWeight: 600 }}>
                  {contracts.find((c) => c.id === contractToDelete)?.fileName}
              </DialogContentText>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setDeleteDialogOpen(false);
                setContractToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              variant="contained"
              color="error"
              startIcon={
                isDeleting ? <CircularProgress size={16} /> : <Delete />
              }
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default DashboardPage;
