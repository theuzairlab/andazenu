import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/utils';

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

// GET - Get a category by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          take: 10, // Include a few products for reference
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

// PUT - Update a category
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const id = params.id;
    const body = await request.json();
    const { name, description, imageUrl } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Generate slug from name
    const slug = slugify(name);

    // Check if another category with this slug exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        slug,
        id: { not: id },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 409 }
      );
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        imageUrl,
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE - Delete a category
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const id = params.id;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if category has products
    if (category._count.products > 0) {
      return NextResponse.json(
        {
          error: 'Category has products',
          message:
            'Cannot delete a category that has products. Please reassign or delete the products first.',
          productCount: category._count.products,
        },
        { status: 409 }
      );
    }

    // Delete category
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
