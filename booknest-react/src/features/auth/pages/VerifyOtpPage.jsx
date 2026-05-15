import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '@/services/authService';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

/**
 * OTP verification page — 6-digit OTP input with auto-focus on each digit.
 * Email is passed via navigation state from RegisterPage.
 */
const VerifyOtpPage = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const email     = location.state?.email || localStorage.getItem('bn_verify_email') || '';
  const [digits, setDigits]       = useState(Array(6).fill(''));
  const [isSubmitting, setSubmitting] = useState(false);
  const refs = useRef([]);

  useEffect(() => {
    if (!email) {
      toast.error('Please register first to verify your email.');
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  const handleChange = (i, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < 6) { toast.error('Enter all 6 digits'); return; }
    setSubmitting(true);
    try {
      await authService.verifyOtp({ email, otp });
      localStorage.removeItem('bn_verify_email');
      toast.success('Email verified! You can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-ink-900 dark:text-white mb-1">Verify your email</h1>
      <p className="font-body text-ink-500 dark:text-ink-400 text-sm mb-8">
        We sent a 6-digit code to <strong className="text-ink-700 dark:text-ink-300">{email}</strong>
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2 justify-center">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-14 text-center rounded-lg border-2 border-parchment-300 dark:border-ink-600 bg-white dark:bg-ink-800 font-display text-xl text-ink-900 dark:text-white focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-400/30 transition-all duration-200"
            />
          ))}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? <Spinner size="sm" /> : 'Verify OTP'}
        </button>
      </form>
    </div>
  );
};

export default VerifyOtpPage;
