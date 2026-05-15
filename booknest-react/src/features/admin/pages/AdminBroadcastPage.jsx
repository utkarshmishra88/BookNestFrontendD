import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiMail, FiMessageCircle, FiAlertCircle } from 'react-icons/fi';
import adminService from '@/services/adminService';
import toast from 'react-hot-toast';

const AdminBroadcastPage = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!subject || !message) {
      toast.error('Please fill in both subject and message.');
      return;
    }

    if (!window.confirm('Are you sure you want to send this message to ALL users?')) {
      return;
    }

    setLoading(true);
    try {
      await adminService.sendBroadcast(subject, message);
      toast.success('Broadcast sent successfully!');
      setSubject('');
      setMessage('');
    } catch (err) {
      toast.error('Failed to send broadcast.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display text-ink-900 dark:text-white mb-2">Broadcast Message</h1>
        <p className="text-ink-500 dark:text-ink-400">Send an announcement or sale alert to all registered users.</p>
      </div>

      <motion.div 
        className="card p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8 flex gap-3">
          <FiAlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-amber-800 font-bold">Important Note</p>
            <p className="text-sm text-amber-700">
              This message will be delivered via email to all active users. Use this feature responsibly.
            </p>
          </div>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-ink-700 dark:text-ink-300 mb-2">Email Subject</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Massive Weekend Sale - 50% Off!"
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-ink-700 dark:text-ink-300 mb-2">Message Content</label>
            <div className="relative">
              <FiMessageCircle className="absolute left-3 top-4 text-ink-400" />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your announcement here..."
                rows={8}
                className="input-field pl-10 pt-3"
              />
            </div>
            <p className="mt-2 text-xs text-ink-400">Supports plain text with line breaks.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending to all users...
              </span>
            ) : (
              <>
                <FiSend className="w-5 h-5" /> Send Broadcast Now
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminBroadcastPage;
