import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './styles/globals.css';

// React Query client — manages server state caching, refetching, and background sync
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // Cache data for 5 minutes before refetching
      cacheTime: 1000 * 60 * 10,  // Keep unused cache for 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        {/* Global toast notifications — positioned top-right */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              borderRadius: '8px',
              background: '#1a1714',
              color: '#f5f0e8',
              border: '1px solid rgba(139,99,39,0.3)',
            },
            success: { iconTheme: { primary: '#3d7f52', secondary: '#f5f0e8' } },
            error:   { iconTheme: { primary: '#dc2626', secondary: '#f5f0e8' } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
