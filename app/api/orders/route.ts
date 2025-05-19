import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';

export async function GET() {
  try {
    // Check authentication from cookie
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth-server-cookie');
    
    if (!authCookie?.value) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const authData = JSON.parse(authCookie.value);
    if (!authData.isAuthenticated || !authData.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Get user orders
    const orders = await prisma.order.findMany({
      where: {
        userId: authData.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });

    // Format the order data to ensure consistent price display
    const formattedOrders = orders.map(order => ({
      ...order,
      totalAmount: parseFloat(order.totalAmount.toString()),
      orderItems: order.orderItems.map(item => ({
        ...item,
        price: parseFloat(item.price.toString())
      }))
    }));
    
    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 