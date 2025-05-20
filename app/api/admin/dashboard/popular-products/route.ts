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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authData = JSON.parse(authCookie.value);
    if (!authData.isAuthenticated || !authData.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get popular products based on order history
    const popularProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    // Get product details for the popular products
    const productDetails = await Promise.all(
      popularProducts.map(async item => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        return {
          id: product?.id,
          name: product?.name,
          imageUrl: product?.imageUrl,
          soldCount: item._sum.quantity,
          price: product?.sellingPrice ? formatPrice(product.sellingPrice) : 'N/A',
        };
      })
    );

    // Wrap in products object to match dashboard component expectations
    return NextResponse.json({ products: productDetails });
  } catch (error) {
    console.error('Error fetching popular products:', error);
    return NextResponse.json({ error: 'Failed to fetch popular products' }, { status: 500 });
  }
}
