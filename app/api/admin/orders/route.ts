import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { OrderStatus } from '@prisma/client';

// GET handler to fetch all orders
export async function GET(request: Request) {
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

    // Get URL query parameters
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit')) || undefined;
    const statusParam = url.searchParams.get('status');

    // Convert status string to enum or undefined
    let statusFilter = undefined;
    if (statusParam) {
      // Validate that status is a valid OrderStatus enum value
      const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
      if (validStatuses.includes(statusParam)) {
        statusFilter = statusParam as OrderStatus;
      }
    }

    // Prepare where condition for filtering by status if provided
    const where = statusFilter ? { status: statusFilter } : {};

    // Query orders with pagination and optional status filter
    const orders = await prisma.order.findMany({
      where,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    // Format orders for consistent display
    const formattedOrders = orders.map(order => {
      // Create a formatted copy of the order
      const formattedOrder = {
        ...order,
        totalAmount: parseFloat(order.totalAmount.toString()),
        formattedTotal: formatPrice(order.totalAmount),
        // Type the order items correctly
        orderItems: order.orderItems.map(item => ({
          ...item,
          price: parseFloat(item.price.toString()),
          formattedPrice: formatPrice(item.price),
        })),
      };

      return formattedOrder;
    });

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
