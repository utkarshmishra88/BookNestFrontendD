import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import {
  FiCreditCard, FiDollarSign, FiTruck, FiCheck, FiShoppingBag, FiMapPin, FiPhone
} from 'react-icons/fi';
import cartService from '@/services/cartService';
import walletService from '@/services/walletService';
import orderService from '@/services/orderService';
import addressService from '@/services/addressService';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';
import { razorpayDisplayConfig } from '@/lib/razorpayCheckout';

const PAYMENT_MODES = [
  { id: 'COD',     label: 'Cash on Delivery', icon: FiTruck,      desc: 'Pay when your books arrive' },
  { id: 'WALLET',  label: 'Wallet Balance',    icon: FiDollarSign, desc: 'Use your BookNest wallet' },
  { id: 'CARD',    label: 'Card, UPI & more',  icon: FiCreditCard, desc: 'Razorpay — Card, UPI, netbanking, wallets' },
];

const CheckoutPage = () => {
  const { user }  = useAuthStore();
  const { items, total, clearCart, setCart } = useCartStore();
  const navigate  = useNavigate();
  const [payMode, setPayMode]    = useState('COD');
  const [placing, setPlacing]    = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Fetch addresses
  const { data: addresses = [] } = useQuery(
    ['addresses', user?.userId],
    () => addressService.getUserAddresses(user.userId),
    {
      enabled: !!user?.userId,
      onSuccess: (data) => {
        if (data.length > 0 && !selectedAddressId) {
          const defaultAddr = data.find(a => a.isDefault) || data[0];
          setSelectedAddressId(defaultAddr.addressId);
        }
      }
    }
  );

  // Fetch placed order details
  const { data: placedOrder, isLoading: orderLoading } = useQuery(
    ['order', user?.userId, placedOrderId],
    () => orderService.getOrderById(user.userId, placedOrderId),
    { enabled: !!placedOrderId }
  );

  // Fetch wallet balance for display
  const { data: wallet } = useQuery(
    ['wallet', user?.userId],
    () => walletService.getWallet(user.userId),
    { enabled: !!user?.userId }
  );

  // Load cart if empty (e.g. page refresh)
  const { isLoading } = useQuery(
    ['cart', user?.userId],
    () => cartService.getCart(user.userId),
    {
      enabled: !!user?.userId && items.length === 0,
      onSuccess: (data) => setCart(data),
    }
  );

  /**
   * Initiate Razorpay checkout for CARD/UPI/NETBANKING payments.
   * Flow:
   * 1. Order created via order-service with PENDING_PAYMENT status
   * 2. Razorpay order created via payment-service
   * 3. User completes payment in Razorpay modal
   * 4. Frontend verifies signature with order-service
   * 5. Order confirmed
   */
  const initiateRazorpay = (paymentData, orderId, paymentId, onTerminal) => {
    if (!window.Razorpay) {
      onTerminal?.();
      throw new Error('Razorpay SDK failed to load. Refresh and try again.');
    }

    const options = {
      key: paymentData?.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: total * 100, // Razorpay expects paise
      currency: 'INR',
      name: 'BookNest',
      description: 'Book Purchase',
      order_id: paymentData.razorpayOrderId,
      config: razorpayDisplayConfig(),
      handler: async (response) => {
        try {
          await orderService.verifyPayment(user.userId, {
            orderId,
            paymentId,
            razorpayOrderId:   response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          clearCart();
          setPlacedOrderId(orderId);
          setOrderDone(true);
          toast.success('Payment successful! Order confirmed.');
        } catch (err) {
          toast.error('Payment verification failed: ' + err.message);
        } finally {
          onTerminal?.();
        }
      },
      prefill: { name: user?.fullName, email: user?.email },
      theme: { color: '#2a6139' },
      modal: {
        ondismiss: () => {
          toast.error('Payment cancelled');
          onTerminal?.();
        }
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const result = await orderService.validateCoupon(couponCode.toUpperCase(), total);
      if (result.isValid) {
        setDiscountAmount(result.discountAmount);
        setAppliedCoupon(couponCode.toUpperCase());
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error('Could not validate coupon.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const finalTotal = Math.max(0, total - discountAmount);

  const handlePlaceOrder = async () => {
    if (items.length === 0) { 
      toast.error('Cart is empty'); 
      return; 
    }
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    // Validate payment method
    if (payMode === 'WALLET' && (wallet?.balance ?? 0) < finalTotal) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setPlacing(true);

    let cardFlowOpened = false;
    try {
      const orderResult = await orderService.placeOrder(user.userId, {
        paymentMode: payMode,
        shippingAddressId: selectedAddressId,
        couponCode: appliedCoupon,
      });

      if (payMode === 'COD') {
        clearCart();
        setPlacedOrderId(orderResult.orderId);
        setOrderDone(true);
        toast.success('Order placed successfully! Cash on delivery selected.');
      } else if (payMode === 'WALLET') {
        clearCart();
        setPlacedOrderId(orderResult.orderId);
        setOrderDone(true);
        toast.success('Order placed and wallet debited successfully!');
      } else if (payMode === 'CARD') {
        if (orderResult.paymentId && orderResult.razorpayOrderId) {
          cardFlowOpened = true;
          initiateRazorpay(
            orderResult,
            orderResult.orderId,
            orderResult.paymentId,
            () => setPlacing(false)
          );
        } else {
          throw new Error('Failed to create payment order');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      if (!cardFlowOpened) {
        setPlacing(false);
      }
    }
  };

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;

  if (orderDone) {
    if (orderLoading || !placedOrder) {
      return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
    }

    return (
      <div className="page-container flex flex-col items-center justify-center py-16 max-w-3xl mx-auto">
        <motion.div
          className="text-center w-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <div className="w-20 h-20 rounded-full bg-sky-100 dark:bg-ink-800 flex items-center justify-center mx-auto mb-6">
            <FiCheck className="w-10 h-10 text-sky-600" />
          </div>
          <h1 className="font-display text-3xl text-ink-900 dark:text-white mb-2">Order Confirmed!</h1>
          <p className="font-body text-ink-500 dark:text-ink-400 mb-8">Thank you for your purchase. We'll notify you when it ships.</p>
          
          <div className="card p-6 mb-8 text-left bg-white dark:bg-ink-800 shadow-sm border border-parchment-200 dark:border-ink-700">
            <h2 className="font-sans font-medium text-lg text-ink-900 dark:text-white border-b border-parchment-200 dark:border-ink-700 pb-3 mb-4">Order Details</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-ink-500 dark:text-ink-400 uppercase tracking-wide mb-1">Order Number</p>
                <p className="font-medium text-ink-800 dark:text-parchment-50 font-sans">#{placedOrder.orderId}</p>
              </div>
              <div>
                <p className="text-xs text-ink-500 dark:text-ink-400 uppercase tracking-wide mb-1">Payment Method</p>
                <p className="font-medium text-ink-800 dark:text-parchment-50 font-sans">{placedOrder.paymentMode}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {(placedOrder.orderItems || []).map((item) => (
                <div key={item.orderItemId ?? item.bookId} className="flex justify-between items-center font-sans text-sm text-ink-700 dark:text-ink-300 bg-parchment-50 dark:bg-ink-900 p-3 rounded-lg border border-parchment-100">
                  <span className="truncate mr-4">{item.title || item.book?.title || `Book #${item.bookId}`} ×{item.quantity}</span>
                  <span className="font-medium whitespace-nowrap">₹{(Number(item.price ?? 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center border-t border-parchment-200 dark:border-ink-700 pt-4">
              <span className="font-medium text-ink-800 dark:text-parchment-50 font-sans">Total Amount</span>
              <div className="text-right">
                {placedOrder.discountAmount > 0 && (
                  <p className="text-xs text-ink-400 line-through">₹{(placedOrder.totalAmount + placedOrder.discountAmount).toFixed(2)}</p>
                )}
                <span className="font-display text-2xl text-sky-600">₹{placedOrder.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/orders')} className="btn-primary">View All Orders</button>
            <button onClick={() => navigate('/books')}  className="btn-secondary">Continue Shopping</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="section-title">Checkout</h1>
        <p className="font-body text-ink-500 dark:text-ink-400 text-sm mt-1">Complete your purchase</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Address and Payment */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Delivery Address Selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-sans font-medium text-ink-800 dark:text-parchment-50 flex items-center gap-2">
                <FiMapPin className="text-sky-600" /> Delivery Address
              </h2>
              {addresses.length === 0 && (
                <button onClick={() => navigate('/profile')} className="text-sky-600 text-sm hover:underline font-medium">Add Address</button>
              )}
            </div>
            
            {addresses.length > 0 ? (
              <div className="grid gap-3">
                {addresses.map((addr) => (
                  <label 
                    key={addr.addressId} 
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${ selectedAddressId === addr.addressId ? 'border-sky-500 bg-sky-50 dark:bg-ink-800 shadow-sm' : 'border-parchment-200 dark:border-ink-700 bg-white hover:border-parchment-300 dark:border-ink-600' }`}
                  >
                    <input 
                      type="radio" 
                      name="delivery_address" 
                      checked={selectedAddressId === addr.addressId} 
                      onChange={() => setSelectedAddressId(addr.addressId)} 
                      className="mt-1 w-4 h-4 text-sky-600 border-parchment-300 dark:border-ink-600 focus:ring-sky-500" 
                    />
                    <div className="flex-1">
                      <p className="font-sans font-medium text-sm text-ink-900 dark:text-white flex items-center gap-2">
                        {addr.label || 'Address'} 
                        {addr.isDefault && <span className="text-[10px] uppercase tracking-wider bg-sky-100 dark:bg-ink-800 text-sky-700 px-2 py-0.5 rounded-full font-bold">Default</span>}
                      </p>
                      <p className="font-body text-sm text-ink-600 dark:text-ink-400 mt-1 leading-relaxed">
                        {[addr.line1, addr.line2, addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ')}
                      </p>
                      {addr.mobileNumber && (
                        <p className="font-sans text-xs text-ink-500 dark:text-ink-400 mt-2 flex items-center gap-1.5">
                          <FiPhone className="w-3 h-3" /> {addr.mobileNumber}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-6 border-2 border-dashed border-parchment-300 dark:border-ink-600 rounded-xl text-center bg-parchment-50 dark:bg-ink-900">
                <p className="text-ink-600 dark:text-ink-400 font-medium mb-2">No addresses found</p>
                <p className="text-ink-500 dark:text-ink-400 text-sm mb-4">Please add a delivery address to continue with your purchase.</p>
                <button onClick={() => navigate('/profile')} className="btn-secondary mx-auto">
                  Go to Profile to Add Address
                </button>
              </div>
            )}
          </div>

          {/* Payment method selection */}
          <div className="space-y-4">
            <h2 className="font-sans font-medium text-ink-800 dark:text-parchment-50">Select Payment Method</h2>
            {PAYMENT_MODES.map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              onClick={() => setPayMode(id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${payMode === id ? 'border-sky-500 bg-sky-50 dark:bg-ink-800' : 'border-parchment-200 dark:border-ink-700 bg-white dark:bg-ink-800 hover:border-parchment-400'}`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${payMode === id ? 'bg-sky-600 text-white' : 'bg-parchment-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className={`font-sans font-medium text-sm ${payMode === id ? 'text-ink-800 dark:text-parchment-50' : 'text-ink-900 dark:text-white'}`}>{label}</p>
                <p className="font-body text-xs text-ink-500 dark:text-ink-400 mt-0.5">
                  {id === 'WALLET' ? `Balance: ₹${(wallet?.balance ?? 0).toFixed(2)}` : desc}
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payMode === id ? 'border-sky-500 bg-sky-500' : 'border-parchment-300 dark:border-ink-600'}`}>
                {payMode === id && <div className="w-2 h-2 rounded-full bg-white dark:bg-ink-800" />}
              </div>
            </button>
          ))}
        </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24">
            <h3 className="font-sans font-medium text-ink-800 dark:text-parchment-50 mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto scrollbar-hide">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex justify-between font-sans text-xs text-ink-600 dark:text-ink-400">
                  <span className="truncate max-w-[60%]">{item.book?.title || `Book #${item.bookId}`} ×{item.quantity}</span>
                    <span>₹{(Number(item.price ?? 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-parchment-200 dark:border-ink-700 pt-4 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon Code"
                  className="input-field py-2 text-sm uppercase flex-1"
                />
                <button 
                  onClick={handleApplyCoupon}
                  disabled={isValidatingCoupon || !couponCode}
                  className="btn-secondary py-2 px-4 h-[42px] whitespace-nowrap text-sm"
                >
                  {isValidatingCoupon ? '...' : 'Apply'}
                </button>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-xs text-emerald-600 font-bold mb-3 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                  <span>Coupon {appliedCoupon} applied</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-ink-400">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600">
                    <span>Discount</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-display text-xl text-ink-900 dark:text-white mt-2 pt-2 border-t border-parchment-100">
                  <span>Total</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={placing || items.length === 0}
              className="btn-primary w-full justify-center"
            >
              {placing ? <Spinner size="sm" /> : (
                <><FiShoppingBag className="w-4 h-4" /> Place Order</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
