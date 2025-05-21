import { NextResponse } from 'next/server';
import { getAuthenticationParameters } from '@/lib/imagekit';

// Add this at the top of each affected API route file
export const dynamic = "force-dynamic";

// API route to get authentication parameters for client-side uploads
export async function GET() {
  try {
    // Get authentication parameters
    const authParams = getAuthenticationParameters();

    return NextResponse.json(authParams);
  } catch (error) {
    console.error('Error generating ImageKit authentication parameters:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication parameters' },
      { status: 500 }
    );
  }
}
