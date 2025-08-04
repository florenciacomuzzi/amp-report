import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import PropertyForm from './pages/PropertyForm';
import AnalysisTRPC from './pages/AnalysisTRPC';
import Reports from './pages/Reports';
import { RootState } from './store';
import { checkAuth } from './store/slices/authSlice';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(checkAuth() as any);
  }, [dispatch]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        Loading...
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/new" element={<PropertyForm />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/properties/:id/edit" element={<PropertyForm />} />
          <Route path="/properties/:id/analysis" element={<AnalysisTRPC />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;