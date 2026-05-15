import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { extractUserFromJWT } from '@/lib/jwtUtils';
import toast from 'react-hot-toast';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token') || params.get('access_token');
    const redirect = params.get('redirect') || '/';

    if (!token) {
      toast.error('OAuth sign-in failed: no token received');
      navigate('/login', { replace: true });
      return;
    }

    const user = extractUserFromJWT(token);
    if (!user) {
      toast.error('Failed to parse token from provider');
      navigate('/login', { replace: true });
      return;
    }

    // Persist token + user in Zustand/localStorage
    setAuth({ token, user });
    toast.success(`Welcome back, ${user.fullName || user.email}`);

    // navigate to target
    navigate(redirect, { replace: true });
  }, [location.search, navigate, setAuth]);

  return (
    <div className="page-container py-24">
      <div className="text-center">
        <p className="text-lg">Signing you in...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
