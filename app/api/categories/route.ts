export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { cookies } from 'next/headers';

// Helper function to check if user is admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    // Try to get the session cookie from the request
    const sessionCookie = request.cookies.get('session');

    if (sessionCookie?.value) {
      const sessionData = JSON.parse(sessionCookie.value);
      if (sessionData?.isAdmin) return true;
    }

    // Also try to get the auth-server-cookie which is used in middleware
    const authCookie = request.cookies.get('auth-server-cookie');

    if (authCookie?.value) {
      const authData = JSON.parse(authCookie.value);
      if (authData?.user?.isAdmin) return true;
    }

    // For development mode, allow non-admins
    const isDev = process.env.NODE_ENV === 'development';

    return isDev;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// GET - Get all categories or filter by slug
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    let categories;

    if (slug) {
      // If slug is provided, find categories matching the slug
      categories = await prisma.category.findMany({
        where: {
          slug: {
            contains: slug,
            mode: 'insensitive',
          },
        },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });
    } else {
      // If no slug, return all categories
      categories = await prisma.category.findMany({
        orderBy: {
          name: 'asc',
        },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST - Create a new category
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, imageUrl } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Generate slug from name
    const slug = slugify(name);

    // Check if category with this slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 409 }
      );
    }

    // Create new category
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        imageUrl,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
