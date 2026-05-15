import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import authService from '@/services/authService';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
});

const ForgotPasswordPage = () => {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email);
      setSuccess(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      console.error('Forgot password error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to send reset link');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link to="/login" className="inline-flex items-center text-sm font-sans text-sky-600 hover:text-sky-700 transition-colors">
          <FiArrowLeft className="mr-1" /> Back to login
        </Link>
      </div>

      <h1 className="font-display text-3xl text-ink-900 dark:text-white mb-1">Reset Password</h1>
      <p className="font-body text-ink-500 dark:text-ink-400 text-sm mb-8">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-800 font-sans text-sm">
            We've sent a password reset link to your email. Please check your inbox and spam folder.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="block font-sans text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4" />
              <input
                type="email"
                {...register('email')}
                className="input-field pl-9"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs font-sans text-red-600">{errors.email.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
            {isSubmitting ? <Spinner size="sm" /> : 'Send Reset Link'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
