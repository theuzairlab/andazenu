import prisma from '@/lib/prisma';
import { WebsiteSettings } from '@/types';

/**
 * Get website settings from the database for server components
 * This function runs on the server only
 */
export async function getSiteSettings(): Promise<WebsiteSettings | null> {
  try {
    // Get settings using Prisma model method
    const dbSettings = await prisma.websiteSettings.findUnique({
      where: {
        id: 'settings',
      },
    });

    if (dbSettings) {
      // Create a properly typed object from the data
      const result: WebsiteSettings = {
        id: dbSettings.id || 'settings',
        siteName: dbSettings.siteName || 'Andaze Nu',
        logoUrl: dbSettings.logoUrl,
        faviconUrl: dbSettings.faviconUrl,
        footerText: dbSettings.footerText || '© 2023 Andaze Nu. All rights reserved.',
        contactEmail: dbSettings.contactEmail || 'contact@andazenu.com',
        contactPhone: dbSettings.contactPhone || '+1234567890',
        updatedAt: dbSettings.updatedAt.toISOString(),
        heroSliderImages: null,
        socialLinks: null,
      };

      // Parse JSON fields if needed
      if (dbSettings.heroSliderImages) {
        try {
          result.heroSliderImages =
            typeof dbSettings.heroSliderImages === 'string'
              ? JSON.parse(dbSettings.heroSliderImages)
              : dbSettings.heroSliderImages;
        } catch (e) {
          console.error('Error parsing heroSliderImages:', e);
          result.heroSliderImages = [];
        }
      }

      if (dbSettings.socialLinks) {
        try {
          result.socialLinks =
            typeof dbSettings.socialLinks === 'string'
              ? JSON.parse(dbSettings.socialLinks)
              : dbSettings.socialLinks;
        } catch (e) {
          console.error('Error parsing socialLinks:', e);
          result.socialLinks = {};
        }
      }

      return result;
    }

    // If no settings found, create default settings
    const defaultSettings = await prisma.websiteSettings.create({
      data: {
        id: 'settings',
        siteName: 'Andaze Nu',
        footerText: '© 2025 Andaze Nu. All rights reserved.',
        contactEmail: 'contact@andazenu.com',
        contactPhone: '+1234567890',
      },
    });

    // Return the newly created settings
    return {
      id: defaultSettings.id,
      siteName: defaultSettings.siteName,
      logoUrl: defaultSettings.logoUrl,
      faviconUrl: defaultSettings.faviconUrl,
      footerText: defaultSettings.footerText,
      contactEmail: defaultSettings.contactEmail,
      contactPhone: defaultSettings.contactPhone,
      updatedAt: defaultSettings.updatedAt.toISOString(),
      heroSliderImages: [],
      socialLinks: {},
    };
  } catch (error) {
    console.error('Error retrieving website settings:', error);
    return null;
  }
}
