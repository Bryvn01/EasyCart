import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import POSSessionManager from './SessionManager';
import POSTerminal from './Terminal';
import POSDashboard from './Dashboard';

const POSRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/pos/dashboard" replace />} />
      <Route path="/dashboard" element={<POSDashboard />} />
      <Route path="/session" element={<POSSessionManager />} />
      <Route path="/terminal" element={<POSTerminal />} />
    </Routes>
  );
};

export default POSRoutes;
