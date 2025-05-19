'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import useAuth from '@/app/stores/useAuth';

export default function UnauthorizedPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      router.push('/');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="bg-red-100 p-3 rounded-full inline-flex items-center justify-center mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 text-red-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        
        {isAuthenticated ? (
          <p className="text-gray-600 mb-6">
            {user?.isAdmin === false 
              ? "You don't have permission to access this area. This section is restricted to administrators."
              : "You don't have permission to access this section."}
          </p>
        ) : (
          <p className="text-gray-600 mb-6">
            You need to be logged in to access this page.
          </p>
        )}
        
        <div className="mb-6">
          <div className="text-sm text-gray-500">
            Redirecting to home in <span className="font-semibold">{countdown}</span> seconds
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            href="/"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Go to Home
          </Link>
          
          {!isAuthenticated && (
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 