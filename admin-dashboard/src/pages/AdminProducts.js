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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  CircularProgress,
  Typography
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const API_BASE = "/api/products";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
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
    image: null,
  });

  // Fetch products and categories
  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(API_BASE + "/"),
      axios.get(API_BASE + "/categories/")
    ])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data);
        setCategories(catRes.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load products or categories");
        setLoading(false);
      });
  }, []);

  // Handle form input
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Add or update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      setError("Name, price, and category are required.");
      return;
    }
    setError("");
    try {
      let data;
      let config = {};
      if (form.image) {
        data = new FormData();
        data.append("name", form.name);
        data.append("price", form.price);
        data.append("description", form.description);
        data.append("category", form.category);
        data.append("image", form.image);
        config.headers = { "Content-Type": "multipart/form-data" };
      } else {
        data = {
          name: form.name,
          price: form.price,
          description: form.description,
          category: form.category,
        };
      }
      let res;
      if (form.id) {
        // Update
        res = await axios.put(`${API_BASE}/${form.id}/`, data, config);
        setProducts((prev) => prev.map((p) => (p.id === form.id ? res.data : p)));
        setSuccess("Product updated successfully");
      } else {
        // Add
        res = await axios.post(API_BASE + "/", data, config);
        setProducts((prev) => [...prev, res.data]);
        setSuccess("Product added successfully");
      }
      setShowForm(false);
      setForm({ id: null, name: "", price: "", description: "", category: "", image: null });
    } catch (err) {
      setError("Failed to save product");
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setForm({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      image: null, // Don't prefill image
    });
    setShowForm(true);
  };

  // Delete product
  const handleDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      try {
        await axios.delete(`${API_BASE}/${id}/`);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setSuccess("Product deleted successfully");
      } catch (err) {
        setError("Failed to delete product");
      }
    }
  };

  // DataGrid columns
  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      valueGetter: (params) => {
        const cat = categories.find((c) => c.id === Number(params.row.category));
        return cat ? cat.name : params.row.category_name || "";
      },
    },
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
          <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(params.row.id)}>
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Manage Products</Typography>
      <Button variant="contained" color="primary" onClick={() => { setShowForm(true); setForm({ id: null, name: "", price: "", description: "", category: "", image: null }); }} sx={{ mb: 2 }}>
        Add Product
      </Button>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess("")}> <Alert onClose={() => setSuccess("")} severity="success">{success}</Alert> </Snackbar>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={products.map((p) => ({ ...p, id: p.id }))}
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
            <TextField
              margin="normal"
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              margin="normal"
              label="Price"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              margin="normal"
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              fullWidth
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={form.category}
                label="Category"
                onChange={handleChange}
              >
                <MenuItem value=""><em>Select</em></MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" component="label" sx={{ mt: 2 }}>
              Upload Image
              <input name="image" type="file" accept="image/*" hidden onChange={handleChange} />
            </Button>
            {form.image && typeof form.image === "object" && (
              <Typography variant="body2" sx={{ mt: 1 }}>{form.image.name}</Typography>
            )}
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