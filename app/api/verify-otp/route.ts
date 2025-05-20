import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    // Find the OTP token in the database
    const otpToken = await prisma.oTPToken.findFirst({
      where: {
        email,
        token: otp,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!otpToken) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Find or create user
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: '',
      },
    });

    // Delete the used OTP token
    await prisma.oTPToken.delete({
      where: {
        id: otpToken.id,
      },
    });

    // Create user object to return
    const userObject = {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    };

    // Create a response with user data
    const response = NextResponse.json({
      success: true,
      user: userObject,
    });

    // Set a server-readable cookie with authentication info
    response.cookies.set(
      'auth-server-cookie',
      JSON.stringify({
        isAuthenticated: true,
        user: userObject,
      }),
      {
        httpOnly: true, // Not accessible via JavaScript
        secure: process.env.NODE_ENV === 'production', // Only sent over HTTPS in production
        maxAge: 60 * 60 * 24 * 1, // 1 week
        path: '/',
        sameSite: 'strict',
      }
    );

    return response;
  } catch (error) {
    console.error('Error in verify-otp route:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
