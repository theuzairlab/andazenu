import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Get the auth cookie
  const authCookie = request.headers.get('cookie')?.match(/auth-server-cookie=([^;]+)/)?.[1];

  if (!authCookie) {
    return NextResponse.json({ isAuthenticated: false });
  }

  try {
    // Parse the cookie value
    const authData = JSON.parse(decodeURIComponent(authCookie));

    if (authData.isAuthenticated && authData.user) {
      // Return the user data without sensitive information
      return NextResponse.json({
        isAuthenticated: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.name,
          isAdmin: authData.user.isAdmin,
        },
      });
    } else {
      return NextResponse.json({ isAuthenticated: false });
    }
  } catch (error) {
    console.error('Error parsing auth cookie:', error);
    return NextResponse.json({ isAuthenticated: false });
  }
}
