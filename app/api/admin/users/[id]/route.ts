import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper function to check admin status from request
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

// GET - Retrieve user details with their orders
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;

    // Check admin status
    const adminUser = await isAdmin(request);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    // Fetch user with their orders
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            _count: {
              select: {
                orderItems: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error retrieving user details:', error);
    return NextResponse.json({ error: 'Failed to retrieve user details' }, { status: 500 });
  }
}

// PATCH - Update user details (e.g., isAdmin status)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;

    // Check admin status
    const adminUser = await isAdmin(request);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();

    // Only allow updating isAdmin status for now
    if (typeof body.isAdmin !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request. Only isAdmin status can be updated.' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isAdmin: body.isAdmin,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
