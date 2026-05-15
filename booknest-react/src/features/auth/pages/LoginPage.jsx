import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { SiGoogle, SiGithub } from 'react-icons/si';
import { useAuthStore } from '@/store/authStore';
import authService from '@/services/authService';
import { extractUserFromJWT } from '@/lib/jwtUtils';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

// Yup validation schema
const schema = yup.object({
  email:    yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Min 6 characters').required('Password is required'),
});

const LoginPage = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPass, setShowPass] = React.useState(false);

  // Redirect to the page user was trying to access, or homepage by default
  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const response = await authService.login(data);
      
      let token, user;
      
      if (typeof response === 'string') {
        token = response;
        user = extractUserFromJWT(token);
        
        if (!user) {
          throw new Error('Failed to extract user info from token');
        }
        
        // For JWT string response, try to get email from login data
        user.email = data.email;

        const role = (user.role || '').replace('ROLE_', '');
        if (role === 'ADMIN') {
          toast.error('Administrator accounts cannot use the customer sign-in. Use the admin portal instead.');
          navigate('/admin/login', { replace: true });
          return;
        }
      } else if (response && response.token) {
        token = response.token;
        user = {
          userId: response.userId,
          fullName: response.fullName,
          email: response.email,
          role: response.role,
        };
        const role = (user.role || '').replace('ROLE_', '');
        if (role === 'ADMIN') {
          toast.error('Administrator accounts cannot use the customer sign-in. Use the admin portal instead.');
          navigate('/admin/login', { replace: true });
          return;
        }
      } else {
        throw new Error('Invalid response format: no token found');
      }
      
      console.log('User data after JWT extraction:', user);
      setAuth({ token, user });
      toast.success(`Welcome back, ${user.fullName || user.email}!`);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      toast.error(errorMsg);
    }
  };

  const handleGoogleOAuth = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || '/api'}/oauth2/authorization/google`;
  };

  const handleGithubOAuth = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: 'Redirecting to GitHub...',
        success: 'Redirecting to GitHub OAuth',
        error: 'GitHub OAuth not configured yet'
      }
    );
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || '/api'}/oauth2/authorization/github`;
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-ink-900 dark:text-white mb-1">Welcome back</h1>
      <p className="font-body text-ink-500 dark:text-ink-400 text-sm mb-8">Sign in to your BookNest account</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div>
          <label className="block font-sans text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">Email</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4" />
            <input
              type="email"
              {...register('email')}
              className="input-field pl-9"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs font-sans text-red-600">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block font-sans text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4" />
            <input
              type={showPass ? 'text' : 'password'}
              {...register('password')}
              className="input-field pl-9 pr-9"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 dark:text-ink-400"
            >
              {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex justify-between items-center mt-1">
            {errors.password ? (
              <p className="text-xs font-sans text-red-600">{errors.password.message}</p>
            ) : <span />}
            <Link to="/forgot-password" className="text-xs font-sans text-sky-600 hover:text-sky-700 font-medium">
              Forgot Password?
            </Link>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
          {isSubmitting ? <Spinner size="sm" /> : 'Sign In'}
        </button>
      </form>

      {/* OAuth Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-parchment-300"></div>
        <span className="text-sm text-ink-500 dark:text-ink-400 font-sans">Or continue with</span>
        <div className="flex-1 h-px bg-parchment-300"></div>
      </div>

      {/* OAuth Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={handleGoogleOAuth}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-sky-300 hover:bg-sky-50 dark:bg-ink-800 text-ink-700 dark:text-ink-300 font-sans font-medium text-sm transition-all duration-200 hover:border-sky-500"
        >
          <SiGoogle className="w-4 h-4" />
          Google
        </button>

        <button
          type="button"
          onClick={handleGithubOAuth}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-sky-300 hover:bg-sky-50 dark:bg-ink-800 text-ink-700 dark:text-ink-300 font-sans font-medium text-sm transition-all duration-200 hover:border-sky-500"
        >
          <SiGithub className="w-4 h-4" />
          GitHub
        </button>
      </div>

      <p className="font-sans text-sm text-ink-500 dark:text-ink-400 text-center mt-6">
        Staff?{' '}
        <Link to="/admin/login" className="text-sky-600 hover:text-sky-700 font-medium">
          Admin sign-in
        </Link>
      </p>

      <p className="font-sans text-sm text-ink-500 dark:text-ink-400 text-center mt-3">
        Don't have an account?{' '}
        <Link to="/register" className="text-sky-600 hover:text-sky-700 font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
