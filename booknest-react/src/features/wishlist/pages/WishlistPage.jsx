import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import wishlistService from '@/services/wishlistService';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const { user }  = useAuthStore();
  const { setWishlist, removeBookId } = useWishlistStore();
  const { setCart } = useCartStore();
  const qc = useQueryClient();

  const { data: wishlist, isLoading } = useQuery(
    ['wishlist', user?.userId],
    () => wishlistService.getWishlistWithBooks(user.userId),
    {
      enabled: !!user?.userId,
      onSuccess: (data) => setWishlist(data?.wishlistItems ?? []),
    }
  );

  const items = wishlist?.wishlistItems ?? [];

  const removeMutation = useMutation(
    (bookId) => wishlistService.removeFromWishlist(user.userId, bookId),
    {
      onSuccess: (_, bookId) => {
        removeBookId(bookId);
        qc.invalidateQueries(['wishlist']);
        toast.success('Removed from wishlist');
      },
      onError: (err) => toast.error(err.message),
    }
  );

  const moveToCartMutation = useMutation(
    (bookId) => wishlistService.moveToCart(user.userId, bookId),
    {
      onSuccess: (updatedCart, bookId) => {
        setCart(updatedCart);
        removeBookId(bookId);
        qc.invalidateQueries(['wishlist']);
        toast.success('Moved to cart!');
      },
      onError: (err) => toast.error(err.message),
    }
  );

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="section-title">My Wishlist</h1>
        <p className="font-body text-ink-500 dark:text-ink-400 text-sm mt-1">{items.length} saved book{items.length !== 1 ? 's' : ''}</p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={FiHeart}
          title="Your wishlist is empty"
          description="Save books you love for later!"
          action={<Link to="/books" className="btn-primary">Explore Books</Link>}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.wishlistItemId ?? item.bookId}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="card overflow-hidden group"
              >
                {/* Cover */}
                <Link to={`/books/${item.bookId}`}>
                  <div className="aspect-[2/3] bg-gradient-to-br from-forest-800 to-ink-800 flex items-center justify-center">
                    {item.book?.coverImageUrl ? (
                      <img src={item.book.coverImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <p className="font-display text-parchment-200 text-xs text-center px-3 line-clamp-4">
                        {item.book?.title || `Book #${item.bookId}`}
                      </p>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="p-3">
                  <p className="font-display text-xs text-ink-900 dark:text-white line-clamp-2 mb-1">{item.book?.title}</p>
                  {item.book?.price && (
                    <p className="font-sans text-sm font-medium text-ink-800 dark:text-parchment-50 mb-3">₹{Number(item.book?.price ?? 0).toFixed(2)}</p>
                  )}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => moveToCartMutation.mutate(item.bookId)}
                      disabled={moveToCartMutation.isLoading}
                      className="flex-1 btn-primary py-1.5 text-xs"
                      title="Move to cart"
                    >
                      <FiShoppingCart className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeMutation.mutate(item.bookId)}
                      className="w-8 h-8 rounded-lg border border-parchment-300 dark:border-ink-600 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Remove"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
