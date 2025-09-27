import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Typography
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const API_BASE = "/api/products";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: "",
    price: "",
    description: "",
    category: "",
    image: "",
  });

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      // backend returns { results: [...], count: ... }
      setProducts(res.data.results || res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Add or update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      setError("Name, price, and category are required.");
      return;
    }
    try {
      if (form.id) {
        await axios.put(`${API_BASE}/${form.id}`, form);
        setSuccess("Product updated successfully");
      } else {
        await axios.post(API_BASE, form);
        setSuccess("Product added successfully");
      }
      setShowForm(false);
      setForm({ id: null, name: "", price: "", description: "", category: "", image: "" });
      fetchProducts(); // refresh list from DB
    } catch (err) {
      console.error(err);
      setError("Failed to save product");
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setForm({
      id: product._id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image || "",
    });
    setShowForm(true);
  };

  // Delete product
  const handleDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      try {
        await axios.delete(`${API_BASE}/${id}`);
        setSuccess("Product deleted successfully");
        fetchProducts();
      } catch (err) {
        console.error(err);
        setError("Failed to delete product");
      }
    }
  };

  // DataGrid columns
  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    { field: "category", headerName: "Category", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Button size="small" variant="outlined" onClick={() => handleEdit(params.row)} sx={{ mr: 1 }}>
            Edit
          </Button>
          <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(params.row._id)}>
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Manage Products</Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setShowForm(true);
          setForm({ id: null, name: "", price: "", description: "", category: "", image: "" });
        }}
        sx={{ mb: 2 }}
      >
        Add Product
      </Button>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess("")}>
        <Alert onClose={() => setSuccess("")} severity="success">{success}</Alert>
      </Snackbar>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={products.map((p) => ({ ...p, id: p._id }))}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            disableSelectionOnClick
            autoHeight
          />
        </Box>
      )}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{form.id ? "Edit Product" : "Add Product"}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField margin="normal" label="Name" name="name" value={form.name} onChange={handleChange} fullWidth required />
            <TextField margin="normal" label="Price" name="price" type="number" value={form.price} onChange={handleChange} fullWidth required />
            <TextField margin="normal" label="Description" name="description" value={form.description} onChange={handleChange} fullWidth />
            <TextField margin="normal" label="Category" name="category" value={form.category} onChange={handleChange} fullWidth required />
            <TextField margin="normal" label="Image URL" name="image" value={form.image} onChange={handleChange} fullWidth />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" variant="contained">{form.id ? "Update" : "Add"}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminProducts;
