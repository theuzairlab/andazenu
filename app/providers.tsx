'use client';

import { useEffect } from 'react';
import useAuth from './stores/useAuth';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkSession, isLoading } = useAuth();
  
  useEffect(() => {
    // Check authentication status when component mounts
    checkSession();
  }, [checkSession]);
  
  return <>{children}</>;
} 