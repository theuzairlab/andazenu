import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Add this at the top of each affected API route file
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Get search query from URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    // Validate query
    if (!query || query.trim() === '') {
      return NextResponse.json([], { status: 200 });
    }

    // Perform search across multiple fields
    const searchResults = await prisma.product.findMany({
      where: {
        OR: [
          // Search in product name
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          // Search in product description
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
          // Search in category name
          {
            category: {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
        ],
      },
      include: {
        productColors: true,
        productSizes: true,
        category: true,
      },
      // Limit results to prevent overwhelming response
      take: 50,
    });

    return NextResponse.json(searchResults, { status: 200 });
  } catch (error) {
    console.error('Error in product search:', error);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}
