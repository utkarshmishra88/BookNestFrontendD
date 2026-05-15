import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiTrash2, FiArrowRight, FiMinus, FiPlus } from 'react-icons/fi';
import cartService from '@/services/cartService';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { user } = useAuthStore();
  const { items, setCart, total } = useCartStore();

  const { isLoading, refetch } = useQuery(
    ['cart', user?.userId],
    () => cartService.getCart(user.userId),
    {
      enabled: !!user?.userId,
      onSuccess: (data) => setCart(data),
    }
  );

  const handleRemove = async (bookId) => {
    try {
      const updated = await cartService.removeFromCart(user.userId, bookId);
      setCart(updated);
      toast.success('Removed from cart');
    } catch (err) { toast.error(err.message); }
  };

  const handleClear = async () => {
    try {
      await cartService.clearCart(user.userId);
      setCart({ cartItems: [] });
      toast.success('Cart cleared');
    } catch (err) { toast.error(err.message); }
  };

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">Shopping Cart</h1>
          <p className="font-body text-ink-500 dark:text-ink-400 text-sm mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        {items.length > 0 && (
          <button onClick={handleClear} className="flex items-center gap-1.5 font-sans text-sm text-red-500 hover:text-red-700">
            <FiTrash2 className="w-4 h-4" /> Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={FiShoppingCart}
          title="Your cart is empty"
          description="Looks like you haven't added any books yet."
          action={<Link to="/books" className="btn-primary">Browse Books</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.cartItemId}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className="card p-4 flex items-center gap-4"
                >
                  {/* Book cover */}
                  <Link to={`/books/${item.bookId}`} className="w-14 h-20 rounded-lg overflow-hidden bg-parchment-100 dark:bg-ink-800 flex-shrink-0">
                    {item.book?.coverImageUrl ? (
                      <img 
                        src={item.book.coverImageUrl} 
                        alt={item.book.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Cover'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-sky-800">
                        <span className="font-display text-parchment-300 text-xs text-center px-1 line-clamp-3">
                          {item.book?.title || `Book #${item.bookId}`}
                        </span>
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link to={`/books/${item.bookId}`} className="hover:text-sky-600 transition-colors">
                      <p className="font-display text-sm text-ink-900 dark:text-white line-clamp-1">{item.book?.title || `Book ID: ${item.bookId}`}</p>
                    </Link>
                    <p className="font-sans text-xs text-ink-500 dark:text-ink-400 mt-0.5">{item.book?.author || ''}</p>
                    <p className="font-display text-base text-ink-900 dark:text-white mt-2">₹{Number(item.price ?? 0).toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xs text-ink-500 dark:text-ink-400 mr-1">Qty: {item.quantity}</span>
                    <button
                      onClick={() => handleRemove(item.bookId)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-24">
              <h3 className="font-sans font-medium text-ink-800 dark:text-parchment-50 mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between font-sans text-sm text-ink-600 dark:text-ink-400">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{Number(total ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-sans text-sm text-ink-600 dark:text-ink-400">
                  <span>Shipping</span>
                  <span className="text-sky-600">Free</span>
                </div>
              </div>
              <div className="border-t border-parchment-200 dark:border-ink-700 pt-3 mb-5">
                <div className="flex justify-between font-display text-lg text-ink-900 dark:text-white">
                  <span>Total</span>
                  <span>₹{Number(total ?? 0).toFixed(2)}</span>
                </div>
              </div>
              <Link to="/checkout" className="btn-primary w-full justify-center">
                Proceed to Checkout <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
