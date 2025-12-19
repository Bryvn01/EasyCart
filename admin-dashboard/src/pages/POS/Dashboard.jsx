import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ErrorBoundary from '../../components/ErrorBoundary';
import { validateDashboardStats, validateSession, sanitizeCSV } from '../../utils/dataValidation';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Tooltip as MuiTooltip,
  Alert,
  Divider,
  useTheme,
  alpha,
  Skeleton,
} from '@mui/material';
import {
  TrendingUp,
  AttachMoney,
  Receipt,
  Refresh,
  GetApp,
  LocalAtm,
  CreditCard,
  PhoneAndroid,
  Store,
  People,
  ShoppingCart,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import toast from 'react-hot-toast';

const POSDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      toast.error('Please log in to access the POS system');
      navigate('/admin/login');
      return;
    }
  }, [navigate]);

  const loadDashboardData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams();

      if (dateRange === 'custom' && startDate && endDate) {
        params.append('start_date', startDate);
        params.append('end_date', endDate);
      } else if (dateRange === 'today') {
        const today = new Date().toISOString().split('T')[0];
        params.append('start_date', today);
      } else if (dateRange === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        params.append('start_date', weekAgo);
      } else if (dateRange === 'month') {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        params.append('start_date', monthAgo);
      }

      const url = `/pos/dashboard/stats/${params.toString() ? '?' + params.toString() : ''}`;

      const response = await api.get(url);

      // Validate and sanitize response data using utility function
      const validatedStats = validateDashboardStats(response?.data);

      setStats(validatedStats);

      if (showRefreshIndicator) {
        toast.success('Dashboard refreshed');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to load dashboard data';
      setError(errorMessage);

      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        navigate('/admin/login');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange, startDate, endDate, navigate]);

  const loadSessions = useCallback(async () => {
    try {
      const response = await api.get('/pos/sessions/?ordering=-opened_at&limit=10');

      // Validate response structure
      const sessionData = response.data.results || response.data;

      if (!Array.isArray(sessionData)) {
        console.error('Invalid sessions data format:', response.data);
        setSessions([]);
        return;
      }

      // Validate and sanitize each session using utility function
      const validatedSessions = sessionData
        .map(session => validateSession(session))
        .filter(session => session !== null);

      setSessions(validatedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setSessions([]); // Set empty array on error

      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        navigate('/admin/login');
      } else {
        // Don't show error toast for sessions - it's not critical
        console.warn('Failed to load recent sessions');
      }
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboardData();
    loadSessions();
  }, [loadDashboardData, loadSessions]);

  const handleRefresh = () => {
    loadDashboardData(true);
    loadSessions();
  };

  const handleExport = useCallback(async () => {
    try {
      const params = new URLSearchParams();

      if (dateRange === 'custom' && startDate && endDate) {
        params.append('start_date', startDate);
        params.append('end_date', endDate);
      } else if (dateRange === 'today') {
        const today = new Date().toISOString().split('T')[0];
        params.append('start_date', today);
      } else if (dateRange === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        params.append('start_date', weekAgo);
      } else if (dateRange === 'month') {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        params.append('start_date', monthAgo);
      }

      const response = await api.get(`/pos/dashboard/stats/${params.toString() ? '?' + params.toString() : ''}`);

      if (!response.data) {
        toast.error('No data available to export');
        return;
      }

      // Prepare CSV content
      const csvRows = [];

      // Add header with metadata
      csvRows.push(['POS Dashboard Export']);
      csvRows.push(['Generated:', new Date().toLocaleString('en-KE')]);
      csvRows.push(['Date Range:', dateRange]);
      if (startDate) csvRows.push(['Start Date:', startDate]);
      if (endDate) csvRows.push(['End Date:', endDate]);
      csvRows.push([]);

      // Summary statistics
      csvRows.push(['Summary Statistics']);
      csvRows.push(['Metric', 'Value']);
      csvRows.push(['Total Sales', `KES ${response.data.total_sales?.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`]);
      csvRows.push(['Total Transactions', response.data.total_transactions || 0]);
      csvRows.push(['Average Transaction', `KES ${response.data.average_transaction?.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`]);
      csvRows.push([]);

      // Payment Methods Detailed Analysis
      csvRows.push(['Payment Methods Analysis']);
      csvRows.push(['Payment Method', 'Total Amount', 'Transaction Count', 'Average Transaction', 'Market Share %']);

      if (response.data.payment_methods) {
        // Cash
        csvRows.push([
          'Cash',
          `KES ${(response.data.payment_methods.cash?.amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          response.data.payment_methods.cash?.count || 0,
          `KES ${(response.data.payment_methods.cash?.average || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `${(response.data.payment_methods.cash?.percentage || 0).toFixed(2)}%`
        ]);

        // Card
        csvRows.push([
          'Card',
          `KES ${(response.data.payment_methods.card?.amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          response.data.payment_methods.card?.count || 0,
          `KES ${(response.data.payment_methods.card?.average || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `${(response.data.payment_methods.card?.percentage || 0).toFixed(2)}%`
        ]);

        // M-Pesa
        csvRows.push([
          'M-Pesa',
          `KES ${(response.data.payment_methods.mpesa?.amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          response.data.payment_methods.mpesa?.count || 0,
          `KES ${(response.data.payment_methods.mpesa?.average || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `${(response.data.payment_methods.mpesa?.percentage || 0).toFixed(2)}%`
        ]);

        // Airtel Money
        csvRows.push([
          'Airtel Money',
          `KES ${(response.data.payment_methods.airtel?.amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          response.data.payment_methods.airtel?.count || 0,
          `KES ${(response.data.payment_methods.airtel?.average || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `${(response.data.payment_methods.airtel?.percentage || 0).toFixed(2)}%`
        ]);

        // Total/Combined Mobile Money
        csvRows.push([
          'Mobile Money (Combined)',
          `KES ${(response.data.payment_methods.mobile_money?.amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          response.data.payment_methods.mobile_money?.count || 0,
          `KES ${(response.data.payment_methods.mobile_money?.average || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `${(response.data.payment_methods.mobile_money?.percentage || 0).toFixed(2)}%`
        ]);
      } else {
        // Fallback to legacy format
        csvRows.push(['Cash Sales', `KES ${response.data.cash_sales?.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`, '', '', '']);
        csvRows.push(['Card Sales', `KES ${response.data.card_sales?.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`, '', '', '']);
        csvRows.push(['Mobile Money Sales', `KES ${response.data.mobile_money_sales?.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`, '', '', '']);
      }
      csvRows.push([]);

      // Top Products
      if (response.data.top_products && response.data.top_products.length > 0) {
        csvRows.push(['Top Products']);
        csvRows.push(['Rank', 'Product Name', 'SKU', 'Quantity Sold', 'Revenue']);
        response.data.top_products.forEach((product, index) => {
          csvRows.push([
            index + 1,
            product.product__name || 'N/A',
            product.product__sku || 'N/A',
            product.total_quantity || 0,
            `KES ${product.total_revenue?.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`
          ]);
        });
        csvRows.push([]);
      }

      // Daily Sales Trend
      if (response.data.daily_sales && response.data.daily_sales.length > 0) {
        csvRows.push(['Daily Sales Trend']);
        csvRows.push(['Date', 'Sales Amount', 'Transaction Count']);
        response.data.daily_sales.forEach(day => {
          csvRows.push([
            day.date || 'N/A',
            `KES ${day.total?.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
            day.count || 0
          ]);
        });
        csvRows.push([]);
      }

      // Hourly Sales
      if (response.data.hourly_sales && response.data.hourly_sales.length > 0) {
        csvRows.push(['Hourly Sales (Last 24 Hours)']);
        csvRows.push(['Hour', 'Sales Amount', 'Transaction Count']);
        response.data.hourly_sales.forEach(hour => {
          csvRows.push([
            `${hour.hour}:00`,
            `KES ${hour.total?.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
            hour.count || 0
          ]);
        });
      }

      // Convert to CSV string using sanitization utility
      const csvContent = csvRows.map(row =>
        row.map(cell => sanitizeCSV(cell)).join(',')
      ).join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const fileName = `pos-dashboard-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Dashboard data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data. Please try again.');
    }
  }, [dateRange, startDate, endDate]);

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              color="textSecondary"
              gutterBottom
              variant="body2"
              sx={{ fontWeight: 500, textTransform: 'uppercase', fontSize: '0.75rem', mb: 1 }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              component="div"
              sx={{ fontWeight: 700, mb: 0.5 }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mt: 1, fontSize: '0.875rem' }}
              >
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp
                  sx={{
                    fontSize: 16,
                    mr: 0.5,
                    color: trend > 0 ? 'success.main' : 'error.main'
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: trend > 0 ? 'success.main' : 'error.main' }}
                >
                  {trend > 0 ? '+' : ''}{trend}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: alpha(color, 0.1),
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 64,
            }}
          >
            <Icon sx={{ color, fontSize: 32 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={200} height={60} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <ErrorBoundary>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 0.5 }}>
              POS Dashboard
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Real-time sales analytics and performance metrics
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <MuiTooltip title="Refresh data">
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                color="primary"
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              <Refresh />
            </IconButton>
          </MuiTooltip>
          <Button
            variant="outlined"
            startIcon={<GetApp />}
            onClick={handleExport}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Date Range Selector */}
      <Paper elevation={1} sx={{ p: 2.5, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            select
            label="Date Range"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            sx={{ minWidth: 200 }}
            size="small"
          >
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">Last 7 Days</MenuItem>
            <MenuItem value="month">Last 30 Days</MenuItem>
            <MenuItem value="custom">Custom Range</MenuItem>
          </TextField>

          {dateRange === 'custom' && (
            <>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </>
          )}
        </Box>
      </Paper>

      {stats && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Sales"
                value={`KES ${parseFloat(stats.total_sales || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={AttachMoney}
                color={theme.palette.success.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Transactions"
                value={(stats.total_transactions || 0).toLocaleString()}
                icon={Receipt}
                color={theme.palette.primary.main}
                subtitle={`Avg: KES ${parseFloat(stats.average_transaction || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Cash Sales"
                value={`KES ${parseFloat(stats.cash_sales || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={LocalAtm}
                color={theme.palette.warning.main}
                subtitle={stats.payment_methods?.cash ? `${stats.payment_methods.cash.count} trans • ${stats.payment_methods.cash.percentage.toFixed(1)}%` : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Card Sales"
                value={`KES ${parseFloat(stats.card_sales || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={CreditCard}
                color={theme.palette.info.main}
                subtitle={stats.payment_methods?.card ? `${stats.payment_methods.card.count} trans • ${stats.payment_methods.card.percentage.toFixed(1)}%` : ''}
              />
            </Grid>
          </Grid>

          {/* Payment Methods Detailed Analysis */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Payment Methods Analysis
            </Typography>

            <Grid container spacing={3}>
              {/* Cash Analysis */}
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={1} sx={{ height: '100%', border: `2px solid ${theme.palette.warning.main}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocalAtm sx={{ fontSize: 32, color: theme.palette.warning.main, mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Cash</Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: theme.palette.warning.main }}>
                      KES {parseFloat(stats.payment_methods?.cash?.amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="textSecondary">Transactions:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{stats.payment_methods?.cash?.count || 0}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="textSecondary">Average:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        KES {parseFloat(stats.payment_methods?.cash?.average || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">Share:</Typography>
                      <Chip
                        label={`${(stats.payment_methods?.cash?.percentage || 0).toFixed(1)}%`}
                        size="small"
                        color="warning"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Card Analysis */}
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={1} sx={{ height: '100%', border: `2px solid ${theme.palette.info.main}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CreditCard sx={{ fontSize: 32, color: theme.palette.info.main, mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Card</Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: theme.palette.info.main }}>
                      KES {parseFloat(stats.payment_methods?.card?.amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="textSecondary">Transactions:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{stats.payment_methods?.card?.count || 0}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="textSecondary">Average:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        KES {parseFloat(stats.payment_methods?.card?.average || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">Share:</Typography>
                      <Chip
                        label={`${(stats.payment_methods?.card?.percentage || 0).toFixed(1)}%`}
                        size="small"
                        color="info"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* M-Pesa Analysis */}
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={1} sx={{ height: '100%', border: `2px solid ${theme.palette.success.main}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PhoneAndroid sx={{ fontSize: 32, color: theme.palette.success.main, mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>M-Pesa</Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: theme.palette.success.main }}>
                      KES {parseFloat(stats.payment_methods?.mpesa?.amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="textSecondary">Transactions:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{stats.payment_methods?.mpesa?.count || 0}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="textSecondary">Average:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        KES {parseFloat(stats.payment_methods?.mpesa?.average || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">Share:</Typography>
                      <Chip
                        label={`${(stats.payment_methods?.mpesa?.percentage || 0).toFixed(1)}%`}
                        size="small"
                        color="success"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Airtel Money Analysis */}
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={1} sx={{ height: '100%', border: `2px solid ${theme.palette.error.main}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PhoneAndroid sx={{ fontSize: 32, color: theme.palette.error.main, mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Airtel Money</Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: theme.palette.error.main }}>
                      KES {parseFloat(stats.payment_methods?.airtel?.amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="textSecondary">Transactions:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{stats.payment_methods?.airtel?.count || 0}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="textSecondary">Average:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        KES {parseFloat(stats.payment_methods?.airtel?.average || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">Share:</Typography>
                      <Chip
                        label={`${(stats.payment_methods?.airtel?.percentage || 0).toFixed(1)}%`}
                        size="small"
                        color="error"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Payment Methods Comparison Table */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Comparative Analysis
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Payment Method</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Total Amount</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Transactions</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Avg Transaction</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Market Share</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocalAtm sx={{ mr: 1, color: theme.palette.warning.main }} />
                          Cash
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        KES {parseFloat(stats.payment_methods?.cash?.amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">{stats.payment_methods?.cash?.count || 0}</TableCell>
                      <TableCell align="right">
                        KES {parseFloat(stats.payment_methods?.cash?.average || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${(stats.payment_methods?.cash?.percentage || 0).toFixed(1)}%`}
                          size="small"
                          color="warning"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CreditCard sx={{ mr: 1, color: theme.palette.info.main }} />
                          Card
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        KES {parseFloat(stats.payment_methods?.card?.amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">{stats.payment_methods?.card?.count || 0}</TableCell>
                      <TableCell align="right">
                        KES {parseFloat(stats.payment_methods?.card?.average || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${(stats.payment_methods?.card?.percentage || 0).toFixed(1)}%`}
                          size="small"
                          color="info"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneAndroid sx={{ mr: 1, color: theme.palette.success.main }} />
                          M-Pesa
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        KES {parseFloat(stats.payment_methods?.mpesa?.amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">{stats.payment_methods?.mpesa?.count || 0}</TableCell>
                      <TableCell align="right">
                        KES {parseFloat(stats.payment_methods?.mpesa?.average || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${(stats.payment_methods?.mpesa?.percentage || 0).toFixed(1)}%`}
                          size="small"
                          color="success"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneAndroid sx={{ mr: 1, color: theme.palette.error.main }} />
                          Airtel Money
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        KES {parseFloat(stats.payment_methods?.airtel?.amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">{stats.payment_methods?.airtel?.count || 0}</TableCell>
                      <TableCell align="right">
                        KES {parseFloat(stats.payment_methods?.airtel?.average || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${(stats.payment_methods?.airtel?.percentage || 0).toFixed(1)}%`}
                          size="small"
                          color="error"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>

          {/* Charts Row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Sales Trend Chart */}
            {stats.daily_sales && stats.daily_sales.length > 0 && (
              <Grid item xs={12} lg={8}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    Sales Trend (Last 30 Days)
                  </Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={stats.daily_sales}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                      <XAxis
                        dataKey="date"
                        stroke={theme.palette.text.secondary}
                        style={{ fontSize: 12 }}
                      />
                      <YAxis
                        stroke={theme.palette.text.secondary}
                        style={{ fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke={theme.palette.primary.main}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSales)"
                        name="Sales (KES)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}

            {/* Payment Methods Breakdown - Detailed Pie Chart */}
            <Grid item xs={12} lg={4}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Payment Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: 'Cash',
                          value: parseFloat(stats.payment_methods?.cash?.amount || 0),
                          count: stats.payment_methods?.cash?.count || 0
                        },
                        {
                          name: 'Card',
                          value: parseFloat(stats.payment_methods?.card?.amount || 0),
                          count: stats.payment_methods?.card?.count || 0
                        },
                        {
                          name: 'M-Pesa',
                          value: parseFloat(stats.payment_methods?.mpesa?.amount || 0),
                          count: stats.payment_methods?.mpesa?.count || 0
                        },
                        {
                          name: 'Airtel',
                          value: parseFloat(stats.payment_methods?.airtel?.amount || 0),
                          count: stats.payment_methods?.airtel?.count || 0
                        },
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${((entry.value / (parseFloat(stats.total_sales) || 1)) * 100).toFixed(1)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[theme.palette.warning.main, theme.palette.info.main, theme.palette.success.main, theme.palette.error.main].map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `KES ${value.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`}
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    {
                      label: 'Cash',
                      value: stats.payment_methods?.cash?.amount || 0,
                      count: stats.payment_methods?.cash?.count || 0,
                      color: theme.palette.warning.main
                    },
                    {
                      label: 'Card',
                      value: stats.payment_methods?.card?.amount || 0,
                      count: stats.payment_methods?.card?.count || 0,
                      color: theme.palette.info.main
                    },
                    {
                      label: 'M-Pesa',
                      value: stats.payment_methods?.mpesa?.amount || 0,
                      count: stats.payment_methods?.mpesa?.count || 0,
                      color: theme.palette.success.main
                    },
                    {
                      label: 'Airtel',
                      value: stats.payment_methods?.airtel?.amount || 0,
                      count: stats.payment_methods?.airtel?.count || 0,
                      color: theme.palette.error.main
                    },
                  ].filter(item => parseFloat(item.value || 0) > 0).map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.color }} />
                        <Typography variant="body2">{item.label}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          KES {parseFloat(item.value || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {item.count} {item.count === 1 ? 'transaction' : 'transactions'}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Hourly Sales Chart */}
          {stats.hourly_sales && stats.hourly_sales.length > 0 && (
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Hourly Sales Performance (Last 24 Hours)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.hourly_sales}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                  <XAxis
                    dataKey="hour"
                    label={{ value: 'Hour', position: 'insideBottom', offset: -5 }}
                    stroke={theme.palette.text.secondary}
                  />
                  <YAxis
                    stroke={theme.palette.text.secondary}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  <Bar dataKey="total" fill={theme.palette.primary.main} name="Sales (KES)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="count" fill={theme.palette.secondary.main} name="Transactions" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          )}

          {/* Top Products */}
          {stats.top_products && stats.top_products.length > 0 && (
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                <ShoppingCart sx={{ mr: 1, verticalAlign: 'middle' }} />
                Top Selling Products
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Quantity Sold</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Revenue</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Avg. Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.top_products.slice(0, 10).map((product, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.05) },
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <TableCell>
                          <Chip
                            label={index + 1}
                            size="small"
                            color={index < 3 ? 'primary' : 'default'}
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{product.product__name}</TableCell>
                        <TableCell>
                          <Chip label={product.product__sku} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {product.total_quantity.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                          KES {parseFloat(product.total_revenue).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="right">
                          KES {(parseFloat(product.total_revenue) / product.total_quantity).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </>
      )}

      {/* Recent Sessions */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            <Store sx={{ mr: 1, verticalAlign: 'middle' }} />
            Recent POS Sessions
          </Typography>
          <Chip
            label={`${sessions.length} Sessions`}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>

        {sessions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Store sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No POS sessions found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Sessions will appear here once they are created
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Session #</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    <People sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 18 }} />
                    Staff
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Opened</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Closed</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Total Sales</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Transactions</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow
                    key={session.id}
                    sx={{
                      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.05) },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>
                      <Chip label={session.session_number} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{session.staff_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={session.status.toUpperCase()}
                        color={
                          session.status === 'open'
                            ? 'success'
                            : session.status === 'closed'
                            ? 'warning'
                            : session.status === 'reconciled'
                            ? 'info'
                            : 'default'
                        }
                        size="small"
                        sx={{ fontWeight: 600, minWidth: 90 }}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(session.opened_at).toLocaleString('en-KE', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      {session.closed_at
                        ? new Date(session.closed_at).toLocaleString('en-KE', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : <Chip label="Active" size="small" color="success" />
                      }
                    </TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                      KES {parseFloat(session.total_sales || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {session.total_transactions || 0}
                    </TableCell>
                    <TableCell align="right">
                      {session.duration_minutes
                        ? `${Math.floor(session.duration_minutes / 60)}h ${session.duration_minutes % 60}m`
                        : <Chip label="In Progress" size="small" variant="outlined" />
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Loading Overlay for Refresh */}
      {refreshing && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: alpha(theme.palette.background.default, 0.8),
            zIndex: theme.zIndex.modal,
          }}
        >
          <Paper
            elevation={4}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            <CircularProgress size={48} />
            <Typography variant="body1">Refreshing dashboard...</Typography>
          </Paper>
        </Box>
      )}
      </Container>
    </ErrorBoundary>
  );
};

export default POSDashboard;
