import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

/** Main layout wrapping every public and user-authenticated page. */
const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-ink-900">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
