import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable empty-state illustration component.
 * @param {{ icon, title, description, action }} props
 */
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <motion.div
    className="flex flex-col items-center justify-center py-20 px-6 text-center"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    {Icon && (
      <div className="w-16 h-16 rounded-2xl bg-parchment-100 dark:bg-ink-800 flex items-center justify-center mb-5">
        <Icon className="w-8 h-8 text-brand-400" />
      </div>
    )}
    <h3 className="font-display text-xl text-ink-800 dark:text-parchment-50 mb-2">{title}</h3>
    {description && <p className="font-body text-sm text-ink-500 dark:text-ink-400 max-w-sm">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </motion.div>
);

export default EmptyState;
