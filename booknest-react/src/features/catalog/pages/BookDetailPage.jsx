import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiArrowLeft, FiStar, FiCalendar, FiBook, FiHash } from 'react-icons/fi';
import bookService from '@/services/bookService';
import reviewService from '@/services/reviewService';
import cartService from '@/services/cartService';
import wishlistService from '@/services/wishlistService';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import StarRating from '@/components/ui/StarRating';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const BookDetailPage = () => {
  const { id }  = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const { setCart } = useCartStore();
  const { bookIds, addBookId, removeBookId } = useWishlistStore();
  const qc = useQueryClient();

  const [reviewRating,  setReviewRating]  = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [qty, setQty] = useState(1);

  const { data: book, isLoading } = useQuery(
    ['book', id],
    () => bookService.getBook(id),
    { enabled: !!id }
  );

  const { data: reviews = [] } = useQuery(
    ['reviews', id],
    () => reviewService.getBookReviews(id),
    { enabled: !!id }
  );

  const categoryLabel = book?.category?.categoryName || book?.category?.name || book?.categoryName || '—';

  const isWishlisted = bookIds.has(Number(book?.bookId ?? id));

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    if (!book?.stock) { toast.error('Out of stock'); return; }
    try {
      const updated = await cartService.addToCart(user.userId, { bookId: book.bookId, quantity: qty });
      setCart(updated);
      toast.success('Added to cart!');
    } catch (err) { toast.error(err.message); }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
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
        toast.success('Added to wishlist!');
      }
    } catch (err) { toast.error(err.message); }
  };

  const submitReviewMutation = useMutation(
    () => reviewService.addReview(user.userId, { bookId: Number(id), rating: reviewRating, comment: reviewComment }),
    {
      onSuccess: () => {
        qc.invalidateQueries(['reviews', id]);
        setReviewRating(0);
        setReviewComment('');
        toast.success('Review submitted!');
      },
      onError: (err) => toast.error(err.message),
    }
  );

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!book)     return <EmptyState icon={FiBook} title="Book not found" />;

  return (
    <div className="page-container">
      {/* Back link */}
      <Link to="/books" className="inline-flex items-center gap-1.5 font-sans text-sm text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:text-parchment-50 mb-8 transition-colors">
        <FiArrowLeft className="w-4 h-4" /> Back to Catalogue
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
        {/* ── Cover ─────────────────────────────── */}
        <div className="lg:col-span-1">
          <motion.div
            className="sticky top-24"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-elevated bg-forest-800 max-w-xs mx-auto">
              {book.coverImageUrl ? (
                <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8">
                  <p className="font-display text-parchment-200 text-xl text-center leading-snug">{book.title}</p>
                  <p className="font-sans text-parchment-400 text-sm mt-3">{book.author}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Details ───────────────────────────── */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Category + rating */}
          <div className="flex items-center gap-3">
            <span className="badge-green">{categoryLabel}</span>
            {book.rating && (
              <div className="flex items-center gap-1.5">
                <FiStar className="w-4 h-4 text-brand-500 fill-current" />
                <span className="font-sans text-sm font-medium text-ink-700 dark:text-ink-300">{book.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div>
            <h1 className="font-display text-3xl md:text-4xl text-ink-900 dark:text-white leading-tight mb-2">{book.title}</h1>
            <p className="font-body text-lg text-ink-600 dark:text-ink-400">{book.author}</p>
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3 py-4 border-y border-parchment-200 dark:border-ink-700">
            {[
              { icon: FiHash,     label: 'ISBN',       val: book.isbn },
              { icon: FiBook,     label: 'Publisher',  val: book.publisher },
              { icon: FiCalendar, label: 'Published',  val: book.publishedDate ? format(new Date(book.publishedDate), 'MMM yyyy') : '—' },
              { icon: FiBook,     label: 'Stock',      val: book.stock > 0 ? `${book.stock} left` : 'Out of stock' },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-ink-400 flex-shrink-0" />
                <div>
                  <p className="font-sans text-xs text-ink-400">{label}</p>
                  <p className="font-sans text-sm text-ink-700 dark:text-ink-300">{val || '—'}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          {book.description && (
            <div>
              <h3 className="font-sans font-medium text-ink-800 dark:text-parchment-50 mb-2">About this book</h3>
              <p className="font-body text-ink-600 dark:text-ink-400 leading-relaxed text-sm">{book.description}</p>
            </div>
          )}

          {/* Price + actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div>
              <p className="font-sans text-xs text-ink-400 mb-0.5">Price</p>
              <p className="font-display text-3xl text-ink-900 dark:text-white">₹{Number(book.price ?? 0).toFixed(2)}</p>
            </div>

            {/* Quantity selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg border border-parchment-300 dark:border-ink-600 flex items-center justify-center hover:bg-parchment-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 font-sans font-medium"
              >−</button>
              <span className="font-sans text-sm w-6 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(book.stock, q + 1))}
                className="w-8 h-8 rounded-lg border border-parchment-300 dark:border-ink-600 flex items-center justify-center hover:bg-parchment-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 font-sans font-medium"
              >+</button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={handleAddToCart} disabled={book.stock <= 0} className="btn-primary px-6 py-2.5">
              <FiShoppingCart className="w-4 h-4" />
              {book.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button onClick={handleWishlist} className={`btn-secondary px-6 py-2.5 ${isWishlisted ? 'border-red-400 text-red-500 hover:bg-red-50' : ''}`}>
              <FiHeart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
              {isWishlisted ? 'Wishlisted' : 'Wishlist'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── Reviews ───────────────────────────────── */}
      <section className="border-t border-parchment-200 dark:border-ink-700 pt-10">
        <h2 className="section-title mb-8">Reader Reviews</h2>

        {/* Write review */}
        {isAuthenticated && (
          <div className="card p-5 mb-8 max-w-lg">
            <h3 className="font-sans font-medium text-ink-800 dark:text-parchment-50 mb-4">Write a Review</h3>
            <div className="mb-3">
              <label className="font-sans text-sm text-ink-600 dark:text-ink-400 mb-1.5 block">Rating</label>
              <StarRating value={reviewRating} onChange={setReviewRating} />
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your thoughts on this book…"
              rows={3}
              className="input-field resize-none mb-3"
            />
            <button
              onClick={() => submitReviewMutation.mutate()}
              disabled={reviewRating === 0 || submitReviewMutation.isLoading}
              className="btn-primary"
            >
              {submitReviewMutation.isLoading ? <Spinner size="sm" /> : 'Submit Review'}
            </button>
          </div>
        )}

        {/* Review list */}
        {reviews.length === 0 ? (
          <EmptyState icon={FiStar} title="No reviews yet" description="Be the first to review this book." />
        ) : (
          <div className="space-y-4 max-w-2xl">
            {reviews.map((r) => (
              <div key={r.reviewId} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <StarRating value={r.rating} readonly size="sm" />
                  <span className="font-sans text-xs text-ink-400">
                    {r.reviewDate ? format(new Date(r.reviewDate), 'MMM d, yyyy') : ''}
                  </span>
                </div>
                <p className="font-body text-sm text-ink-700 dark:text-ink-300">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default BookDetailPage;
