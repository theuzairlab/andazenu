// Add this at the top of each affected API route file
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { sendOrderConfirmation } from '@/lib/email';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication from cookie
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth-server-cookie');

    if (!authCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authData = JSON.parse(authCookie.value);
    if (!authData.isAuthenticated || !authData.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get the id param - properly await it
    const orderId = await params.id;

    // Get order details
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Resend the order confirmation email
    await sendOrderConfirmation(order.email, order);

    return NextResponse.json({
      success: true,
      message: 'Order confirmation email sent successfully',
    });
  } catch (error) {
    console.error('Error resending order confirmation email:', error);
    return NextResponse.json({ error: 'Failed to send order confirmation email' }, { status: 500 });
  }
}
