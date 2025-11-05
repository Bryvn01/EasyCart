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
    { field: "id", headerName: "Order ID", flex: 1 },
    { field: "customer", headerName: "Customer", flex: 1, valueGetter: (params) => params.row.customer_name || params.row.customer || "" },
    { field: "total", headerName: "Total", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "created_at", headerName: "Created", flex: 1 },
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
            <Box>
              <Typography variant="subtitle1">Order ID: {selectedOrder.id}</Typography>
              <Typography variant="subtitle1">Customer: {selectedOrder.customer_name || selectedOrder.customer || ""}</Typography>
              <Typography variant="subtitle1">Total: {selectedOrder.total}</Typography>
              <Typography variant="subtitle1">Status: {selectedOrder.status}</Typography>
              <Typography variant="subtitle1">Created: {selectedOrder.created_at}</Typography>
              {/* Add more order details as needed */}
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
