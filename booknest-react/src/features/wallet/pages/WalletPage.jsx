import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { FiDollarSign, FiPlus, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import walletService from '@/services/walletService';
import { useAuthStore } from '@/store/authStore';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { razorpayDisplayConfig } from '@/lib/razorpayCheckout';

const WalletPage = () => {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const QUICK_AMOUNTS = [100, 250, 500, 1000];

  const { data: wallet, isLoading } = useQuery(
    ['wallet', user?.userId],
    () => walletService.getWallet(user.userId),
    { enabled: !!user?.userId }
  );

  /**
   * Wallet topup via payment-service flow:
   * 1. Call wallet-service /wallets/:userId/topup/create-order
   *    → which delegates to payment-service for Razorpay order
   * 2. Open Razorpay modal
   * 3. On success, call wallet-service /wallets/:userId/topup/verify
   *    → which verifies payment and credits wallet
   */
  const handleTopUp = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 10) { 
      toast.error('Minimum ₹10 required'); 
      return; 
    }

    setLoading(true);
    try {
      // Step 1: Create topup order via payment-service
      const topupOrderResp = await walletService.createTopupOrder(user.userId, { amount: amt });

      if (!topupOrderResp.razorpayOrderId) {
        throw new Error('Failed to create payment order');
      }

      // Step 2: Open Razorpay (payment-service returns key id + order id)
      const options = {
        key: topupOrderResp.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amt * 100, // Razorpay expects paise
        currency: 'INR',
        name: 'BookNest Wallet',
        description: 'Wallet Top-up',
        order_id: topupOrderResp.razorpayOrderId,
        config: razorpayDisplayConfig(),
        handler: async (response) => {
          try {
            await walletService.verifyTopup(user.userId, {
              paymentId: topupOrderResp.paymentId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            qc.invalidateQueries(['wallet']);
            setAmount('');
            toast.success(`₹${amt} added to wallet!`);
          } catch (err) {
            toast.error('Payment verification failed: ' + err.message);
          } finally {
            setLoading(false);
          }
        },
        prefill: { name: user?.fullName, email: user?.email },
        theme: { color: '#2a6139' },
        modal: {
          ondismiss: () => {
            toast.error('Top-up cancelled');
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);
    } catch (err) { 
      toast.error(err.message); 
      setLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;

  const statements = wallet?.statements ?? [];

  return (
    <div className="page-container max-w-2xl">
      <h1 className="section-title mb-8">My Wallet</h1>

      {/* Balance card */}
      <motion.div
        className="rounded-2xl bg-gradient-to-br from-forest-800 to-ink-800 text-white p-7 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-white dark:bg-ink-800/10 flex items-center justify-center">
            <FiDollarSign className="w-4 h-4 text-parchment-300" />
          </div>
          <p className="font-sans text-parchment-300 text-sm">Available Balance</p>
        </div>
        <p className="font-display text-5xl text-parchment-100 mb-1">
          ₹{(wallet?.balance ?? 0).toFixed(2)}
        </p>
        <p className="font-sans text-parchment-400 text-xs">BookNest Wallet</p>
      </motion.div>

      {/* Top-up section */}
      <div className="card p-5 mb-6">
        <h3 className="font-sans font-medium text-ink-800 dark:text-parchment-50 mb-4">Add Money</h3>
        <div className="flex gap-2 flex-wrap mb-4">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => setAmount(String(a))}
              className={`px-3 py-1.5 rounded-lg text-sm font-sans border transition-colors ${String(amount) === String(a) ? 'bg-forest-600 text-white border-forest-600' : 'border-parchment-300 dark:border-ink-600 text-ink-700 dark:text-ink-300 hover:bg-parchment-50 dark:bg-ink-900'}`}
            >
              ₹{a}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="input-field flex-1"
            min="10"
          />
          <button onClick={handleTopUp} disabled={loading} className="btn-primary whitespace-nowrap">
            {loading ? <Spinner size="sm" /> : <><FiPlus className="w-4 h-4" /> Add Money</>}
          </button>
        </div>
      </div>

      {/* Transaction history */}
      <div className="card p-5">
        <h3 className="font-sans font-medium text-ink-800 dark:text-parchment-50 mb-4">Transaction History</h3>
        {statements.length === 0 ? (
          <p className="font-body text-sm text-ink-500 dark:text-ink-400 text-center py-6">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {statements.map((s) => (
              <div key={s.statementId} className="flex items-center justify-between py-2 border-b border-parchment-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.transactionType === 'CREDIT' ? 'bg-green-50' : 'bg-red-50'}`}>
                    {s.transactionType === 'CREDIT'
                      ? <FiTrendingUp  className="w-4 h-4 text-green-600" />
                      : <FiTrendingDown className="w-4 h-4 text-red-500" />}
                  </div>
                  <div>
                    <p className="font-sans text-sm text-ink-800 dark:text-parchment-50">
                      {s.transactionType === 'CREDIT' ? 'Wallet Top-up' : 'Order Payment'}
                    </p>
                    <p className="font-sans text-xs text-ink-400">
                      {s.transactionDate ? format(new Date(s.transactionDate), 'MMM d, yyyy HH:mm') : 'N/A'}
                    </p>
                  </div>
                </div>
                <span className={`font-sans font-medium text-sm ${s.transactionType === 'CREDIT' ? 'text-green-600' : 'text-red-500'}`}>
                  {s.transactionType === 'CREDIT' ? '+' : '−'}₹{s.amount?.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
