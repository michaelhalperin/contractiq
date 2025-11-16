import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Metrics {
  users: {
    total: number;
    active: number;
  };
  contracts: {
    total: number;
    completed: number;
  };
  planBreakdown: Array<{ _id: string; count: number }>;
  contractsByMonth: Array<{ _id: { year: number; month: number }; count: number }>;
}

interface Revenue {
  mrr: number;
  revenueByPlan: {
    pro: number;
    business: number;
    enterprise: number;
  };
  activeSubscriptions: number;
}

const AdminDashboard = () => {
  const { data: metrics, isLoading: metricsLoading } = useQuery<Metrics>({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      const response = await api.get('/admin/metrics');
      return response.data;
    },
  });

  const { data: revenue, isLoading: revenueLoading } = useQuery<Revenue>({
    queryKey: ['admin-revenue'],
    queryFn: async () => {
      const response = await api.get('/admin/revenue');
      return response.data;
    },
  });

  const handleExportCSV = () => {
    // TODO: Implement CSV export
    toast.success('CSV export coming soon!');
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#121212', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" gutterBottom sx={{ mb: 4 }}>
          Admin Dashboard
        </Typography>

        {/* Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h3" color="primary">
                  {metricsLoading ? '...' : metrics?.users.total || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Active Users
                </Typography>
                <Typography variant="h3" color="success.main">
                  {metricsLoading ? '...' : metrics?.users.active || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Contracts
                </Typography>
                <Typography variant="h3" color="secondary">
                  {metricsLoading ? '...' : metrics?.contracts.total || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  MRR
                </Typography>
                <Typography variant="h3" color="primary">
                  ${revenueLoading ? '...' : revenue?.mrr || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Plan Breakdown */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">Plan Breakdown</Typography>
              <Button variant="outlined" onClick={handleExportCSV}>
                Export CSV
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Plan</TableCell>
                    <TableCell align="right">Users</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metrics?.planBreakdown.map((plan) => (
                    <TableRow key={plan._id}>
                      <TableCell>{plan._id.toUpperCase()}</TableCell>
                      <TableCell align="right">{plan.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        {revenue && (
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Revenue Breakdown
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Pro Plan
                  </Typography>
                  <Typography variant="h6">${revenue.revenueByPlan.pro}/mo</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Business Plan
                  </Typography>
                  <Typography variant="h6">${revenue.revenueByPlan.business}/mo</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Enterprise Plan
                  </Typography>
                  <Typography variant="h6">${revenue.revenueByPlan.enterprise}/mo</Typography>
                </Grid>
              </Grid>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Active Subscriptions: {revenue.activeSubscriptions}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default AdminDashboard;

