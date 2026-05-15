import React from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiGithub, FiTwitter, FiInstagram } from 'react-icons/fi';

const Footer = () => (
  <footer className="bg-sky-900 text-sky-100 mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center">
              <FiBookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl text-parchment-100">BookNest</span>
          </Link>
          <p className="font-body text-sm text-sky-200 leading-relaxed max-w-xs">
            Your curated corner of the literary world. Discover, collect, and cherish stories.
          </p>
          <div className="flex gap-3 mt-4">
            {[FiGithub, FiTwitter, FiInstagram].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 rounded-lg bg-sky-700 flex items-center justify-center text-sky-200 hover:text-white hover:bg-sky-600 transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-sans font-medium text-sky-100 mb-3 text-sm uppercase tracking-wider">Shop</h4>
          <ul className="space-y-2">
            {['Catalogue', 'New Arrivals', 'Bestsellers', 'Genres'].map((l) => (
              <li key={l}>
                <Link to="/books" className="font-body text-sm text-sky-300 hover:text-sky-100 transition-colors">{l}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-sans font-medium text-sky-100 mb-3 text-sm uppercase tracking-wider">Account</h4>
          <ul className="space-y-2">
            {['Profile', 'Orders', 'Wishlist', 'Wallet'].map((l) => (
              <li key={l}>
                <Link to={`/${l.toLowerCase()}`} className="font-body text-sm text-sky-300 hover:text-sky-100 transition-colors">{l}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-sky-700 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="font-sans text-xs text-sky-300">© {new Date().getFullYear()} BookNest. All rights reserved.</p>
        <p className="font-sans text-xs text-sky-400">Built with React + Spring Boot Microservices</p>
      </div>
    </div>
  </footer>
);

export default Footer;
