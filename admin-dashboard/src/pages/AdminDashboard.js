import React from "react";
import { Link, Outlet } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

const navLinks = [
  { to: "products", label: "Products" },
  { to: "categories", label: "Categories" },
  { to: "orders", label: "Orders" },
];

const AdminDashboard = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          {navLinks.map((link) => (
            <Button
              key={link.to}
              color="inherit"
              component={Link}
              to={link.to}
              sx={{ ml: 2 }}
            >
              {link.label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default AdminDashboard;
