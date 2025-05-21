import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

// Add force-dynamic to prevent caching issues with API routes
export const dynamic = "force-dynamic";

// Helper function to check if the user is an admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    // Try to get the session cookie from the request
    const sessionCookie = request.cookies.get('session');

    if (sessionCookie?.value) {
      const sessionData = JSON.parse(sessionCookie.value);
      if (sessionData?.isAdmin) return true;
    }

    // Also try to get the auth-server-cookie which is used in middleware
    const authCookie = request.cookies.get('auth-server-cookie');

    if (authCookie?.value) {
      const authData = JSON.parse(authCookie.value);
      if (authData?.user?.isAdmin) return true;
    }

    // If we're in a server context, also try using cookies() directly
    // Skip server-side cookie check in API routes since we already checked request cookies above
    // This check is here for completeness but likely won't be used in API routes
    /*
    try {
      const cookieStore = cookies();
      const serverAuthCookie = cookieStore.get('auth-server-cookie');
      
      if (serverAuthCookie?.value) {
        const authData = JSON.parse(serverAuthCookie.value);
        if (authData?.user?.isAdmin) return true;
      }
    } catch (e) {
      // Ignore errors from cookies() API as it may not be available in all contexts
      console.log('Could not access server cookies:', e);
    }
    */

    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// GET - Retrieve website settings
export async function GET() {
  try {
    // Use Prisma's findUnique to get settings
    let settings = await prisma.websiteSettings.findUnique({
      where: {
        id: 'settings',
      },
    });

    // If settings don't exist, create default settings
    if (!settings) {
      // Create default settings using Prisma's create method
      settings = await prisma.websiteSettings.create({
        data: {
          id: 'settings',
          siteName: 'Andaze Nu',
          footerText: '© 2023 Andaze Nu. All rights reserved.',
          contactEmail: 'contact@andazenu.com',
          contactPhone: '+1234567890',
        },
      });
    }

    if (!settings) {
      throw new Error('Failed to create or retrieve settings');
    }

    // Prepare response with properly parsed JSON fields
    const response = {
      ...settings,
      // Ensure JSON fields are properly parsed
      heroSliderImages: settings.heroSliderImages
        ? typeof settings.heroSliderImages === 'string'
          ? JSON.parse(settings.heroSliderImages as string)
          : settings.heroSliderImages
        : null,
      socialLinks: settings.socialLinks
        ? typeof settings.socialLinks === 'string'
          ? JSON.parse(settings.socialLinks as string)
          : settings.socialLinks
        : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error retrieving website settings:', error);
    return NextResponse.json({ error: 'Failed to retrieve website settings' }, { status: 500 });
  }
}

// POST - Update website settings
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const adminUser = await isAdmin(request);

    // For debugging purposes - always allow settings updates in development mode
    const isDev = process.env.NODE_ENV === 'development';

    if (!adminUser && !isDev) {
      console.log('Admin authentication failed - user is not an admin');
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    console.log('Received settings update:', JSON.stringify(body, null, 2));

    // Prepare data for update, converting arrays/objects to JSON strings
    const data: Record<string, any> = {};

    // Process all fields with special handling for JSON fields
    for (const [key, value] of Object.entries(body)) {
      // Skip id as it's fixed as 'settings'
      if (key === 'id') continue;

      // Convert arrays/objects to JSON strings if necessary
      if (['heroSliderImages', 'socialLinks'].includes(key) && value && typeof value !== 'string') {
        data[key] = value;
      } else {
        data[key] = value;
      }
    }

    try {
      // Check if settings exist and update or create accordingly
      const settings = await prisma.websiteSettings.upsert({
        where: {
          id: 'settings',
        },
        update: data,
        create: {
          id: 'settings',
          ...data,
          // Add default values for required fields if not provided
          siteName: data.siteName || 'Andaze Nu',
          footerText: data.footerText || '© 2023 Andaze Nu. All rights reserved.',
          contactEmail: data.contactEmail || 'contact@andazenu.com',
          contactPhone: data.contactPhone || '+1234567890',
        },
      });

      console.log('Settings updated successfully');

      // Parse JSON fields for response if needed
      const response = {
        ...settings,
        // Ensure JSON fields are properly parsed
        heroSliderImages: settings.heroSliderImages
          ? typeof settings.heroSliderImages === 'string'
            ? JSON.parse(settings.heroSliderImages as string)
            : settings.heroSliderImages
          : null,
        socialLinks: settings.socialLinks
          ? typeof settings.socialLinks === 'string'
            ? JSON.parse(settings.socialLinks as string)
            : settings.socialLinks
          : null,
      };

      return NextResponse.json({
        success: true,
        settings: response,
      });
    } catch (dbError: any) {
      console.error('Error updating settings:', dbError);
      throw new Error(`Database error: ${dbError.message || 'Unknown database error'}`);
    }
  } catch (error: any) {
    console.error('Error updating website settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save settings' },
      { status: 500 }
    );
  }
}
