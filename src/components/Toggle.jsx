import React from 'react';

const Toggle = ({ enabled, onChange, disabled = false, size = 'md' }) => {
  const sizes = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <button
      type="button"
      className={`${currentSize.track} relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
        enabled ? 'bg-emerald-500' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
    >
      <span
        className={`${currentSize.thumb} inline-block transform rounded-full bg-white transition-transform ${
          enabled ? currentSize.translate : 'translate-x-0.5'
        }`}
      />
    </button>
  );
};

export default Toggle;
