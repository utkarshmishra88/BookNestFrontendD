import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import bookService from '@/services/bookService';
import { sortBooks } from '@/lib/bookSort';
import BookCard from '@/components/ui/BookCard';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { FiBookOpen } from 'react-icons/fi';

const SORT_OPTIONS = [
  { value: 'title,asc',   label: 'Title A–Z' },
  { value: 'title,desc',  label: 'Title Z–A' },
  { value: 'price,asc',   label: 'Price: Low to High' },
  { value: 'price,desc',  label: 'Price: High to Low' },
  { value: 'rating,desc', label: 'Highest Rated' },
];

const BookListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch]   = useState(searchParams.get('search') || '');
  const [genre, setGenre]     = useState(searchParams.get('genre')  || '');
  const [sort, setSort]       = useState('title,asc');
  const [page, setPage]       = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const PAGE_SIZE = 12;

  // Fetch categories for filter panel
  const { data: categories } = useQuery('categories', bookService.getCategories, { staleTime: Infinity });

  // Fetch books (backend returns full list for /books, /search, /genre — sort & paginate in browser)
  const { data, isLoading, isFetching } = useQuery(
    ['books', { search, genre }],
    () => {
      if (search) return bookService.searchBooks(search);
      if (genre) return bookService.getByGenre(genre);
      return bookService.getBooks({});
    },
    { keepPreviousData: true }
  );

  const rawList = Array.isArray(data) ? data : data?.content ?? [];
  const sorted = useMemo(() => sortBooks(rawList, sort), [rawList, sort]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE) || 1);
  const books = useMemo(
    () => sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [sorted, page]
  );

  // Sync URL params on filter change
  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (genre) params.genre = genre;
    setSearchParams(params, { replace: true });
    setPage(0);
  }, [search, genre, sort]);

  const clearFilters = () => { setSearch(''); setGenre(''); setPage(0); };

  return (
    <div className="page-container">
      {/* ── Header ───────────────────────────────── */}
      <div className="mb-8">
        <h1 className="section-title mb-1">Book Catalogue</h1>
        <p className="font-body text-ink-500 dark:text-ink-400 text-sm">Explore our curated collection of books</p>
      </div>

      <div className="flex gap-6">
        {/* ── Sidebar filters (desktop) ─────────── */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="card p-4 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sans font-medium text-ink-800 dark:text-parchment-50 text-sm">Filters</h3>
              {(search || genre) && (
                <button onClick={clearFilters}
                  className="text-xs font-sans text-red-500 hover:text-red-700 flex items-center gap-1">
                  <FiX className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {/* Search */}
            <div className="mb-5">
              <label className="block font-sans text-xs font-medium text-ink-600 dark:text-ink-400 mb-1.5 uppercase tracking-wide">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Title, author…"
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-parchment-300 dark:border-ink-600 bg-white dark:bg-ink-800 text-sm text-ink-800 dark:text-parchment-50 focus:outline-none focus:ring-2 focus:ring-forest-400/40 focus:border-forest-400"
                />
              </div>
            </div>

            {/* Genre */}
            <div className="mb-5">
              <label className="block font-sans text-xs font-medium text-ink-600 dark:text-ink-400 mb-1.5 uppercase tracking-wide">Genre</label>
              <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-hide">
                <button
                  onClick={() => setGenre('')}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs font-sans transition-colors ${!genre ? 'bg-forest-50 text-forest-700 font-medium' : 'text-ink-600 dark:text-ink-400 hover:bg-parchment-50 dark:bg-ink-900'}`}
                >
                  All Genres
                </button>
                {(categories || []).map((cat) => (
                  <button
                    key={cat.categoryId}
                    onClick={() => setGenre(cat.categoryName || cat.name)}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs font-sans transition-colors ${genre === (cat.categoryName || cat.name) ? 'bg-forest-50 text-forest-700 font-medium' : 'text-ink-600 dark:text-ink-400 hover:bg-parchment-50 dark:bg-ink-900'}`}
                  >
                    {cat.categoryName || cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block font-sans text-xs font-medium text-ink-600 dark:text-ink-400 mb-1.5 uppercase tracking-wide">Sort By</label>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full appearance-none px-2.5 py-2 pr-7 rounded-lg border border-parchment-300 dark:border-ink-600 bg-white dark:bg-ink-800 text-xs text-ink-800 dark:text-parchment-50 focus:outline-none focus:ring-2 focus:ring-forest-400/40"
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 w-3.5 h-3.5 pointer-events-none" />
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main content ─────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter bar */}
          <div className="flex items-center gap-2 mb-4 lg:hidden">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-parchment-300 dark:border-ink-600 bg-white dark:bg-ink-800 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400/40"
              />
            </div>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-parchment-300 dark:border-ink-600 bg-white dark:bg-ink-800 text-sm font-sans text-ink-700 dark:text-ink-300"
            >
              <FiFilter className="w-4 h-4" /> Filters
            </button>
          </div>

          {/* Active filter pills */}
          {(search || genre) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {search && (
                <span className="badge-green gap-1.5">
                  Search: {search}
                  <button onClick={() => setSearch('')}><FiX className="w-3 h-3" /></button>
                </span>
              )}
              {genre && (
                <span className="badge-gold gap-1.5">
                  Genre: {genre}
                  <button onClick={() => setGenre('')}><FiX className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Book grid */}
          {isLoading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : books.length === 0 ? (
            <EmptyState
              icon={FiBookOpen}
              title="No books found"
              description="Try adjusting your search or filters to find what you're looking for."
              action={<button onClick={clearFilters} className="btn-secondary">Clear Filters</button>}
            />
          ) : (
            <>
              <div className={isFetching ? 'opacity-60 transition-opacity' : ''}>
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4"
                  layout
                >
                  <AnimatePresence mode="popLayout">
                    {books.map((book) => (
                      <motion.div
                        key={book.bookId}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                      >
                        <BookCard book={book} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="font-sans text-sm text-ink-600 dark:text-ink-400">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookListPage;
