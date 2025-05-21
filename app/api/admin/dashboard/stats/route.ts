import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

// Add this at the top of each affected API route file
export const dynamic = "force-dynamic";

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

    // Count total products
    const totalProducts = await prisma.product.count();

    // Count total orders
    const totalOrders = await prisma.order.count();

    // Count total customers (unique users who have placed orders)
    const totalCustomers = await prisma.user.count();

    // Calculate total revenue (sum of all DELIVERED order totals only)
    const revenueData = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        status: 'DELIVERED', // Only count revenue from delivered orders
      },
    });

    const totalRevenue = revenueData._sum.totalAmount || 0;

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard statistics' }, { status: 500 });
  }
}
