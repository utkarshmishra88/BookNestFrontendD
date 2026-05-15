import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/**
 * AdminRoute — restricts access to users with role === 'ADMIN'.
 * Non-admins are redirected to the homepage.
 */
const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;

  return <Outlet />;
};

export default AdminRoute;
