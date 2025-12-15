import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const API_BASE = "/api/orders";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get(API_BASE + "/")
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load orders");
        setLoading(false);
      });
  }, []);

  const handleStatusUpdate = async (order, status) => {
    try {
      const res = await axios.patch(`${API_BASE}/${order.id}/`, { status });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? res.data : o)));
      setSuccess(`Order marked as ${status}`);
      setSelectedOrder(null);
    } catch {
      setError("Failed to update order status");
    }
  };

  const columns = [
    { field: "id", headerName: "Order ID", flex: 0.8 },
    {
      field: "customer",
      headerName: "Customer",
      flex: 1.5,
      valueGetter: (params) => {
        const user = params.row.user_details;
        if (user) {
          return user.username || user.email || `User #${user.id}`;
        }
        return "Guest Customer";
      },
    },
    {
      field: "total_amount",
      headerName: "Total",
      flex: 1,
      valueFormatter: (params) => {
        const amount = parseFloat(params.value || 0);
        return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      valueFormatter: (params) => {
        const status = params.value || 'pending';
        return status.charAt(0).toUpperCase() + status.slice(1);
      }
    },
    {
      field: "created_at",
      headerName: "Created",
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Button size="small" variant="outlined" onClick={() => setSelectedOrder(params.row)} sx={{ mr: 1 }}>
            View
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Manage Orders</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess("")}> <Alert onClose={() => setSuccess("")} severity="success">{success}</Alert> </Snackbar>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={orders.map((o) => ({ ...o, id: o.id }))}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            disableSelectionOnClick
            autoHeight
          />
        </Box>
      )}
      <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ '& > *': { mb: 1.5 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Order ID: #{selectedOrder.id}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Customer:</strong>{' '}
                {selectedOrder.user_details
                  ? (selectedOrder.user_details.username || selectedOrder.user_details.email || `User #${selectedOrder.user_details.id}`)
                  : "Guest Customer"}
              </Typography>
              {selectedOrder.user_details?.email && selectedOrder.user_details?.username && (
                <Typography variant="body2" sx={{ color: 'text.secondary', ml: 2 }}>
                  Email: {selectedOrder.user_details.email}
                </Typography>
              )}
              <Typography variant="subtitle1">
                <strong>Total:</strong> KES {parseFloat(selectedOrder.total_amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Status:</strong>{' '}
                <Box component="span" sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: selectedOrder.status === 'delivered' ? 'success.light' :
                           selectedOrder.status === 'shipped' ? 'info.light' :
                           selectedOrder.status === 'processing' ? 'warning.light' :
                           selectedOrder.status === 'cancelled' ? 'error.light' : 'grey.300',
                  color: selectedOrder.status === 'delivered' ? 'success.dark' :
                         selectedOrder.status === 'shipped' ? 'info.dark' :
                         selectedOrder.status === 'processing' ? 'warning.dark' :
                         selectedOrder.status === 'cancelled' ? 'error.dark' : 'text.primary',
                  fontWeight: 'medium',
                  fontSize: '0.875rem'
                }}>
                  {(selectedOrder.status || 'pending').charAt(0).toUpperCase() + (selectedOrder.status || 'pending').slice(1)}
                </Box>
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                <strong>Created:</strong> {new Date(selectedOrder.created_at).toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
              {selectedOrder.payment_method && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>Payment:</strong> {selectedOrder.payment_method.toUpperCase()}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedOrder && selectedOrder.status !== "shipped" && (
            <Button onClick={() => handleStatusUpdate(selectedOrder, "shipped")} variant="contained" color="primary">Mark as Shipped</Button>
          )}
          {selectedOrder && selectedOrder.status !== "delivered" && (
            <Button onClick={() => handleStatusUpdate(selectedOrder, "delivered")} variant="contained" color="success">Mark as Delivered</Button>
          )}
          <Button onClick={() => setSelectedOrder(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminOrders;
