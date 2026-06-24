// src/components/common/Modal.jsx
import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-lg bg-gray-900 border border-gray-800 rounded-t-2xl sm:rounded-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
