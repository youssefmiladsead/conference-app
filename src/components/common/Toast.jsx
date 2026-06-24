// src/components/common/Toast.jsx
import { useEffect, useState } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return { toasts, toast: addToast };
}

export function ToastContainer({ toasts }) {
  return (
    <div className="fixed top-4 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`animate-slide-up rounded-xl px-4 py-3 text-sm font-medium shadow-xl text-white flex items-center gap-2 pointer-events-auto ${
            t.type === 'success' ? 'bg-emerald-600' :
            t.type === 'error' ? 'bg-red-600' :
            t.type === 'warning' ? 'bg-amber-600' :
            'bg-brand-600'
          }`}
        >
          <span className="text-base">
            {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : t.type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
