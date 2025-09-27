import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';

// Lazy-loaded components - use Material-UI based components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/AdminProducts')); // Use Material-UI version
const Orders = lazy(() => import('./pages/Orders'));
const Users = lazy(() => import('./pages/Users'));
const Reports = lazy(() => import('./pages/Reports'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <Toaster position="top-right" />
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            }>
              <Routes>
                <Route path="/admin/login" element={<Login />} />
                <Route path="/admin/*" element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="products" element={<Products />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="users" element={<Users />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="" element={<Navigate to="dashboard" replace />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
