import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBookOpen } from 'react-icons/fi';

/**
 * Minimal auth layout — full-page split design.
 * Left: decorative brand panel. Right: form content via <Outlet />.
 */
const AuthLayout = () => (
  <div className="min-h-screen flex">
    {/* ── Left brand panel (hidden on mobile) ─── */}
    <div className="hidden lg:flex lg:w-1/2 bg-sky-800 flex-col justify-between p-12 relative overflow-hidden">
      {/* Decorative rings */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full border border-sky-600/30" />
      <div className="absolute -top-16 -left-16 w-96 h-96 rounded-full border border-sky-600/20" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full border border-sky-600/30" />

      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 z-10">
        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
          <FiBookOpen className="w-5 h-5 text-white" />
        </div>
        <span className="font-display text-2xl text-white">BookNest</span>
      </Link>

      {/* Quote */}
      <div className="z-10">
        <blockquote className="font-display text-3xl text-sky-100 leading-snug italic mb-6">
          "A reader lives a thousand lives before he dies."
        </blockquote>
        <cite className="font-sans text-sky-300 text-sm not-italic">— George R.R. Martin</cite>
      </div>

      <p className="font-sans text-sky-300 text-xs z-10">
        © {new Date().getFullYear()} BookNest. All rights reserved.
      </p>
    </div>

    {/* ── Right form panel ──────────────────────── */}
    <div className="flex-1 flex items-center justify-center bg-parchment-50 dark:bg-ink-900 px-6 py-12">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center">
            <FiBookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-xl text-ink-900 dark:text-white">BookNest</span>
        </Link>

        <Outlet />
      </motion.div>
    </div>
  </div>
);

export default AuthLayout;
