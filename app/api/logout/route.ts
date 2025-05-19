import { NextResponse } from 'next/server';

export async function POST() {
  // Create a response
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  // Clear the server-side auth cookie
  response.cookies.set('auth-server-cookie', '', {
    httpOnly: true,
    expires: new Date(0), // Set expiration to the past to delete the cookie
    path: '/',
  });

  return response;
} 