import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  FiGrid, FiBook, FiShoppingBag, FiLogOut,
  FiMenu, FiX, FiBookOpen, FiTag, FiUsers, FiCreditCard, FiPercent, FiRss
} from 'react-icons/fi';

const NAV = [
  { to: '/admin',            icon: FiGrid,        label: 'Dashboard' },
  { to: '/admin/users',      icon: FiUsers,       label: 'Users' },
  { to: '/admin/categories', icon: FiTag,         label: 'Categories' },
  { to: '/admin/books',      icon: FiBook,        label: 'Books' },
  { to: '/admin/orders',     icon: FiShoppingBag, label: 'Orders' },
  { to: '/admin/payments',   icon: FiCreditCard,  label: 'Payments' },
  { to: '/admin/coupons',    icon: FiPercent,     label: 'Coupons' },
  { to: '/admin/broadcast',  icon: FiRss,         label: 'Broadcast' },
];

/** Admin layout with collapsible sidebar. */
const AdminLayout = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const handleLogout = async () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-parchment-50 dark:bg-ink-900 overflow-hidden">
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:relative ${
          open ? 'w-64 translate-x-0' : 'w-0 lg:w-20 -translate-x-full lg:translate-x-0'
        } bg-ink-900 flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-ink-700 h-16 flex-shrink-0">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <FiBookOpen className="text-parchment-300 w-5 h-5 flex-shrink-0" />
            <span className="font-display text-lg text-parchment-100">Admin</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-parchment-400 hover:text-parchment-100 transition-colors lg:hidden"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              onClick={() => {
                if (window.innerWidth < 1024) setOpen(false);
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 font-sans text-sm
                 ${isActive
                   ? 'bg-sky-700 text-white'
                   : 'text-parchment-400 hover:bg-ink-700 hover:text-parchment-200'}`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className={`${!open && 'lg:hidden'} transition-opacity duration-300`}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-2 py-4 border-t border-ink-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-parchment-400 hover:bg-red-900/40 hover:text-red-300 transition-all duration-150 font-sans text-sm"
          >
            <FiLogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`${!open && 'lg:hidden'}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top header */}
        <header className="lg:hidden h-16 flex items-center justify-between px-4 bg-white dark:bg-ink-900 border-b border-parchment-200 dark:border-ink-700 flex-shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="p-2 -ml-2 text-ink-600 dark:text-ink-400"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <FiBookOpen className="text-sky-600 w-5 h-5" />
            <span className="font-display text-lg text-ink-900 dark:text-white">Admin Panel</span>
          </div>
          <div className="w-8" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
