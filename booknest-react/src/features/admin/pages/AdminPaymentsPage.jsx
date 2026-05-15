import React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { FiCreditCard } from 'react-icons/fi';
import adminService from '@/services/adminService';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUSES = ['CREATED', 'SUCCESS', 'FAILED'];

const AdminPaymentsPage = () => {
  const qc = useQueryClient();
  const { data: payments = [], isLoading } = useQuery('admin-payments', adminService.listAllPayments);

  const statusMutation = useMutation(
    ({ paymentId, status }) => adminService.updatePaymentStatus(paymentId, status),
    {
      onSuccess: () => {
        qc.invalidateQueries('admin-payments');
        toast.success('Payment status updated');
      },
      onError: (e) => toast.error(e.message || 'Update failed'),
    }
  );

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <FiCreditCard className="w-5 h-5 text-emerald-700" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-ink-900 dark:text-white">Payments</h1>
          <p className="font-sans text-sm text-ink-500 dark:text-ink-400">All gateway records — adjust status when reconciling</p>
        </div>
      </div>

      <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-parchment-50 dark:bg-ink-900 border-b border-parchment-200 dark:border-ink-700">
              <tr>
                {['Pay ID', 'Order', 'User', 'Amount', 'Mode', 'Status', 'Gateway', 'Created', 'Manage'].map((h) => (
                  <th key={h} className="px-3 py-3 text-left font-sans text-xs font-medium text-ink-500 dark:text-ink-400 uppercase whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-100">
              {payments.map((p) => (
                <tr key={p.paymentId} className="hover:bg-parchment-50 dark:bg-ink-900/80">
                  <td className="px-3 py-2 font-mono text-xs">{p.paymentId}</td>
                  <td className="px-3 py-2">{p.orderId}</td>
                  <td className="px-3 py-2">{p.userId}</td>
                  <td className="px-3 py-2">₹{Number(p.amount ?? 0).toFixed(2)}</td>
                  <td className="px-3 py-2">{p.paymentMode}</td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        p.status === 'SUCCESS'
                          ? 'badge-green'
                          : p.status === 'FAILED'
                            ? 'badge-red'
                            : 'badge-gold'
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 max-w-[120px] truncate text-xs text-ink-500 dark:text-ink-400">
                    {p.gatewayPaymentId || p.gatewayOrderId || '—'}
                  </td>
                  <td className="px-3 py-2 text-xs text-ink-600 dark:text-ink-400 whitespace-nowrap">
                    {p.createdAt ? format(new Date(p.createdAt), 'dd MMM yyyy HH:mm') : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      className="text-xs border border-parchment-300 dark:border-ink-600 rounded-lg px-2 py-1 bg-white dark:bg-ink-800"
                      value={p.status}
                      disabled={statusMutation.isLoading}
                      onChange={(e) =>
                        statusMutation.mutate({ paymentId: p.paymentId, status: e.target.value })
                      }
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPaymentsPage;
