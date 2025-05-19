import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { deleteImage, getFileIdFromUrl } from '@/lib/imagekit';

const prisma = new PrismaClient();

// GET a single product by ID
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // First await the params promise
    const params = await context.params;
    const productId = params.id;
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        productColors: true,
        productSizes: true,
      },
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT to update a product
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // First await the params promise
    const params = await context.params;
    const productId = params.id;
    const body = await req.json();
    
    const {
      name,
      description,
      regularPrice,
      sellingPrice,
      discount,
      collection,
      stock,
      colors,
      sizes,
    } = body;
    
    // Validate required fields
    if (!name || !description || !regularPrice || !sellingPrice || !collection) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        productColors: true,
        productSizes: true,
      },
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Update the product with a transaction
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Update the main product
      const product = await tx.product.update({
        where: { id: productId },
        data: {
          name,
          description,
          regularPrice: parseFloat(regularPrice),
          sellingPrice: parseFloat(sellingPrice),
          discount: discount ? parseFloat(discount) : null,
          collection,
          stock,
        },
      });
      
      // Handle colors - delete and recreate
      await tx.productColor.deleteMany({
        where: { productId },
      });
      
      await Promise.all(
        colors.map((color: any) =>
          tx.productColor.create({
            data: {
              productId,
              color: color.color,
              imageUrl: color.imageUrl,
            },
          })
        )
      );
      
      // Handle sizes - delete and recreate
      await tx.productSize.deleteMany({
        where: { productId },
      });
      
      await Promise.all(
        sizes.map((size: any) =>
          tx.productSize.create({
            data: {
              productId,
              size: size.size,
              stock: size.stock,
            },
          })
        )
      );
      
      return product;
    });
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE a product
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // First await the params promise
    const params = await context.params;
    const productId = params.id;
    
    // Get the product with its colors to delete images
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        productColors: true,
      },
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Delete the product and associated data with a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all associated colors
      await tx.productColor.deleteMany({
        where: { productId },
      });
      
      // Delete all associated sizes
      await tx.productSize.deleteMany({
        where: { productId },
      });
      
      // Delete the product itself
      await tx.product.delete({
        where: { id: productId },
      });
    });
    
    // Try to delete images from ImageKit (non-blocking)
    try {
      await Promise.all(
        product.productColors.map(async (color) => {
          const fileId = getFileIdFromUrl(color.imageUrl);
          await deleteImage(fileId);
        })
      );
    } catch (imageError) {
      console.error('Error deleting images from ImageKit:', imageError);
      // Continue execution even if image deletion fails
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}