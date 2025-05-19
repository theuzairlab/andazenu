import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper function to check if the user is an admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const sessionCookie = request.cookies.get('session');
    
    if (!sessionCookie?.value) return false;
    
    const sessionData = JSON.parse(sessionCookie.value);
    return !!sessionData?.isAdmin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// GET - Retrieve website settings
export async function GET() {
  try {
    // Use Prisma's findUnique to get settings with proper typing
    let settings = await prisma.$queryRaw`SELECT * FROM "WebsiteSettings" WHERE id = 'settings' LIMIT 1`;
    
    // Check if settings exist and convert from array if needed
    let settingsData = null;
    if (Array.isArray(settings) && settings.length > 0) {
      settingsData = settings[0];
    } else if (!Array.isArray(settings)) {
      settingsData = settings;
    }
    
    // If settings don't exist, create default settings
    if (!settingsData) {
      // Create with a direct query to avoid model naming issues
      await prisma.$executeRaw`
        INSERT INTO "WebsiteSettings" (
          id, "siteName", "primaryColor", "secondaryColor", "footerText", "contactEmail", "contactPhone", "updatedAt"
        ) VALUES (
          'settings', 'T-Shirt Store', '#000000', '#ffffff', '© 2023 T-Shirt Store. All rights reserved.', 
          'contact@example.com', '+1234567890', NOW()
        )
      `;
      
      // Fetch the newly created settings
      const newSettings = await prisma.$queryRaw`SELECT * FROM "WebsiteSettings" WHERE id = 'settings' LIMIT 1`;
      if (Array.isArray(newSettings) && newSettings.length > 0) {
        settingsData = newSettings[0];
      } else if (!Array.isArray(newSettings)) {
        settingsData = newSettings;
      }
    }
    
    if (!settingsData) {
      throw new Error("Failed to create or retrieve settings");
    }
    
    // Prepare response with properly parsed JSON fields
    const response = {
      ...settingsData,
    };
    
    // Parse JSON fields if they exist
    try {
      if (response.heroSliderImages && typeof response.heroSliderImages === 'string') {
        response.heroSliderImages = JSON.parse(response.heroSliderImages);
      }
      
      if (response.categoryImages && typeof response.categoryImages === 'string') {
        response.categoryImages = JSON.parse(response.categoryImages);
      }
      
      if (response.socialLinks && typeof response.socialLinks === 'string') {
        response.socialLinks = JSON.parse(response.socialLinks);
      }
    } catch (e) {
      console.error('Error parsing JSON fields:', e);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error retrieving website settings:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve website settings' },
      { status: 500 }
    );
  }
}

// POST - Update website settings
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const adminUser = await isAdmin(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Prepare data for update, converting arrays/objects to JSON strings
    const data: Record<string, any> = {};
    
    // Process all fields, with special handling for JSON fields
    for (const [key, value] of Object.entries(body)) {
      // Skip id as it's fixed as 'settings'
      if (key === 'id') continue;
      
      // Convert arrays/objects to JSON strings
      if (['heroSliderImages', 'categoryImages', 'socialLinks'].includes(key) && 
          value && typeof value !== 'string') {
        data[key] = JSON.stringify(value);
      } else {
        data[key] = value;
      }
    }
    
    // Check if settings exist
    const existing = await prisma.$queryRaw`SELECT id FROM "WebsiteSettings" WHERE id = 'settings' LIMIT 1`;
    const exists = Array.isArray(existing) && existing.length > 0;
    
    if (exists) {
      // Update using direct SQL to avoid model naming issues
      const setClause = Object.entries(data)
        .map(([key, _]) => `"${key}" = ?`)
        .join(', ');
      
      // Only proceed if we have fields to update
      if (setClause) {
        // Create parameterized query with question mark placeholders
        const query = `
          UPDATE "WebsiteSettings" 
          SET ${setClause}, "updatedAt" = NOW()
          WHERE id = 'settings'
        `;
        
        // Execute with parameters in flat array
        await prisma.$executeRawUnsafe(
          query,
          ...Object.values(data)
        );
      }
    } else {
      // Get all columns including updatedAt
      const columns = ['id', ...Object.keys(data).map(k => `"${k}"`), '"updatedAt"'];
      
      // Create placeholders for values
      const placeholders = ['?', ...Array(Object.keys(data).length).fill('?'), 'NOW()'];
      
      // Create values array starting with 'settings' as the ID
      const values = ['settings', ...Object.values(data)];
      
      const query = `
        INSERT INTO "WebsiteSettings" (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
      `;
      
      await prisma.$executeRawUnsafe(query, ...values);
    }
    
    // Fetch the updated settings
    const updatedSettings = await prisma.$queryRaw`SELECT * FROM "WebsiteSettings" WHERE id = 'settings' LIMIT 1`;
    let result = Array.isArray(updatedSettings) ? updatedSettings[0] : updatedSettings;
    
    if (!result) {
      throw new Error("Failed to retrieve updated settings");
    }

    // Parse JSON fields for response
    const response = { ...result };
    
    // Parse JSON fields if they exist
    try {
      if (response.heroSliderImages && typeof response.heroSliderImages === 'string') {
        response.heroSliderImages = JSON.parse(response.heroSliderImages);
      }
      
      if (response.categoryImages && typeof response.categoryImages === 'string') {
        response.categoryImages = JSON.parse(response.categoryImages);
      }
      
      if (response.socialLinks && typeof response.socialLinks === 'string') {
        response.socialLinks = JSON.parse(response.socialLinks);
      }
    } catch (e) {
      console.error('Error parsing JSON fields:', e);
    }

    return NextResponse.json({
      success: true,
      settings: response
    });
  } catch (error: any) {
    console.error('Error updating website settings:', error);
    return NextResponse.json(
      { error: 'Failed to update website settings', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 