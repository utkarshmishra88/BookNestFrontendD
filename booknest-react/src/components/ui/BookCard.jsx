import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueryClient } from 'react-query';
import { FiStar, FiHeart, FiShoppingCart } from 'react-icons/fi';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import wishlistService from '@/services/wishlistService';
import cartService from '@/services/cartService';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

/**
 * BookCard — displays a book in the grid catalogue.
 * Handles add-to-cart and wishlist toggling inline.
 */
const BookCard = ({ book }) => {
  const { isAuthenticated, user } = useAuthStore();
  const { bookIds, addBookId, removeBookId } = useWishlistStore();
  const { setCart } = useCartStore();
  const qc = useQueryClient();
  const isWishlisted = bookIds.has(Number(book.bookId));
  const categoryLabel = book.category?.categoryName || book.category?.name || book.categoryName || 'Fiction';

  const handleWishlist = async (e) => {
    e.preventDefault(); // Prevent Link navigation
    if (!isAuthenticated) { toast.error('Please login to use wishlist'); return; }
    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(user.userId, book.bookId);
        removeBookId(book.bookId);
        qc.invalidateQueries(['wishlist', user.userId]);
        toast.success('Removed from wishlist');
      } else {
        await wishlistService.addToWishlist(user.userId, book.bookId);
        addBookId(book.bookId);
        qc.invalidateQueries(['wishlist', user.userId]);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to add to cart'); return; }
    if (book.stock <= 0) { toast.error('Out of stock'); return; }
    try {
      const updatedCart = await cartService.addToCart(user.userId, { bookId: book.bookId, quantity: 1 });
      setCart(updatedCart);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative"
    >
      <Link to={`/books/${book.bookId}`} className="block">
        <div className="card-hover overflow-hidden">
          {/* Cover image */}
          <div className="relative aspect-[2/3] overflow-hidden bg-parchment-100 dark:bg-ink-800">
            {book.coverImageUrl ? (
              <img
                src={book.coverImageUrl}
                alt={book.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-800 to-ink-800">
                <div className="text-center p-4">
                  <p className="font-display text-parchment-200 text-sm leading-tight line-clamp-4">{book.title}</p>
                  <p className="font-sans text-parchment-400 text-xs mt-2">{book.author}</p>
                </div>
              </div>
            )}

            {/* Stock badge */}
            {book.stock <= 0 && (
              <div className="absolute inset-0 bg-ink-900/60 flex items-center justify-center">
                <span className="badge-red font-medium">Out of Stock</span>
              </div>
            )}

            {/* Wishlist button */}
            <button
              onClick={handleWishlist}
              className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white dark:bg-ink-800/80 backdrop-blur-sm text-ink-600 dark:text-ink-400 hover:text-red-500'}`}
            >
              <FiHeart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Info */}
          <div className="p-3">
            <p className="font-sans text-xs text-ink-500 dark:text-ink-400 mb-0.5 truncate">{categoryLabel}</p>
            <h3 className="font-display text-sm text-ink-900 dark:text-white line-clamp-2 leading-snug mb-1">{book.title}</h3>
            <p className="font-sans text-xs text-ink-600 dark:text-ink-400 truncate">{book.author}</p>

            {/* Rating */}
            {book.rating && (
              <div className="flex items-center gap-1 mt-1.5">
                <FiStar className="w-3 h-3 text-brand-500 fill-current" />
                <span className="font-sans text-xs text-ink-600 dark:text-ink-400">{book.rating.toFixed(1)}</span>
              </div>
            )}

            {/* Price + Cart */}
            <div className="flex items-center justify-between mt-3">
              <span className="font-display text-base text-ink-900 dark:text-white">₹{Number(book.price ?? 0).toFixed(2)}</span>
              <button
                onClick={handleAddToCart}
                disabled={book.stock <= 0}
                className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center hover:bg-sky-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Add to cart"
              >
                <FiShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default BookCard;
