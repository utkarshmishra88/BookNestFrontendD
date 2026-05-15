import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiTag, FiCalendar, FiDollarSign, FiCheck, FiX } from 'react-icons/fi';
import orderService from '@/services/orderService';
import toast from 'react-hot-toast';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';

const AdminCouponsPage = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountAmount: '',
    discountPercentage: '',
    maxDiscountAmount: '',
    minOrderAmount: '',
    active: true,
    expiryDate: ''
  });

  const { data: coupons = [], isLoading } = useQuery('admin-coupons', orderService.getCoupons);

  const createMutation = useMutation(orderService.createCoupon, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-coupons');
      toast.success('Coupon created!');
      setShowForm(false);
      setNewCoupon({ code: '', discountAmount: '', discountPercentage: '', maxDiscountAmount: '', minOrderAmount: '', active: true, expiryDate: '' });
    },
    onError: () => toast.error('Failed to create coupon.')
  });

  const deleteMutation = useMutation(orderService.deleteCoupon, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-coupons');
      toast.success('Coupon deleted.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newCoupon.discountPercentage > 0 && newCoupon.discountPercentage < 5) {
      toast.error('Minimum percentage discount is 5%');
      return;
    }
    createMutation.mutate(newCoupon);
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display text-ink-900 dark:text-white mb-2">Coupons & Discounts</h1>
          <p className="text-ink-500 dark:text-ink-400">Manage promotional codes for your store.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          {showForm ? <FiX /> : <FiPlus />} {showForm ? 'Cancel' : 'Create New Coupon'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <form onSubmit={handleSubmit} className="card p-6 bg-sky-50 dark:bg-ink-800/30 border-sky-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="label">Code</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="SAVE50"
                    required
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                  />
                </div>
                <div>
                  <label className="label">Percent (%)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="10"
                    min="5"
                    max="100"
                    value={newCoupon.discountPercentage}
                    onChange={(e) => setNewCoupon({...newCoupon, discountPercentage: e.target.value, discountAmount: ''})}
                  />
                </div>
                <div>
                  <label className="label">Max Cap (₹)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="200"
                    value={newCoupon.maxDiscountAmount}
                    onChange={(e) => setNewCoupon({...newCoupon, maxDiscountAmount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Min Order (₹)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="500"
                    required
                    value={newCoupon.minOrderAmount}
                    onChange={(e) => setNewCoupon({...newCoupon, minOrderAmount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Expiry</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={newCoupon.expiryDate}
                    onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                  />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="btn-primary w-full h-[42px]">Save Coupon</button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {coupons.length === 0 ? (
        <EmptyState icon={FiTag} title="No coupons active" description="Create your first coupon to boost sales." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <motion.div 
              key={coupon.couponId}
              className="card p-6 relative group border-2 border-transparent hover:border-sky-200 dark:border-ink-700 transition-all"
              layout
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 bg-sky-100 dark:bg-ink-800 text-sky-700 px-3 py-1 rounded-full text-sm font-bold">
                  <FiTag className="w-3 h-3" /> {coupon.code}
                </div>
                <button 
                  onClick={() => deleteMutation.mutate(coupon.couponId)}
                  className="text-ink-300 hover:text-red-500 transition-colors"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-ink-900 dark:text-white font-bold text-xl">
                  {coupon.discountPercentage > 0 ? (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <FiTag className="w-5 h-5 text-emerald-500" /> {coupon.discountPercentage}% Off
                      </div>
                      {coupon.maxDiscountAmount > 0 && (
                        <span className="text-xs text-ink-400 font-normal mt-1">Up to ₹{coupon.maxDiscountAmount}</span>
                      )}
                    </div>
                  ) : (
                    <><FiDollarSign className="w-5 h-5 text-emerald-500" /> ₹{coupon.discountAmount} Off</>
                  )}
                </div>
                <div className="text-sm text-ink-600 dark:text-ink-400">
                  On orders over <strong>₹{coupon.minOrderAmount}</strong>
                </div>
                <div className="flex items-center gap-2 text-xs text-ink-400">
                  <FiCalendar className="w-3 h-3" /> 
                  Expires: {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}
                </div>
              </div>

              <div className={`mt-4 pt-4 border-t border-parchment-100 flex items-center gap-2 text-xs font-bold ${coupon.active ? 'text-emerald-600' : 'text-red-500'}`}>
                {coupon.active ? <FiCheck /> : <FiX />} {coupon.active ? 'ACTIVE' : 'INACTIVE'}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCouponsPage;
