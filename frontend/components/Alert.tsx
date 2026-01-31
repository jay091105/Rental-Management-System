'use client';

import React from 'react';

interface AlertProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  onClose?: () => void;
}

export default function Alert({ message, type = 'error', onClose }: AlertProps) {
  const bg = type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-200 text-blue-700';

  return (
    <div className={`w-full p-3 rounded-md border ${bg} flex items-start justify-between gap-3`} role="alert">
      <div className="text-sm leading-tight">{message}</div>
      <button onClick={onClose} aria-label="Dismiss" className="text-gray-500 hover:text-gray-700 ml-2">
        ✕
      </button>
    </div>
  );
}
