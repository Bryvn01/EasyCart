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

const API_BASE = "/api/products/categories";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ id: null, name: "" });

  useEffect(() => {
    setLoading(true);
    axios.get(API_BASE + "/")
      .then((res) => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load categories");
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      setError("Category name is required.");
      return;
    }
    setError("");
    try {
      let res;
      if (form.id) {
        res = await axios.put(`${API_BASE}/${form.id}/`, { name: form.name });
        setCategories((prev) => prev.map((c) => (c.id === form.id ? res.data : c)));
        setSuccess("Category updated successfully");
      } else {
        res = await axios.post(API_BASE + "/", { name: form.name });
        setCategories((prev) => [...prev, res.data]);
        setSuccess("Category added successfully");
      }
      setShowForm(false);
      setForm({ id: null, name: "" });
    } catch {
      setError("Failed to save category");
    }
  };

  const handleEdit = (cat) => {
    setForm({ id: cat.id, name: cat.name });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this category?")) {
      try {
        await axios.delete(`${API_BASE}/${id}/`);
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setSuccess("Category deleted successfully");
      } catch {
        setError("Failed to delete category");
      }
    }
  };

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
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
      <Typography variant="h4" sx={{ mb: 2 }}>Manage Categories</Typography>
      <Button variant="contained" color="primary" onClick={() => { setShowForm(true); setForm({ id: null, name: "" }); }} sx={{ mb: 2 }}>
        Add Category
      </Button>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess("")}> <Alert onClose={() => setSuccess("")} severity="success">{success}</Alert> </Snackbar>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={categories.map((c) => ({ ...c, id: c.id }))}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            disableSelectionOnClick
            autoHeight
          />
        </Box>
      )}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{form.id ? "Edit Category" : "Add Category"}</DialogTitle>
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

export default AdminCategories;