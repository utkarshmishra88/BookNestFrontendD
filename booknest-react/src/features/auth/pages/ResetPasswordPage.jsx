import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import authService from '@/services/authService';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

const schema = yup.object({
  password: yup.string().min(6, 'Min 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm your password'),
});

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Reset token is missing from the URL.');
      return;
    }
    try {
      await authService.resetPassword(token, data.password);
      toast.success('Password successfully reset! You can now log in.');
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Reset password error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to reset password');
    }
  };

  if (!token) {
    return (
      <div className="text-center py-8">
        <h1 className="font-display text-2xl text-red-600 mb-2">Invalid Link</h1>
        <p className="font-body text-ink-600 dark:text-ink-400 mb-6">Your password reset link is invalid or missing.</p>
        <button onClick={() => navigate('/forgot-password')} className="btn-primary">
          Request a new link
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink-900 dark:text-white mb-1">Set New Password</h1>
      <p className="font-body text-ink-500 dark:text-ink-400 text-sm mb-8">
        Please enter your new password below.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="block font-sans text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">New Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4" />
            <input
              type={showPass ? 'text' : 'password'}
              {...register('password')}
              className="input-field pl-9 pr-9"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 dark:text-ink-400"
            >
              {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs font-sans text-red-600">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block font-sans text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">Confirm New Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4" />
            <input
              type={showPass ? 'text' : 'password'}
              {...register('confirmPassword')}
              className="input-field pl-9 pr-9"
              placeholder="••••••••"
            />
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs font-sans text-red-600">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-4">
          {isSubmitting ? <Spinner size="sm" /> : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
