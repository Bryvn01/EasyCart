import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';

// Lazy-loaded components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const Orders = lazy(() => import('./pages/Orders'));
const Users = lazy(() => import('./pages/Users'));
const Reports = lazy(() => import('./pages/Reports'));
const AdminCategories = lazy(() => import('./pages/AdminCategories'));
const TwoFactorSetup = lazy(() => import('./pages/TwoFactorSetup'));
const POSRoutes = lazy(() => import('./pages/POS/index'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="App">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  style: {
                    background: '#10B981',
                  },
                },
                error: {
                  style: {
                    background: '#EF4444',
                  },
                },
              }}
            />
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
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
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="users" element={<Users />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="2fa" element={<TwoFactorSetup />} />
                        <Route path="pos/*" element={<POSRoutes />} />
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
