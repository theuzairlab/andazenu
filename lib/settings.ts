import prisma from '@/lib/prisma';
import { WebsiteSettings } from '@/types';

/**
 * Get website settings from the database for server components
 * This function runs on the server only
 */
export async function getSiteSettings(): Promise<WebsiteSettings | null> {
  try {
    // Try to get existing settings using raw SQL query
    let dbSettings = await prisma.$queryRaw`SELECT * FROM "WebsiteSettings" WHERE id = 'settings' LIMIT 1`;
    
    // Convert result to a single object if it's an array
    if (Array.isArray(dbSettings) && dbSettings.length > 0) {
      const settings = dbSettings[0] as any;
      
      // Create a properly typed object from the raw data
      const result: WebsiteSettings = {
        id: settings.id || 'settings',
        siteName: settings.siteName || 'T-Shirt Store',
        logoUrl: settings.logoUrl,
        faviconUrl: settings.faviconUrl,
        primaryColor: settings.primaryColor || '#000000',
        secondaryColor: settings.secondaryColor || '#ffffff',
        footerText: settings.footerText || '© 2023 T-Shirt Store. All rights reserved.',
        contactEmail: settings.contactEmail || 'contact@example.com',
        contactPhone: settings.contactPhone || '+1234567890',
        updatedAt: settings.updatedAt || new Date().toISOString(),
        heroSliderImages: null,
        categoryImages: null,
        socialLinks: null
      };
      
      // Parse JSON fields if needed
      if (settings.heroSliderImages) {
        try {
          result.heroSliderImages = typeof settings.heroSliderImages === 'string' 
            ? JSON.parse(settings.heroSliderImages) 
            : settings.heroSliderImages;
        } catch (e) {
          console.error('Error parsing heroSliderImages:', e);
          result.heroSliderImages = [];
        }
      }
      
      if (settings.categoryImages) {
        try {
          result.categoryImages = typeof settings.categoryImages === 'string' 
            ? JSON.parse(settings.categoryImages) 
            : settings.categoryImages;
        } catch (e) {
          console.error('Error parsing categoryImages:', e);
          result.categoryImages = {};
        }
      }
      
      if (settings.socialLinks) {
        try {
          result.socialLinks = typeof settings.socialLinks === 'string' 
            ? JSON.parse(settings.socialLinks) 
            : settings.socialLinks;
        } catch (e) {
          console.error('Error parsing socialLinks:', e);
          result.socialLinks = {};
        }
      }
      
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving website settings:', error);
    return null;
  }
} 