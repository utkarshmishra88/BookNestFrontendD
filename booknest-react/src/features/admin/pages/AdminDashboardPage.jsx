import React from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { FiBook, FiShoppingBag, FiDollarSign, FiUsers, FiTrendingUp } from 'react-icons/fi';
import bookService from '@/services/bookService';
import adminService from '@/services/adminService';
import { useAuthStore } from '@/store/authStore';

const StatCard = ({ icon: Icon, label, value, change, color }) => (
  <motion.div
    className="card p-5"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      {change && (
        <span className="flex items-center gap-1 text-xs font-sans text-forest-600">
          <FiTrendingUp className="w-3 h-3" /> {change}
        </span>
      )}
    </div>
    <p className="font-display text-2xl text-ink-900 dark:text-white">{value}</p>
    <p className="font-sans text-xs text-ink-500 dark:text-ink-400 mt-0.5">{label}</p>
  </motion.div>
);

const AdminDashboardPage = () => {
  const { user } = useAuthStore();

  const { data: books = [] } = useQuery(
    'admin-books',
    () => bookService.getBooks({ size: 100 }).then((d) => (Array.isArray(d) ? d : d?.content ?? []))
  );

  const { data: orders = [] } = useQuery('admin-orders-all', adminService.listAllOrders);

  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl text-ink-900 dark:text-white">Dashboard</h1>
        <p className="font-sans text-sm text-ink-500 dark:text-ink-400 mt-1">Welcome back, {user?.fullName}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={FiBook}      label="Total Books"    value={books.length}         color="bg-forest-50 text-forest-600" />
        <StatCard icon={FiShoppingBag} label="Total Orders" value={orders.length}        color="bg-brand-50 text-brand-600" />
        <StatCard icon={FiDollarSign} label="Revenue"      value={`₹${Number(totalRevenue ?? 0).toFixed(0)}`} color="bg-blue-50 text-blue-600" />
        <StatCard icon={FiUsers}     label="Active Stock"   value={books.reduce((sum, b) => sum + (b.stock || 0), 0)} color="bg-purple-50 text-purple-600" />
      </div>

      {/* Recent books table */}
      <div className="card">
        <div className="p-5 border-b border-parchment-100">
          <h2 className="font-sans font-medium text-ink-800 dark:text-parchment-50">Recent Books</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-parchment-50 dark:bg-ink-900 border-b border-parchment-200 dark:border-ink-700">
              <tr>
                {['Title', 'Author', 'Category', 'Price', 'Stock', 'Rating'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-sans text-xs font-medium text-ink-500 dark:text-ink-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-100">
              {books.slice(0, 10).map((book) => (
                <tr key={book.bookId} className="hover:bg-parchment-50 dark:bg-ink-900 transition-colors">
                  <td className="px-4 py-3 font-sans text-sm text-ink-800 dark:text-parchment-50 max-w-[180px] truncate">{book.title}</td>
                  <td className="px-4 py-3 font-sans text-sm text-ink-600 dark:text-ink-400 truncate max-w-[120px]">{book.author}</td>
                  <td className="px-4 py-3"><span className="badge-green">{book.category?.categoryName || book.category?.name || book.categoryName || '—'}</span></td>
                  <td className="px-4 py-3 font-sans text-sm text-ink-800 dark:text-parchment-50">₹{book.price?.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={book.stock > 0 ? 'badge-green' : 'badge-red'}>{book.stock}</span>
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-ink-600 dark:text-ink-400">{book.rating?.toFixed(1) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
