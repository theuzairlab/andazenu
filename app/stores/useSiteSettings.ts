import { create } from 'zustand';
import { WebsiteSettings } from '@/types';

interface SiteSettingsState {
  settings: WebsiteSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS: WebsiteSettings = {
  id: 'settings',
  siteName: 'Andaze Nu',
  logoUrl: null,
  faviconUrl: null,
  heroSliderImages: [],
  footerText: '© 2023 Andaze Nu. All rights reserved.',
  contactEmail: 'contact@andazenu.com',
  contactPhone: '+1234567890',
  socialLinks: {},
  updatedAt: new Date().toISOString(),
};

const useSiteSettings = create<SiteSettingsState>(set => ({
  settings: null,
  isLoading: true,
  error: null,
  fetchSettings: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await fetch('/api/settings');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch settings');
      }

      const data = await response.json();

      // Parse dates and ensure all properties exist
      const normalizedSettings = {
        ...DEFAULT_SETTINGS,
        ...data,
        updatedAt: data.updatedAt || new Date().toISOString(),
        heroSliderImages: data.heroSliderImages || [],
        socialLinks: data.socialLinks || {},
      };

      set({
        settings: normalizedSettings,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Error fetching site settings:', error);
      set({
        error: error.message || 'Failed to load site settings',
        isLoading: false,
        settings: DEFAULT_SETTINGS,
      });
    }
  },
}));

export default useSiteSettings;
