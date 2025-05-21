import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getFileIdFromUrl } from '@/lib/imagekit';
import { parsePrice } from '@/lib/priceUtils';

// Add force-dynamic to prevent caching issues with API routes
export const dynamic = "force-dynamic";

// GET all products
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('category');
    const collectionSlug = searchParams.get('collection');

    let whereClause: any = {};
    
    // If categoryId is provided, use it directly
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    
    // If collectionSlug is provided, find the categoryId first
    if (collectionSlug) {
      let slug = collectionSlug.toLowerCase();
      
      // Convert MENS to mens-collection, KIDS to kids-collection if needed
      if (slug === 'mens') slug = 'mens-collection';
      if (slug === 'kids') slug = 'kids-collection';
      
      try {
        const category = await prisma.category.findFirst({
          where: {
            slug: {
              contains: slug,
              mode: 'insensitive',
            },
          },
        });
        
        if (category) {
          whereClause.categoryId = category.id;
        } else {
          console.log(`No category found with slug containing: ${collectionSlug}`);
        }
      } catch (error) {
        console.error('Error finding category by slug:', error);
      }
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        productColors: true,
        productSizes: true,
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST to create a new product
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      description,
      regularPrice,
      sellingPrice,
      discount,
      categoryId,
      stock,
      colors,
      sizes,
    } = body;

    // Validate required fields
    if (!name || !description || !regularPrice || !sellingPrice || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if colors are provided
    if (!colors || colors.length === 0) {
      return NextResponse.json(
        { error: 'At least one color variant is required' },
        { status: 400 }
      );
    }

    // Check if sizes are provided
    if (!sizes || sizes.length === 0) {
      return NextResponse.json({ error: 'At least one size is required' }, { status: 400 });
    }

    // Create the product with a transaction to ensure all related data is saved
    const product = await prisma.$transaction(async tx => {
      // Create the main product
      const newProduct = await tx.product.create({
        data: {
          name,
          description,
          regularPrice: regularPrice, // Prisma automatically converts string to Decimal
          sellingPrice: sellingPrice, // Prisma automatically converts string to Decimal
          discount: discount ? discount : null, // Prisma automatically converts string to Decimal
          categoryId,
          stock,
          imageUrl: colors[0]?.imageUrl || '', // Use the first color's image as the default
        },
      });

      // Create product colors
      await Promise.all(
        colors.map((color: any) =>
          tx.productColor.create({
            data: {
              productId: newProduct.id,
              color: color.color,
              imageUrl: color.imageUrl,
            },
          })
        )
      );

      // Create product sizes
      await Promise.all(
        sizes.map((size: any) =>
          tx.productSize.create({
            data: {
              productId: newProduct.id,
              size: size.size,
              stock: size.stock,
            },
          })
        )
      );

      return newProduct;
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
