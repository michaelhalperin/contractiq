import { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  LinearProgress,
  Stack,
  Chip,
  Button,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Download,
  TrendingUp,
  Assessment,
  Warning,
  CheckCircle,
  Description,
  CalendarToday,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  FileDownload,
  Refresh,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface AnalyticsData {
  totalContracts: number;
  completedContracts: number;
  totalRiskFlags: number;
  highRiskContracts: number;
  riskDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  contractsByMonth: Record<string, number>;
}

interface AnalyticsDashboardProps {
  analytics: AnalyticsData | null;
  isLoading: boolean;
  onRefresh?: () => void;
}

type TimePeriod = 'all' | '3months' | '6months' | '12months';

const AnalyticsDashboard = ({ analytics, isLoading, onRefresh }: AnalyticsDashboardProps) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  // Calculate additional metrics
  const metrics = useMemo(() => {
    if (!analytics) return null;

    const avgRiskPerContract = analytics.totalContracts > 0
      ? (analytics.totalRiskFlags / analytics.totalContracts).toFixed(2)
      : '0';

    const successRate = analytics.totalContracts > 0
      ? ((analytics.completedContracts / analytics.totalContracts) * 100).toFixed(1)
      : '0';

    const highRiskPercentage = analytics.totalContracts > 0
      ? ((analytics.highRiskContracts / analytics.totalContracts) * 100).toFixed(1)
      : '0';

    // Filter contracts by month based on time period
    const now = new Date();
    const filterDate = (() => {
      switch (timePeriod) {
        case '3months':
          return new Date(now.getFullYear(), now.getMonth() - 3, 1);
        case '6months':
          return new Date(now.getFullYear(), now.getMonth() - 6, 1);
        case '12months':
          return new Date(now.getFullYear(), now.getMonth() - 12, 1);
        default:
          return new Date(0);
      }
    })();

    const filteredMonths = Object.entries(analytics.contractsByMonth || {})
      .filter(([month]) => {
        if (timePeriod === 'all') return true;
        const monthDate = new Date(month + '-01');
        return monthDate >= filterDate;
      })
      .sort(([a], [b]) => a.localeCompare(b));

    const totalInPeriod = filteredMonths.reduce((sum, [, count]) => sum + count, 0);
    const avgPerMonth = filteredMonths.length > 0
      ? (totalInPeriod / filteredMonths.length).toFixed(1)
      : '0';

    return {
      avgRiskPerContract: parseFloat(avgRiskPerContract),
      successRate: parseFloat(successRate),
      highRiskPercentage: parseFloat(highRiskPercentage),
      filteredMonths,
      totalInPeriod,
      avgPerMonth: parseFloat(avgPerMonth),
    };
  }, [analytics, timePeriod]);

  const handleExport = (format: 'csv' | 'json') => {
    if (!analytics) return;

    try {
      if (format === 'csv') {
        // Export as CSV
        const headers = ['Metric', 'Value'];
        const rows = [
          ['Total Contracts', analytics.totalContracts.toString()],
          ['Completed Contracts', analytics.completedContracts.toString()],
          ['Total Risk Flags', analytics.totalRiskFlags.toString()],
          ['High Risk Contracts', analytics.highRiskContracts.toString()],
          ['High Risk Flags', analytics.riskDistribution.high.toString()],
          ['Medium Risk Flags', analytics.riskDistribution.medium.toString()],
          ['Low Risk Flags', analytics.riskDistribution.low.toString()],
          ['Average Risk Per Contract', metrics?.avgRiskPerContract.toString() || '0'],
          ['Success Rate (%)', metrics?.successRate.toString() || '0'],
          ['High Risk Percentage (%)', metrics?.highRiskPercentage.toString() || '0'],
        ];

        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.join(',')),
          '',
          'Contracts by Month',
          'Month,Count',
          ...Object.entries(analytics.contractsByMonth || {})
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, count]) => `${month},${count}`),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Analytics exported as CSV');
      } else {
        // Export as JSON
        const jsonData = {
          ...analytics,
          metrics: {
            avgRiskPerContract: metrics?.avgRiskPerContract,
            successRate: metrics?.successRate,
            highRiskPercentage: metrics?.highRiskPercentage,
            avgPerMonth: metrics?.avgPerMonth,
          },
          exportedAt: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Analytics exported as JSON');
      }
    } catch (error) {
      toast.error('Failed to export analytics');
    }

    setExportMenuAnchor(null);
  };

  // Custom Bar Chart Component
  const BarChart = ({ data, maxValue, color }: { data: { label: string; value: number }[]; maxValue: number; color: string }) => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 200, mt: 2 }}>
        {data.map((item, index) => {
          const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          return (
            <Box key={index} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Tooltip title={`${item.label}: ${item.value}`}>
                <Box
                  sx={{
                    width: '100%',
                    height: `${height}%`,
                    background: `linear-gradient(180deg, ${color} 0%, ${color}dd 100%)`,
                    borderRadius: '4px 4px 0 0',
                    minHeight: item.value > 0 ? '4px' : '0',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.8,
                      transform: 'scaleY(1.05)',
                    },
                  }}
                />
              </Tooltip>
              <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary', fontSize: '0.7rem', textAlign: 'center' }}>
                {item.label.length > 6 ? item.label.substring(0, 6) : item.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  };

  // Custom Pie Chart Component (using SVG)
  const PieChart = ({ data, size = 120 }: { data: { label: string; value: number; color: string }[]; size?: number }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -90;

    const paths = data.map((item, index) => {
      const percentage = total > 0 ? (item.value / total) * 100 : 0;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;
      const radius = size / 2 - 10;
      const centerX = size / 2;
      const centerY = size / 2;

      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);

      const largeArcFlag = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z',
      ].join(' ');

      return (
        <g key={index}>
          <path
            d={pathData}
            fill={item.color}
            stroke="#0a0a0f"
            strokeWidth="2"
            style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          />
        </g>
      );
    });

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {paths}
        </svg>
        <Stack spacing={1} sx={{ mt: 2, width: '100%' }}>
          {data.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: item.color,
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', flex: 1 }}>
                {item.label}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {item.value} ({total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Card sx={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.1)', textAlign: 'center', py: 8 }}>
        <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
        <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
          No analytics data available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload contracts to see analytics
        </Typography>
      </Card>
    );
  }

  const riskChartData = [
    { label: 'High', value: analytics.riskDistribution.high, color: '#ef4444' },
    { label: 'Medium', value: analytics.riskDistribution.medium, color: '#f59e0b' },
    { label: 'Low', value: analytics.riskDistribution.low, color: '#10b981' },
  ];

  const monthlyData = metrics?.filteredMonths.map(([month, count]) => ({
    label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
    value: count,
  })) || [];

  const maxMonthlyValue = Math.max(...monthlyData.map(d => d.value), 1);

  return (
    <Box>
      {/* Header with Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
            Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive insights into your contract portfolio
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Period</InputLabel>
            <Select
              value={timePeriod}
              label="Time Period"
              onChange={(e: SelectChangeEvent) => setTimePeriod(e.target.value as TimePeriod)}
              sx={{
                background: 'rgba(15, 23, 42, 0.6)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(148, 163, 184, 0.2)',
                },
              }}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="3months">Last 3 Months</MenuItem>
              <MenuItem value="6months">Last 6 Months</MenuItem>
              <MenuItem value="12months">Last 12 Months</MenuItem>
            </Select>
          </FormControl>
          {onRefresh && (
            <Tooltip title="Refresh Analytics">
              <IconButton
                onClick={onRefresh}
                sx={{
                  background: 'rgba(99, 102, 241, 0.1)',
                  '&:hover': {
                    background: 'rgba(99, 102, 241, 0.2)',
                  },
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          )}
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
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
          >
            <MenuItem onClick={() => handleExport('csv')}>
              <FileDownload sx={{ mr: 1, fontSize: 18 }} />
              Export as CSV
            </MenuItem>
            <MenuItem onClick={() => handleExport('json')}>
              <FileDownload sx={{ mr: 1, fontSize: 18 }} />
              Export as JSON
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              sx={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                borderRadius: 3,
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(99, 102, 241, 0.2)',
                  borderColor: 'rgba(99, 102, 241, 0.3)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Description sx={{ color: '#818cf8', fontSize: 20 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    Total Contracts
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                  {analytics.totalContracts}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircle sx={{ fontSize: 14, color: '#10b981' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {analytics.completedContracts} completed
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card
              sx={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                borderRadius: 3,
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(239, 68, 68, 0.2)',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background: 'rgba(239, 68, 68, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Warning sx={{ color: '#ef4444', fontSize: 20 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    Risk Flags
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#ef4444', mb: 1 }}>
                  {analytics.totalRiskFlags}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Avg {metrics?.avgRiskPerContract.toFixed(1)} per contract
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card
              sx={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                borderRadius: 3,
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(245, 158, 11, 0.2)',
                  borderColor: 'rgba(245, 158, 11, 0.3)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
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
                    <Assessment sx={{ color: '#f59e0b', fontSize: 20 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    High Risk
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#f59e0b', mb: 1 }}>
                  {analytics.highRiskContracts}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {metrics?.highRiskPercentage}% of contracts
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card
              sx={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                borderRadius: 3,
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(16, 185, 129, 0.2)',
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background: 'rgba(16, 185, 129, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TrendingUp sx={{ color: '#10b981', fontSize: 20 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    Success Rate
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#10b981', mb: 1 }}>
                  {metrics?.successRate}%
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {analytics.completedContracts} of {analytics.totalContracts} completed
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Risk Distribution Pie Chart */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card
              sx={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                borderRadius: 3,
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <PieChartIcon sx={{ color: '#818cf8', fontSize: 20 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Risk Distribution
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <PieChart data={riskChartData} size={200} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Contracts by Month Bar Chart */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card
              sx={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                borderRadius: 3,
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <BarChartIcon sx={{ color: '#818cf8', fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Contracts by Month
                    </Typography>
                  </Box>
                  {metrics && (
                    <Chip
                      label={`Avg: ${metrics.avgPerMonth}/month`}
                      size="small"
                      sx={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: 'primary.main',
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>
                {monthlyData.length > 0 ? (
                  <BarChart data={monthlyData} maxValue={maxMonthlyValue} color="#6366f1" />
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CalendarToday sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No data for selected period
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Risk Breakdown */}
      <Card
        sx={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          borderRadius: 3,
          mb: 3,
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
            Risk Breakdown
          </Typography>
          <Stack spacing={2.5}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: '#ef4444',
                    }}
                  />
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    High Risk
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 600 }}>
                    {analytics.riskDistribution.high} flags
                  </Typography>
                  <Chip
                    label={`${analytics.totalRiskFlags > 0 ? ((analytics.riskDistribution.high / analytics.totalRiskFlags) * 100).toFixed(1) : 0}%`}
                    size="small"
                    sx={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={analytics.totalRiskFlags > 0 ? (analytics.riskDistribution.high / analytics.totalRiskFlags) * 100 : 0}
                sx={{
                  height: 10,
                  borderRadius: 2,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                  },
                }}
              />
            </Box>
            <Divider />
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: '#f59e0b',
                    }}
                  />
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Medium Risk
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 600 }}>
                    {analytics.riskDistribution.medium} flags
                  </Typography>
                  <Chip
                    label={`${analytics.totalRiskFlags > 0 ? ((analytics.riskDistribution.medium / analytics.totalRiskFlags) * 100).toFixed(1) : 0}%`}
                    size="small"
                    sx={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#f59e0b',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={analytics.totalRiskFlags > 0 ? (analytics.riskDistribution.medium / analytics.totalRiskFlags) * 100 : 0}
                sx={{
                  height: 10,
                  borderRadius: 2,
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                  },
                }}
              />
            </Box>
            <Divider />
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: '#10b981',
                    }}
                  />
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Low Risk
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>
                    {analytics.riskDistribution.low} flags
                  </Typography>
                  <Chip
                    label={`${analytics.totalRiskFlags > 0 ? ((analytics.riskDistribution.low / analytics.totalRiskFlags) * 100).toFixed(1) : 0}%`}
                    size="small"
                    sx={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#10b981',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={analytics.totalRiskFlags > 0 ? (analytics.riskDistribution.low / analytics.totalRiskFlags) * 100 : 0}
                sx={{
                  height: 10,
                  borderRadius: 2,
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                  },
                }}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Additional Insights */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              borderRadius: 3,
              height: '100%',
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                Performance Metrics
              </Typography>
              <Stack spacing={2.5}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Average Risk per Contract
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                      {metrics?.avgRiskPerContract.toFixed(2)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((metrics?.avgRiskPerContract || 0) * 10, 100)}
                    sx={{
                      height: 6,
                      borderRadius: 1,
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 1,
                        background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                      },
                    }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Completion Rate
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>
                      {metrics?.successRate}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={metrics?.successRate || 0}
                    sx={{
                      height: 6,
                      borderRadius: 1,
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 1,
                        background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                      },
                    }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      High Risk Contract Rate
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 600 }}>
                      {metrics?.highRiskPercentage}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={metrics?.highRiskPercentage || 0}
                    sx={{
                      height: 6,
                      borderRadius: 1,
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 1,
                        background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                      },
                    }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              borderRadius: 3,
              height: '100%',
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                Summary Statistics
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Total Contracts Analyzed
                  </Typography>
                  <Chip
                    label={analytics.totalContracts}
                    size="small"
                    sx={{
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: 'primary.main',
                      fontWeight: 600,
                    }}
                  />
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Successfully Completed
                  </Typography>
                  <Chip
                    label={analytics.completedContracts}
                    size="small"
                    sx={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#10b981',
                      fontWeight: 600,
                    }}
                  />
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Contracts with High Risk
                  </Typography>
                  <Chip
                    label={analytics.highRiskContracts}
                    size="small"
                    sx={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      color: '#f59e0b',
                      fontWeight: 600,
                    }}
                  />
                </Box>
                <Divider />
                {metrics && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Average per Month ({timePeriod === 'all' ? 'All Time' : timePeriod.replace('months', ' Months')})
                      </Typography>
                      <Chip
                        label={`${metrics.avgPerMonth} contracts`}
                        size="small"
                        sx={{
                          background: 'rgba(139, 92, 246, 0.1)',
                          color: '#8b5cf6',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Total in Selected Period
                      </Typography>
                      <Chip
                        label={metrics.totalInPeriod}
                        size="small"
                        sx={{
                          background: 'rgba(99, 102, 241, 0.1)',
                          color: 'primary.main',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;

