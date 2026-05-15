import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { SiGoogle, SiGithub } from 'react-icons/si';
import authService from '@/services/authService';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';
import { registerSchema } from '@/features/auth/validation/registerSchema';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = React.useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm({ resolver: yupResolver(registerSchema) });

  const onSubmit = async ({ fullName, email, password }) => {
    try {
      // POST /auth/register — backend RegisterRequest expects password
      await authService.register({ fullName, email, password });
      localStorage.setItem('bn_verify_email', email);
      toast.success('Account created! Check your email for the OTP.');
      navigate('/verify', { state: { email } });
    } catch (err) {
      toast.error(err.message);
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
      <h1 className="font-display text-3xl text-ink-900 dark:text-white mb-1">Create account</h1>
      <p className="font-body text-ink-500 dark:text-ink-400 text-sm mb-8">Join BookNest and start your reading journey</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Full name */}
        <div>
          <label className="block font-sans text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">Full Name</label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4" />
            <input type="text" {...register('fullName')} className="input-field pl-9" placeholder="enter your name" />
          </div>
          {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block font-sans text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">Email</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4" />
            <input type="email" {...register('email')} className="input-field pl-9" placeholder="enter your email" />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
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
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">
              {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        {/* Confirm password */}
        <div>
          <label className="block font-sans text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">Confirm Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4" />
            <input type="password" {...register('confirm')} className="input-field pl-9" placeholder="••••••••" />
          </div>
          {errors.confirm && <p className="mt-1 text-xs text-red-600">{errors.confirm.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
          {isSubmitting ? <Spinner size="sm" /> : 'Create Account'}
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
        Already have an account?{' '}
        <Link to="/login" className="text-sky-600 hover:text-sky-700 font-medium">Sign in</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
