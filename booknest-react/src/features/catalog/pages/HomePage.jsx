import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiArrowRight, FiStar, FiBookOpen, FiTruck, FiShield } from 'react-icons/fi';
import bookService from '@/services/bookService';
import BookCard from '@/components/ui/BookCard';
import Spinner from '@/components/ui/Spinner';

const FEATURES = [
  { icon: FiBookOpen, title: '50,000+ Books',      desc: 'Curated titles across all genres' },
  { icon: FiStar,     title: 'Expert Curation',    desc: 'Hand-picked by literary critics' },
  { icon: FiTruck,    title: 'Fast Delivery',       desc: 'Delivered to your doorstep' },
  { icon: FiShield,   title: 'Secure Payments',    desc: 'Wallet, UPI & Card accepted' },
];

function pickRandomBooks(list, n) {
  if (!list?.length) return [];
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

const HomePage = () => {
  const location = useLocation();
  const { data: catalog, isLoading } = useQuery(
    ['home-catalog'],
    () => bookService.getBooks({}),
    { staleTime: 60_000 }
  );
  const raw = Array.isArray(catalog) ? catalog : catalog?.content ?? [];
  // location.key changes on each navigation so picks reshuffle when revisiting home
  const showcase = useMemo(() => pickRandomBooks(raw, 8), [raw, location.key]);

  return (
    <div>
      {/* ── Hero ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-900 via-sky-800 to-ink-900 text-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-parchment-400/30 bg-parchment-400/10 text-parchment-300 text-sm font-sans mb-6">
              <FiStar className="w-3.5 h-3.5" />
              India's Premier Literary Destination
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6">
              Every story<br />
              <span className="text-parchment-400 italic">finds its reader</span>
            </h1>

            <p className="font-body text-forest-200 text-lg leading-relaxed mb-8 max-w-lg">
              Discover curated literature, rare finds, and beloved classics. Your next favourite book is waiting.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/books" className="btn-gold px-6 py-3 text-base">
                Browse Catalogue <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-parchment-400/30 text-parchment-200 hover:bg-parchment-400/10 font-sans font-medium text-base transition-colors duration-200">
                Join Free
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z"
              fill="#fdfaf4"/>
          </svg>
        </div>
      </section>

      {/* ── Features strip ────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-1 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-ink-800 border border-parchment-200 dark:border-ink-700"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-ink-800 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-sky-600" />
              </div>
              <div>
                <p className="font-sans text-sm font-medium text-ink-800 dark:text-parchment-50">{title}</p>
                <p className="font-body text-xs text-ink-500 dark:text-ink-400 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Info section ──────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-sky-50 to-parchment-50 dark:to-ink-900 rounded-2xl p-8 md:p-12 border border-parchment-200 dark:border-ink-700">
          <h2 className="text-3xl md:text-4xl font-display text-ink-900 dark:text-white mb-4">
            Ready to explore the world of books?
          </h2>
          <p className="text-lg text-ink-600 dark:text-ink-400 mb-8 max-w-2xl">
            Start your literary journey today. Browse our collection, add books to your wishlist, and join our community of book lovers.
          </p>
          <Link to="/books" className="btn-primary px-8 py-3 text-lg inline-block mb-10">
            Explore Now →
          </Link>

          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : showcase.length > 0 ? (
            <div>
              <h3 className="font-sans text-sm font-medium text-ink-500 dark:text-ink-400 uppercase tracking-wide mb-4">Picks for you</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {showcase.map((book) => (
                  <BookCard key={book.bookId} book={book} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
