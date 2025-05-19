import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

// Helper function to check admin status
async function isAdmin(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie?.value) return false;
    
    const sessionData = JSON.parse(sessionCookie.value);
    return !!sessionData?.isAdmin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// GET - Retrieve all users with order counts
export async function GET() {
  try {
    // Check if user is an admin
    const adminUser = await isAdmin();
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Fetch all users with their order counts
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: { orders: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the response
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      orderCount: user._count.orders
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error('Error retrieving users:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve users' },
      { status: 500 }
    );
  }
} 