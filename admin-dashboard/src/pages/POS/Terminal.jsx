import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  InputAdornment,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import {
  Search,
  Add,
  Remove,
  Delete,
  ShoppingCart,
  Payment,
  Receipt,
  ArrowBack,
  CreditCard,
  AccountBalanceWallet,
  Money,
  Percent,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const POSTerminal = () => {
  const navigate = useNavigate();

  // State
  const [session, setSession] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      toast.error('Please log in to access the POS system');
      navigate('/admin/login');
      return;
    }
  }, [navigate]);

  const checkSession = React.useCallback(async () => {
    try {
      const response = await api.get('/pos/sessions/current/');
      setSession(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error('No active POS session. Please open a session first.');
        navigate('/admin/pos/session');
      }
    }
  }, [navigate]);

  const searchProducts = React.useCallback(async () => {
    try {
      const response = await api.get('/pos/products/', {
        params: { search: searchQuery },
      });
      setProducts(response.data.results || response.data);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  }, [searchQuery]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchProducts();
    } else {
      setProducts([]);
    }
  }, [searchProducts, searchQuery]);

  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.product.id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('Insufficient stock');
        return;
      }
      setCartItems(cartItems.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        product: product,
        quantity: 1,
        unit_price: product.price,
        discount_percentage: 0,
      }]);
    }

    toast.success(`${product.name} added to cart`);
    setSearchQuery('');
    setProducts([]);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cartItems.find(i => i.product.id === productId);
    if (newQuantity > item.product.stock) {
      toast.error('Insufficient stock');
      return;
    }

    setCartItems(cartItems.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.product.id !== productId));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    return (calculateSubtotal() * discountPercent) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setShowPaymentDialog(true);
  };

  const processPayment = async () => {
    setLoading(true);
    try {
      // Create transaction
      const transactionData = {
        session: session.id,
        customer_name: customer.name || 'Walk-in Customer',
        customer_phone: customer.phone,
        customer_email: customer.email,
        payment_method: paymentMethod,
        discount_percentage: discountPercent,
        tax_amount: 0,
        items: cartItems.map(item => ({
          product: item.product.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percentage: item.discount_percentage,
        })),
      };

      const createResponse = await api.post(
        '/pos/transactions/',
        transactionData
      );

      // Complete transaction
      const completeResponse = await api.post(
        `/pos/transactions/${createResponse.data.id}/complete/`,
        { amount_paid: parseFloat(amountPaid) || calculateTotal() }
      );

      setCurrentReceipt(completeResponse.data.transaction);
      setShowPaymentDialog(false);
      setShowReceiptDialog(true);

      // Reset cart
      setCartItems([]);
      setCustomer({ name: '', phone: '', email: '' });
      setDiscountPercent(0);
      setAmountPaid('');

      toast.success('Transaction completed successfully!');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = async () => {
    if (!currentReceipt) return;

    try {
      await api.post(
        `/pos/transactions/${currentReceipt.id}/print_receipt/`
      );

      // Generate printable receipt
      const receiptWindow = window.open('', '', 'height=600,width=400');
      receiptWindow.document.write(generateReceiptHTML(currentReceipt));
      receiptWindow.document.close();
      receiptWindow.print();

      toast.success('Receipt printed');
    } catch (error) {
      console.error('Error printing receipt:', error);
    }
  };

  const generateReceiptHTML = (transaction) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${transaction.transaction_number}</title>
        <style>
          body { font-family: 'Courier New', monospace; max-width: 350px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
          .item { display: flex; justify-content: space-between; margin: 5px 0; }
          .total { border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; border-top: 2px solid #000; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>EASYCART</h2>
          <p>Receipt: ${transaction.transaction_number}</p>
          <p>${new Date(transaction.created_at).toLocaleString()}</p>
        </div>

        <div class="items">
          ${transaction.items.map(item => `
            <div class="item">
              <span>${item.product_name} x ${item.quantity}</span>
              <span>KES ${parseFloat(item.line_total).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>

        <div class="total">
          <div class="item">
            <span>Subtotal:</span>
            <span>KES ${parseFloat(transaction.subtotal).toFixed(2)}</span>
          </div>
          ${parseFloat(transaction.discount_amount) > 0 ? `
          <div class="item">
            <span>Discount:</span>
            <span>-KES ${parseFloat(transaction.discount_amount).toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="item">
            <span>TOTAL:</span>
            <span>KES ${parseFloat(transaction.total_amount).toFixed(2)}</span>
          </div>
          <div class="item">
            <span>Paid:</span>
            <span>KES ${parseFloat(transaction.amount_paid).toFixed(2)}</span>
          </div>
          ${parseFloat(transaction.change_given) > 0 ? `
          <div class="item">
            <span>Change:</span>
            <span>KES ${parseFloat(transaction.change_given).toFixed(2)}</span>
          </div>
          ` : ''}
        </div>

        <div class="footer">
          <p>Thank you for shopping with EasyCart!</p>
          <p>Payment Method: ${transaction.payment_method.toUpperCase()}</p>
        </div>
      </body>
      </html>
    `;
  };

  const getChange = () => {
    const paid = parseFloat(amountPaid) || 0;
    const total = calculateTotal();
    return Math.max(0, paid - total);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4">POS Terminal</Typography>
          {session && (
            <Typography variant="body2" color="text.secondary">
              Session: {session.session_number} | Sales: KES {parseFloat(session.total_sales).toFixed(2)}
            </Typography>
          )}
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/pos/session')}
        >
          Back to Session
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left Side - Product Search and Selection */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {/* Product Results */}
            {products.length > 0 && (
              <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
                <Grid container spacing={2}>
                  {products.map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" noWrap>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            SKU: {product.sku}
                          </Typography>
                          <Typography variant="h6" color="primary">
                            KES {parseFloat(product.price).toFixed(2)}
                          </Typography>
                          <Chip
                            label={`Stock: ${product.stock}`}
                            size="small"
                            color={product.stock > 10 ? 'success' : 'warning'}
                          />
                        </CardContent>
                        <CardActions>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => addToCart(product)}
                            disabled={product.stock === 0}
                          >
                            Add to Cart
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Side - Cart and Checkout */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ShoppingCart sx={{ mr: 1 }} />
              <Typography variant="h6">
                Cart
                <Badge badgeContent={cartItems.length} color="primary" sx={{ ml: 2 }} />
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Cart Items */}
            <Box sx={{ maxHeight: '300px', overflow: 'auto', mb: 2 }}>
              {cartItems.length === 0 ? (
                <Alert severity="info">Cart is empty</Alert>
              ) : (
                <List>
                  {cartItems.map((item) => (
                    <ListItem key={item.product.id} divider>
                      <ListItemText
                        primary={item.product.name}
                        secondary={`KES ${parseFloat(item.unit_price).toFixed(2)} each`}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Remove />
                        </IconButton>
                        <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Add />
                        </IconButton>
                      </Box>
                      <ListItemSecondaryAction>
                        <Typography variant="body1">
                          KES {(item.unit_price * item.quantity).toFixed(2)}
                        </Typography>
                        <IconButton
                          edge="end"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            {/* Discount */}
            <TextField
              fullWidth
              type="number"
              label="Discount %"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Percent /></InputAdornment>,
              }}
              sx={{ mb: 2 }}
              inputProps={{ min: 0, max: 100 }}
            />

            {/* Totals */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>KES {calculateSubtotal().toFixed(2)}</Typography>
              </Box>
              {discountPercent > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="error">Discount ({discountPercent}%):</Typography>
                  <Typography color="error">-KES {calculateDiscount().toFixed(2)}</Typography>
                </Box>
              )}
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  KES {calculateTotal().toFixed(2)}
                </Typography>
              </Box>
            </Box>

            {/* Checkout Button */}
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Payment />}
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
            >
              Checkout
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Payment Dialog */}
      <Dialog
        open={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Process Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Customer Info */}
            <Typography variant="subtitle1" gutterBottom>
              Customer Information (Optional)
            </Typography>
            <TextField
              fullWidth
              label="Customer Name"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 2 }} />

            {/* Payment Method */}
            <Typography variant="subtitle1" gutterBottom>
              Payment Method
            </Typography>
            <Tabs
              value={paymentMethod}
              onChange={(e, newValue) => setPaymentMethod(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab icon={<Money />} label="Cash" value="cash" />
              <Tab icon={<CreditCard />} label="Card" value="card" />
              <Tab icon={<AccountBalanceWallet />} label="M-Pesa" value="mpesa" />
              <Tab icon={<AccountBalanceWallet />} label="Airtel" value="airtel" />
            </Tabs>

            {/* Amount */}
            <Typography variant="h6" gutterBottom>
              Total Amount: KES {calculateTotal().toFixed(2)}
            </Typography>

            {paymentMethod === 'cash' && (
              <>
                <TextField
                  fullWidth
                  type="number"
                  label="Amount Received"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  sx={{ mb: 2 }}
                  inputProps={{ step: '0.01' }}
                />
                {amountPaid && (
                  <Alert severity={getChange() >= 0 ? 'success' : 'error'}>
                    Change: KES {getChange().toFixed(2)}
                  </Alert>
                )}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={processPayment}
            disabled={loading || (paymentMethod === 'cash' && parseFloat(amountPaid) < calculateTotal())}
          >
            {loading ? <CircularProgress size={24} /> : 'Complete Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog
        open={showReceiptDialog}
        onClose={() => setShowReceiptDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Transaction Complete</DialogTitle>
        <DialogContent>
          {currentReceipt && (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Transaction {currentReceipt.transaction_number} completed successfully!
              </Alert>

              <Typography variant="h6">
                Total: KES {parseFloat(currentReceipt.total_amount).toFixed(2)}
              </Typography>
              <Typography>
                Paid: KES {parseFloat(currentReceipt.amount_paid).toFixed(2)}
              </Typography>
              {parseFloat(currentReceipt.change_given) > 0 && (
                <Typography>
                  Change: KES {parseFloat(currentReceipt.change_given).toFixed(2)}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReceiptDialog(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Receipt />}
            onClick={printReceipt}
          >
            Print Receipt
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default POSTerminal;
