import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';


// Layout components
import MainLayout from '@/layouts/MainLayout';
import AdminLayout from '@/layouts/AdminLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Auth feature pages
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import VerifyOtpPage from '@/features/auth/pages/VerifyOtpPage';
import OAuthCallback from '@/features/auth/pages/OAuthCallback';
import AdminLoginPage from '@/features/auth/pages/AdminLoginPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';

// Catalog feature pages
import HomePage from '@/features/catalog/pages/HomePage';
import BookListPage from '@/features/catalog/pages/BookListPage';
import BookDetailPage from '@/features/catalog/pages/BookDetailPage';

// Cart, Wishlist, Checkout
import CartPage from '@/features/cart/pages/CartPage';
import WishlistPage from '@/features/wishlist/pages/WishlistPage';
import CheckoutPage from '@/features/checkout/pages/CheckoutPage';

// User account pages
import ProfilePage from '@/features/account/pages/ProfilePage';
import OrdersPage from '@/features/account/pages/OrdersPage';
import WalletPage from '@/features/wallet/pages/WalletPage';

// Admin pages
import AdminDashboardPage from '@/features/admin/pages/AdminDashboardPage';
import AdminBooksPage from '@/features/admin/pages/AdminBooksPage';
import AdminOrdersPage from '@/features/admin/pages/AdminOrdersPage';
import AdminCategoriesPage from '@/features/admin/pages/AdminCategoriesPage';
import AdminUsersPage from '@/features/admin/pages/AdminUsersPage';
import AdminPaymentsPage from '@/features/admin/pages/AdminPaymentsPage';
import AdminBroadcastPage from '@/features/admin/pages/AdminBroadcastPage';
import AdminCouponsPage from '@/features/admin/pages/AdminCouponsPage';

// Guards
import PrivateRoute from '@/components/routing/PrivateRoute';
import AdminRoute from '@/components/routing/AdminRoute';

/**
 * Root Application component.
 * Defines the top-level route tree using React Router v6.
 * Route groupings mirror the microservice boundaries (auth, catalog, cart, etc.).
 */
const App = () => {
  const { initAuth } = useAuthStore();
  const { isDarkMode } = useThemeStore();

  // Rehydrate auth state from localStorage on app mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Apply dark mode class to HTML root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <Routes>
      {/* ── Public Auth Routes ─────────────────────── */}
      <Route element={<AuthLayout />}>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/verify"   element={<VerifyOtpPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* ── Public / Mixed Routes (Main Layout) ───── */}
      <Route element={<MainLayout />}>
        <Route path="/"              element={<HomePage />} />
        <Route path="/books"         element={<BookListPage />} />
        <Route path="/books/:id"     element={<BookDetailPage />} />

        {/* ── Protected User Routes ──────────────── */}
        <Route element={<PrivateRoute />}>
          <Route path="/cart"      element={<CartPage />} />
          <Route path="/wishlist"  element={<WishlistPage />} />
          <Route path="/checkout"  element={<CheckoutPage />} />
          <Route path="/profile"   element={<ProfilePage />} />
          <Route path="/orders"    element={<OrdersPage />} />
          <Route path="/wallet"    element={<WalletPage />} />
        </Route>
      </Route>

      {/* ── Protected Admin Routes ─────────────────── */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin"           element={<AdminDashboardPage />} />
          <Route path="/admin/users"     element={<AdminUsersPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/books"     element={<AdminBooksPage />} />
          <Route path="/admin/orders"    element={<AdminOrdersPage />} />
          <Route path="/admin/payments"  element={<AdminPaymentsPage />} />
          <Route path="/admin/broadcast" element={<AdminBroadcastPage />} />
          <Route path="/admin/coupons"   element={<AdminCouponsPage />} />
        </Route>
      </Route>

      {/* ── Fallback ───────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
