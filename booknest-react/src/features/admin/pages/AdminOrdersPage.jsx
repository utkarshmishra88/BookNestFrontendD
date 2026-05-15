import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import orderService from '@/services/orderService';
import Spinner from '@/components/ui/Spinner';
import { format } from 'date-fns';

const STATUS_COLORS = {
  CONFIRMED: 'badge-green',
  PENDING_PAYMENT: 'badge-gold',
  FAILED: 'badge-red',
};

const AdminOrdersPage = () => {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery('admin-orders-all', orderService.getAdminOrders);

  const updateStatusMutation = useMutation(
    ({ orderId, status }) => orderService.updateOrderStatus(orderId, status),
    {
      onSuccess: () => {
        toast.success('Order status updated');
        queryClient.invalidateQueries('admin-orders-all');
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Failed to update status');
      }
    }
  );

  const filtered = orders.filter((o) =>
    String(o.orderId).includes(search) ||
    o.paymentMode?.toLowerCase().includes(search.toLowerCase()) ||
    o.status?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink-900 dark:text-white">All Orders</h1>
        <span className="badge-gray">{orders.length} total</span>
      </div>

      <div className="relative mb-5 max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID, status…"
          className="input-field pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-parchment-50 dark:bg-ink-900 border-b border-parchment-200 dark:border-ink-700">
              <tr>
                {['Order ID', 'Date', 'Items', 'Total', 'Payment', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-sans text-xs font-medium text-ink-500 dark:text-ink-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-100">
              {filtered.map((order) => (
                <tr key={order.orderId} className="hover:bg-parchment-50 dark:bg-ink-900 transition-colors">
                  <td className="px-4 py-3 font-sans text-sm font-medium text-ink-800 dark:text-parchment-50">#{order.orderId}</td>
                  <td className="px-4 py-3 font-sans text-xs text-ink-600 dark:text-ink-400">
                    {order.createdAt ? format(new Date(order.createdAt), 'MMM d, yyyy HH:mm') : '—'}
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-ink-600 dark:text-ink-400">{order.orderItems?.length ?? 0}</td>
                  <td className="px-4 py-3 font-sans text-sm font-medium text-ink-800 dark:text-parchment-50">₹{order.totalAmount?.toFixed(2)}</td>
                  <td className="px-4 py-3"><span className="badge-gray">{order.paymentMode}</span></td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatusMutation.mutate({ orderId: order.orderId, status: e.target.value })}
                      disabled={updateStatusMutation.isLoading}
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border-r-8 border-transparent focus:ring-0 cursor-pointer bg-opacity-20 ${ order.status === 'CONFIRMED' || order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : order.status === 'FAILED' || order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800' }`}
                    >
                      <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="FAILED">FAILED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
