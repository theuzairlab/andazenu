import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Log the entire request body for debugging
    const body = await request.json();
    console.log('Received contact form data:', body);

    // Validate input
    const { name, email, phone, message } = body;

    // Basic validation
    if (!name || !email || !phone || !message) {
      console.error('Validation failed:', { name, email, phone, message });
      return NextResponse.json(
        { error: 'All fields are required', details: { name, email, phone, message } },
        { status: 400 }
      );
    }

    try {
      // Explicitly log Prisma client to check if it's defined
      console.log('Prisma client:', !!prisma);
      console.log('Prisma client methods:', Object.keys(prisma));

      // Attempt to create contact
      const contact = await prisma.contact.create({
        data: {
          name,
          email,
          phone,
          message,
          status: 'NEW',
        },
      });

      console.log('Contact created successfully:', contact);

      return NextResponse.json(
        {
          message: 'Message sent successfully',
          contactId: contact.id,
        },
        { status: 201 }
      );
    } catch (dbError) {
      // Log detailed database error
      console.error('Database error details:', {
        error: dbError,
        errorName: (dbError as Error).name,
        errorMessage: (dbError as Error).message,
        stack: (dbError as Error).stack,
      });

      return NextResponse.json(
        {
          error: 'Failed to save message to database',
          details: String(dbError),
          errorType: (dbError as Error).name,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    // Log any other unexpected errors
    console.error('Unexpected contact form submission error:', {
      error,
      errorName: (error as Error).name,
      errorMessage: (error as Error).message,
      stack: (error as Error).stack,
    });

    return NextResponse.json(
      {
        error: 'Failed to process contact form',
        details: String(error),
        errorType: (error as Error).name,
      },
      { status: 500 }
    );
  }
}

// GET route to fetch contacts for admin
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin (you'll need to implement this middleware)
    // For now, we'll skip authentication for demonstration
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const contacts = await prisma.contact.findMany({
      where: {
        status: status as any,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.contact.count({
      where: {
        status: status as any,
      },
    });

    return NextResponse.json({
      contacts,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}
