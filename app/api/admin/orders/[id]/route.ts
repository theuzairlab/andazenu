import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';

// Get a specific order
export async function GET(req: Request, { params }: { params: { id: string } }) {
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

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Format the order data for consistent display
    const formattedOrder = {
      ...order,
      totalAmount: parseFloat(order.totalAmount.toString()),
      orderItems: order.orderItems.map((item: {
        price: number | string ; // Use the correct type here based on what your database returns
        // Include any other properties that exist on the item
      }) => ({
        ...item,
        price: parseFloat(item.price.toString()),
      })),
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}

// Update an order's status
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

    // Get request body
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
