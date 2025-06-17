'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#fff',
          color: '#333',
          zIndex: 100000, // 👈 Add this to ensure it's above modal
        },
        success: {
          style: {
            border: '1px solid #10b981',
          },
        },
        error: {
          style: {
            border: '1px solid #ef4444',
          },
        },
      }}
    />
  );
}
