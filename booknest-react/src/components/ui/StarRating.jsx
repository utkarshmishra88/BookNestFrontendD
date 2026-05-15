import React from 'react';
import { FiStar } from 'react-icons/fi';

/**
 * Interactive or static star rating component.
 * @param {{ value, onChange, readonly, size }} props
 */
const StarRating = ({ value = 0, onChange, readonly = false, size = 'md' }) => {
  const sizes = { sm: 'w-3 h-3', md: 'w-5 h-5', lg: 'w-6 h-6' };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(star)}
          className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <FiStar
            className={`${sizes[size]} transition-colors ${ star <= value ? 'text-brand-500 fill-current' : 'text-parchment-300' }`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
