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
      {/* ── Sidebar ──────────────────────────────── */}
      <aside
        className={`${open ? 'w-60' : 'w-16'} flex-shrink-0 bg-ink-900 flex flex-col transition-all duration-300 ease-in-out`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-ink-700">
          {open && (
            <div className="flex items-center gap-2">
              <FiBookOpen className="text-parchment-300 w-5 h-5" />
              <span className="font-display text-lg text-parchment-100">Admin</span>
            </div>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="text-parchment-400 hover:text-parchment-100 transition-colors"
          >
            {open ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 font-sans text-sm
                 ${isActive
                   ? 'bg-sky-700 text-white'
                   : 'text-parchment-400 hover:bg-ink-700 hover:text-parchment-200'}`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {open && <span>{label}</span>}
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
            {open && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
