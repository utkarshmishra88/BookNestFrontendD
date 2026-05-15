import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useThemeStore } from '@/store/themeStore';
import authService from '@/services/authService';
import wishlistService from '@/services/wishlistService';
import {
  FiBookOpen, FiSearch, FiShoppingCart, FiHeart,
  FiUser, FiLogOut, FiSettings, FiPackage,
  FiMenu, FiX, FiDollarSign, FiSun, FiMoon,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

/**
 * Top navigation bar — responsive, with cart badge, user dropdown,
 * search bar, and mobile drawer.
 */
const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const setWishlist = useWishlistStore((s) => s.setWishlist);
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const navigate = useNavigate();

  const { data: wishlistPayload } = useQuery(
    ['wishlist', user?.userId],
    () => wishlistService.getWishlistWithBooks(user.userId),
    {
      enabled: isAuthenticated && !!user?.userId,
      staleTime: 30_000,
      onSuccess: (data) => setWishlist(data?.wishlistItems ?? []),
    }
  );
  const wishlistCount = wishlistPayload?.wishlistItems?.length ?? 0;

  const [search, setSearch]           = useState('');
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [userOpen, setUserOpen]       = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const dropdownRef = useRef(null);

  // Detect scroll to add backdrop blur
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/books?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout API errors — still clear local state
    } finally {
      logout();
      toast.success('Logged out successfully');
      navigate('/');
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white dark:bg-ink-900/90 backdrop-blur-md border-b border-parchment-200 dark:border-ink-700 shadow-sm' : 'bg-parchment-50 dark:bg-ink-900 dark:border-ink-700'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ─────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center shadow-sm">
              <FiBookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl text-ink-900 dark:text-white">BookNest</span>
          </Link>

          {/* ── Desktop search ───────────────────── */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 dark:text-ink-400/60 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search books, authors…"
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-parchment-100 dark:bg-ink-800 border border-parchment-300 dark:border-ink-600 text-ink-800 dark:text-parchment-50 font-sans text-sm placeholder:text-ink-500 dark:text-ink-400/60 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 transition-all duration-200"
              />
            </div>
          </form>

          {/* ── Desktop nav actions ──────────────── */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={toggleDarkMode}
              className="p-2 mr-2 rounded-lg text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:text-white hover:bg-parchment-100 dark:bg-ink-800 dark:text-ink-300 dark:hover:text-white dark:hover:bg-ink-700 transition-colors"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            <NavLink
              to="/books"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg font-sans text-sm transition-colors
                 ${isActive ? 'text-sky-700 bg-sky-50 dark:bg-ink-800' : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:text-white hover:bg-parchment-100 dark:bg-ink-800'}`
              }
            >
              Catalogue
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink
                  to="/wishlist"
                  className={({ isActive }) =>
                    `relative p-2 rounded-lg transition-colors ${isActive ? 'text-sky-700 bg-sky-50 dark:bg-ink-800' : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:text-white hover:bg-parchment-100 dark:bg-ink-800'}`
                  }
                  title="Wishlist"
                >
                  <FiHeart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[1rem] h-4 px-0.5 rounded-full bg-sky-600 text-white text-[10px] font-sans font-medium flex items-center justify-center">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </NavLink>

                <NavLink
                  to="/cart"
                  className={({ isActive }) =>
                    `relative p-2 rounded-lg transition-colors ${isActive ? 'text-sky-700 bg-sky-50 dark:bg-ink-800' : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:text-white hover:bg-parchment-100 dark:bg-ink-800'}`
                  }
                  title="Cart"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] font-sans font-medium flex items-center justify-center">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </NavLink>
              </>
            )}

            {/* User dropdown */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-ink-700 dark:text-ink-300 hover:bg-parchment-100 dark:bg-ink-800 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-sky-600 flex items-center justify-center text-white text-xs font-sans font-medium">
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-sans text-sm max-w-[100px] truncate">{user?.fullName}</span>
                </button>

                {userOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-ink-800 rounded-xl border border-parchment-200 dark:border-ink-700 shadow-elevated py-1.5 animate-fade-in z-50">
                    <div className="px-4 py-2 border-b border-parchment-100 mb-1">
                      <p className="font-sans text-xs text-ink-500 dark:text-ink-400">Signed in as</p>
                      <p className="font-sans text-sm font-medium text-ink-800 dark:text-parchment-50 truncate">{user?.email}</p>
                    </div>
                    {[
                      { to: '/profile', icon: FiUser,    label: 'Profile' },
                      { to: '/orders',  icon: FiPackage,  label: 'My Orders' },
                      { to: '/wallet',  icon: FiDollarSign,   label: 'Wallet' },
                      ...(user?.role === 'ADMIN' ? [{ to: '/admin', icon: FiSettings, label: 'Admin Panel' }] : []),
                    ].map(({ to, icon: Icon, label }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm font-sans text-ink-700 dark:text-ink-300 hover:bg-parchment-50 dark:bg-ink-900 hover:text-ink-900 dark:text-white transition-colors"
                      >
                        <Icon className="w-4 h-4 text-ink-500 dark:text-ink-400" />
                        {label}
                      </Link>
                    ))}
                    <div className="border-t border-parchment-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm font-sans text-red-600 hover:bg-red-50 w-full transition-colors"
                      >
                        <FiLogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/login"    className="btn-secondary py-1.5 text-sm">Login</Link>
                <Link to="/register" className="btn-primary py-1.5 text-sm">Sign Up</Link>
              </div>
            )}
          </div>

          {/* ── Mobile menu toggle ───────────────── */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-ink-600 dark:text-ink-400 hover:bg-parchment-100 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700 transition-colors"
            >
              {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-ink-600 dark:text-ink-400 hover:bg-parchment-100 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700 transition-colors"
            >
              {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ─────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-ink-800 border-t border-parchment-200 dark:border-ink-700 shadow-lg animate-slide-up">
          <div className="px-4 py-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 dark:text-ink-400/60 w-4 h-4" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search books…"
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-parchment-100 dark:bg-ink-800 border border-parchment-300 dark:border-ink-600 text-ink-800 dark:text-parchment-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                />
              </div>
            </form>
          </div>
          <nav className="px-4 pb-4 space-y-1">
            {[
              { to: '/books', label: 'Catalogue' },
              ...(isAuthenticated ? [
                { to: '/cart',     label: `Cart (${itemCount})` },
                { to: '/wishlist', label: `Wishlist${wishlistCount ? ` (${wishlistCount})` : ''}` },
                { to: '/orders',   label: 'My Orders' },
                { to: '/wallet',   label: 'Wallet' },
                { to: '/profile',  label: 'Profile' },
              ] : []),
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg font-sans text-sm text-ink-700 dark:text-ink-300 hover:bg-parchment-50 dark:bg-ink-900 hover:text-ink-900 dark:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
            {isAuthenticated ? (
              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                className="block w-full text-left px-3 py-2 rounded-lg font-sans text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login"    className="flex-1 btn-secondary text-center text-sm py-2" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/register" className="flex-1 btn-primary text-center text-sm py-2" onClick={() => setMobileOpen(false)}>Sign Up</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
