'use client';

import { useEffect } from 'react';
import useSiteSettings from '@/app/stores/useSiteSettings';

/**
 * Provider component that loads site settings on mount
 * This should be included high in the component tree
 */
export default function SiteSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchSettings } = useSiteSettings();

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return <>{children}</>;
} 