import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendOrderConfirmation } from '@/lib/email';
import { priceToNumber } from '@/lib/priceUtils';

// Helper function to safely get price from a product
function getProductPrice(product: {
  id: string | number;
  sellingPrice?: number;
  salePrice?: string;
}): number {
  try {
    // First try to use sellingPrice if it's a valid number
    if (
      typeof product.sellingPrice === 'number' &&
      !isNaN(product.sellingPrice) &&
      product.sellingPrice > 0
    ) {
      return product.sellingPrice;
    }

    // Fall back to parsing the sale price string if sellingPrice is not available
    if (product.salePrice) {
      const parsedPrice = priceToNumber(product.salePrice);
      if (!isNaN(parsedPrice) && parsedPrice > 0) {
        return parsedPrice;
      }
    }

    // Default to 0 if no valid price found
    console.warn('No valid price found for product:', product.id);
    return 0;
  } catch (error) {
    console.error('Error getting product price:', error);
    return 0;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, address, city, postalCode, phone, items, subtotal, shipping, total } =
      body;

    if (!email || !name || !address || !phone || !items || items.length === 0) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
    }

    // Validate that all items have valid prices
    const invalidItems = items.filter(
      (item: { product: { id: string | number; sellingPrice?: number; salePrice?: string } }) => {
        const itemPrice = getProductPrice(item.product);
        return itemPrice <= 0;
      }
    );

    if (invalidItems.length > 0) {
      console.error(
        'Items with invalid prices:',
        invalidItems.map((item: { product: { id: string | number } }) => item.product.id)
      );
      return NextResponse.json(
        { error: 'Items with invalid prices. Please try again or contact support.' },
        { status: 400 }
      );
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // If user doesn't exist, create a new user
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          isAdmin: false,
        },
      });
    }

    // Create the order with pending status
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: 'PENDING',
        totalAmount: typeof total === 'number' ? total : parseFloat(total),
        email,
        name,
        phone,
        address: `${address}, ${city} ${postalCode || ''}`.trim(),
        orderItems: {
          create: items.map(
            (item: {
              product: {
                id: string | number;
                sellingPrice?: number;
                salePrice?: string;
              };
              quantity: number;
              size: string;
              color: string;
            }) => {
              // Get price using the helper function
              const itemPrice = getProductPrice(item.product);

              console.log(`Order item price for ${item.product.id}: ${itemPrice}`);

              return {
                productId: item.product.id.toString(),
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                price: itemPrice,
              };
            }
          ),
        },
      },
      include: {
        orderItems: true, // Include order items in the response
      },
    });

    // Try to send order confirmation email
    try {
      await sendOrderConfirmation(email, order);
    } catch (error) {
      // Log error but don't prevent order creation
      console.error('Failed to send order confirmation email:', error);
    }

    // Set session cookie for the user
    const response = NextResponse.json({
      success: true,
      orderId: order.id,
      message: 'Order created successfully',
    });

    // Set session cookie
    response.cookies.set({
      name: 'session',
      value: JSON.stringify({
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      }),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
