import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { useAuthStore } from '@/store/authStore';
import authService from '@/services/authService';
import { extractUserFromJWT } from '@/lib/jwtUtils';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Min 6 characters').required('Password is required'),
});

/**
 * Staff-only sign-in. The same credentials as the main app are used, but only users
 * with role ADMIN receive a session; everyone else is rejected.
 */
const AdminLoginPage = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [showPass, setShowPass] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const response = await authService.login(data);
      let token;
      if (typeof response === 'string') {
        token = response;
      } else if (response?.token) {
        token = response.token;
      } else {
        throw new Error('Invalid response from server');
      }

      const parsed = extractUserFromJWT(token);
      if (!parsed) throw new Error('Could not read account from token');

      const role = (parsed.role || '').replace('ROLE_', '');
      if (role !== 'ADMIN') {
        toast.error('This portal is for administrators only. Use the regular sign-in for shopping.');
        return;
      }

      setAuth({
        token,
        user: {
          ...parsed,
          email: data.email,
        },
      });
      toast.success('Welcome to the admin panel');
      navigate('/admin', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Sign-in failed');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-2 text-sky-700">
        <FiShield className="w-6 h-6" />
        <span className="font-sans text-sm font-semibold uppercase tracking-wide">Staff access</span>
      </div>
      <h1 className="font-display text-3xl text-ink-900 dark:text-white mb-1">Admin sign-in</h1>
      <p className="font-body text-ink-500 dark:text-ink-400 text-sm mb-8">
        BookNest operations console — not for customer shopping accounts.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="block font-sans text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">Email</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4" />
            <input type="email" {...register('email')} className="input-field pl-9" autoComplete="email" />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block font-sans text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4" />
            <input
              type={showPass ? 'text' : 'password'}
              {...register('password')}
              className="input-field pl-9 pr-9"
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
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
          {isSubmitting ? <Spinner size="sm" /> : 'Sign in to admin'}
        </button>
      </form>

      <p className="font-sans text-sm text-ink-500 dark:text-ink-400 text-center mt-8">
        <Link to="/login" className="text-sky-600 hover:text-sky-700 font-medium">
          Customer sign-in
        </Link>
        {' · '}
        <Link to="/" className="text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:text-ink-300">
          Home
        </Link>
      </p>
    </div>
  );
};

export default AdminLoginPage;
