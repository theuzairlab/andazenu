'use client';

import { useEffect } from 'react';
import useSiteSettings from '@/app/stores/useSiteSettings';

/**
 * Component to inject dynamic CSS variables based on site settings
 */
export default function SiteStyleProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSiteSettings();

  // Apply CSS variables from settings
  useEffect(() => {
    if (!settings) return;

    // Apply primary color
    if (settings.primaryColor) {
      document.documentElement.style.setProperty('--color-primary', settings.primaryColor);
    }

    // Apply secondary color
    if (settings.secondaryColor) {
      document.documentElement.style.setProperty('--color-secondary', settings.secondaryColor);
    }

    // Set document title
    if (settings.siteName) {
      document.title = settings.siteName;
    }

    // Set favicon if available
    if (settings.faviconUrl) {
      const existingFavicon = document.querySelector('link[rel="icon"]');
      if (existingFavicon) {
        existingFavicon.setAttribute('href', settings.faviconUrl);
      } else {
        const favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.href = settings.faviconUrl;
        document.head.appendChild(favicon);
      }
    }
  }, [settings]);

  return <>{children}</>;
}
