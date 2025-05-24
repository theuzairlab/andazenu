import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth-server-cookie');

    if (!authCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authData = JSON.parse(authCookie.value);
    if (!authData.isAuthenticated || !authData.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const orderId = context.params.id;
    const { newStatus } = await req.json();

    // Get current order with items and their products
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                productSizes: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const currentStatus = order.status;

    // Define when to decrease stock (moving from PENDING to active states)
    const shouldDecreaseStock = 
      currentStatus === 'PENDING' && 
      ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(newStatus);

    // Define when to increase stock (moving back to PENDING or to CANCELLED)
    const shouldIncreaseStock = 
      ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(currentStatus) && 
      ['PENDING', 'CANCELLED'].includes(newStatus);

    // If we need to decrease stock, check if enough stock is available
    if (shouldDecreaseStock) {
      const insufficientStockProducts = [];

      for (const item of order.orderItems) {
        const product = item.product;
        const sizeStock = product.productSizes.find(s => s.size === item.size);
        
        if (!sizeStock || sizeStock.stock < item.quantity) {
          insufficientStockProducts.push({
            name: product.name,
            size: item.size,
            required: item.quantity,
            available: sizeStock?.stock || 0
          });
        }
      }

      if (insufficientStockProducts.length > 0) {
        return NextResponse.json({
          error: 'Insufficient stock for products',
          code: 'INSUFFICIENT_STOCK',
          details: insufficientStockProducts
        }, { status: 400 });
      }
    }

    // Update order status and stock in a transaction
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus }
      });

      // Update stock if needed
      if (shouldDecreaseStock || shouldIncreaseStock) {
        for (const item of order.orderItems) {
          // For decrease: multiply by -1, for increase: multiply by 1
          const quantityChange = shouldDecreaseStock ? -item.quantity : item.quantity;

          // Update product's total stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: quantityChange
              }
            }
          });

          // Update size-specific stock
          await tx.productSize.updateMany({
            where: {
              productId: item.productId,
              size: item.size
            },
            data: {
              stock: {
                increment: quantityChange
              }
            }
          });

          // Log the stock change for debugging
          console.log(`Stock update for product ${item.productId}:`, {
            currentStatus,
            newStatus,
            quantityChange,
            size: item.size
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Order status and stock updated successfully'
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ 
      error: 'Failed to update order status',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
} 