import React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { FiUsers, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import adminService from '@/services/adminService';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AdminUsersPage = () => {
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useQuery('admin-users', adminService.listUsers);

  const toggleMutation = useMutation(
    ({ userId, active }) => adminService.setUserActive(userId, active),
    {
      onSuccess: () => {
        qc.invalidateQueries('admin-users');
        toast.success('User updated');
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
        <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-ink-800 flex items-center justify-center">
          <FiUsers className="w-5 h-5 text-sky-700" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-ink-900 dark:text-white">Users</h1>
          <p className="font-sans text-sm text-ink-500 dark:text-ink-400">View and manage customer accounts</p>
        </div>
      </div>

      <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-parchment-50 dark:bg-ink-900 border-b border-parchment-200 dark:border-ink-700">
              <tr>
                {['ID', 'Name', 'Email', 'Role', 'Active', 'Joined', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-sans text-xs font-medium text-ink-500 dark:text-ink-400 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-100">
              {users.map((u) => (
                <tr key={u.userId} className="hover:bg-parchment-50 dark:bg-ink-900/80">
                  <td className="px-4 py-3 font-mono text-xs text-ink-600 dark:text-ink-400">{u.userId}</td>
                  <td className="px-4 py-3 font-sans text-ink-800 dark:text-parchment-50">{u.fullName}</td>
                  <td className="px-4 py-3 text-ink-600 dark:text-ink-400 max-w-[200px] truncate">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={u.role === 'ADMIN' ? 'badge-red' : 'badge-sky'}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">{u.active ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-ink-600 dark:text-ink-400">
                    {u.createdAt ? format(new Date(u.createdAt), 'dd MMM yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {u.role === 'ADMIN' ? (
                      <span className="text-xs text-ink-400">—</span>
                    ) : (
                      <button
                        type="button"
                        disabled={toggleMutation.isLoading}
                        onClick={() =>
                          toggleMutation.mutate({ userId: u.userId, active: !u.active })
                        }
                        className="inline-flex items-center gap-1 text-xs font-sans text-sky-700 hover:text-sky-900"
                      >
                        {u.active ? (
                          <>
                            <FiToggleRight className="w-4 h-4" /> Deactivate
                          </>
                        ) : (
                          <>
                            <FiToggleLeft className="w-4 h-4" /> Activate
                          </>
                        )}
                      </button>
                    )}
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

export default AdminUsersPage;
