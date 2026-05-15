import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPackage, FiCheck, FiClock, FiX, FiDownload, FiMapPin, FiCreditCard, FiArrowRight 
} from 'react-icons/fi';
import orderService from '@/services/orderService';
import { useAuthStore } from '@/store/authStore';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  COMPLETED: { label: 'Completed', icon: FiCheck, cls: 'badge-sky' },
  CONFIRMED: { label: 'Confirmed', icon: FiCheck, cls: 'badge-sky' },
  PENDING_PAYMENT: { label: 'Pending Payment', icon: FiClock, cls: 'badge-gold' },
  PENDING:   { label: 'Pending',   icon: FiClock, cls: 'badge-gold' },
  CANCELLED: { label: 'Cancelled', icon: FiX,     cls: 'badge-red' },
  FAILED:    { label: 'Failed',    icon: FiX,     cls: 'badge-red' },
};

const OrdersPage = () => {
  const { user } = useAuthStore();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const { data: orders = [], isLoading } = useQuery(
    ['orders', user?.userId],
    () => orderService.getOrders(user.userId),
    { enabled: !!user?.userId }
  );

  const handleDownload = async (type, orderId) => {
    setDownloading(true);
    try {
      if (type === 'receipt') {
        await orderService.downloadReceipt(user.userId, orderId);
      } else {
        await orderService.downloadInvoice(user.userId, orderId);
      }
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} downloaded.`);
    } catch (err) {
      toast.error('Failed to download file.');
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;

  return (
    <div className="page-container max-w-4xl">
      <h1 className="section-title mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={FiPackage}
          title="No orders yet"
          description="Your completed orders will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order, i) => {
            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = status.icon;
            return (
              <motion.div
                key={order.orderId}
                className="card p-5 cursor-pointer hover:border-sky-300 transition-colors group"
                onClick={() => setSelectedOrder(order)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-sans text-xs text-ink-400 uppercase tracking-wide">Order #{order.orderId}</p>
                    <p className="font-sans text-sm text-ink-600 dark:text-ink-400">
                      {order.createdAt ? format(new Date(order.createdAt), 'MMM d, yyyy') : ''}
                    </p>
                  </div>
                  <span className={`${status.cls} flex items-center gap-1`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {(order.items || []).slice(0, 2).map((item) => (
                    <div key={item.orderItemId} className="font-sans text-sm text-ink-700 dark:text-ink-300 truncate">
                      {item.title} <span className="text-ink-400">×{item.quantity}</span>
                    </div>
                  ))}
                  {order.items?.length > 2 && (
                    <p className="text-xs text-ink-400">+{order.items.length - 2} more items</p>
                  )}
                </div>

                <div className="border-t border-parchment-100 pt-3 flex items-center justify-between">
                  <span className="font-display text-lg text-ink-900 dark:text-white">₹{order.totalAmount?.toFixed(2)}</span>
                  <span className="text-sky-600 flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View Details <FiArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div 
              className="card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="p-6 border-b border-parchment-200 dark:border-ink-700 flex items-center justify-between bg-parchment-50 dark:bg-ink-900/50">
                <div>
                  <h2 className="font-display text-xl text-ink-900 dark:text-white">Order #{selectedOrder.orderId}</h2>
                  <p className="font-sans text-sm text-ink-500 dark:text-ink-400">
                    Placed on {format(new Date(selectedOrder.createdAt), 'MMMM d, yyyy · h:mm a')}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-parchment-200 dark:bg-ink-700 transition-colors"
                >
                  <FiX className="w-5 h-5 text-ink-600 dark:text-ink-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Status and Payment Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-ink-400 uppercase tracking-widest mb-2 font-bold">Status</p>
                      <span className={`${STATUS_CONFIG[selectedOrder.status]?.cls || 'badge-gold'} text-sm`}>
                        {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-ink-400 uppercase tracking-widest mb-2 font-bold font-sans">Payment Method</p>
                      <div className="flex items-center gap-2 text-ink-700 dark:text-ink-300">
                        <FiCreditCard className="w-4 h-4 text-sky-600" />
                        <span className="text-sm font-medium">{selectedOrder.paymentMode}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {selectedOrder.paymentId && (
                      <div>
                        <p className="text-xs text-ink-400 uppercase tracking-widest mb-1 font-bold">Payment ID</p>
                        <p className="text-sm font-mono text-ink-600 dark:text-ink-400 break-all">{selectedOrder.paymentId}</p>
                      </div>
                    )}
                    {selectedOrder.paymentGatewayOrderId && (
                      <div>
                        <p className="text-xs text-ink-400 uppercase tracking-widest mb-1 font-bold">Gateway Order ID</p>
                        <p className="text-sm font-mono text-ink-600 dark:text-ink-400 break-all">{selectedOrder.paymentGatewayOrderId}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs text-ink-400 uppercase tracking-widest mb-4 font-bold">Order Items</p>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.orderItemId} className="flex gap-4 p-3 rounded-xl bg-parchment-50 dark:bg-ink-900 border border-parchment-100">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.title} className="w-12 h-16 object-cover rounded shadow-sm" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm font-semibold text-ink-900 dark:text-white truncate">{item.title}</p>
                          <p className="font-sans text-xs text-ink-500 dark:text-ink-400">{item.author}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-ink-600 dark:text-ink-400">₹{item.price} × {item.quantity}</span>
                            <span className="text-sm font-bold text-ink-800 dark:text-parchment-50">₹{item.lineTotal?.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="pt-6 border-t border-parchment-200 dark:border-ink-700">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-ink-600 dark:text-ink-400 font-sans">Total Amount Paid</span>
                    <span className="text-2xl font-display text-ink-900 dark:text-white">₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      disabled={downloading}
                      onClick={() => handleDownload('invoice', selectedOrder.orderId)}
                      className="btn-secondary w-full flex items-center justify-center gap-2 py-3"
                    >
                      <FiDownload className="w-4 h-4" /> Download Invoice
                    </button>
                    <button
                      disabled={downloading}
                      onClick={() => handleDownload('receipt', selectedOrder.orderId)}
                      className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                    >
                      <FiDownload className="w-4 h-4" /> Download Receipt
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersPage;
