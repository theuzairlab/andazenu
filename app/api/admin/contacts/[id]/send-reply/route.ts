import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication from cookie
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth-server-cookie');
    
    if (!authCookie?.value) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const authData = JSON.parse(authCookie.value);
    if (!authData.isAuthenticated || !authData.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Ensure params.id is properly accessed
    const contactId = params.id;
    if (!contactId) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { customMessage } = body;

    // Get contact details
    const contact = await prisma.contact.findUnique({
      where: {
        id: contactId
      }
    });
    
    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Validate email
    if (!contact.email) {
      return NextResponse.json(
        { error: 'No email address found for this contact' },
        { status: 400 }
      );
    }

    // Default message template
    const defaultMessage = `Hi ${contact.name},

Thank you for contacting us! We've received your message and will get back to you as soon as possible.

If your inquiry is urgent, feel free to reply to this email or reach us directly at our support email.

We appreciate your interest and will be in touch shortly.

Best regards,
Customer Support
Andaz E Nu`;

    // Use custom message if provided, otherwise use default
    const messageBody = customMessage?.trim() || defaultMessage;

    // Send reply email with comprehensive error handling
    try {
      const emailResponse = await resend.emails.send({
        from: 'Andaz E Nu <onboarding@resend.dev>',
        to: contact.email,
        subject: 'Thank You for Reaching Out',
        text: messageBody,
      });

      // Check for Resend-specific errors
      if (emailResponse.error) {
        console.error('Resend email sending error:', emailResponse.error);
        return NextResponse.json(
          { 
            error: 'Failed to send reply email', 
            details: emailResponse.error 
          },
          { status: 500 }
        );
      }

      // Only update status if email is sent successfully
      await prisma.contact.update({
        where: { id: contactId },
        data: { status: 'REPLIED' }
      });

      return NextResponse.json({ 
        success: true,
        message: 'Reply email sent successfully',
        emailData: emailResponse.data
      });

    } catch (emailError) {
      console.error('Comprehensive email sending error:', {
        error: emailError,
        errorName: (emailError as Error).name,
        errorMessage: (emailError as Error).message,
        stack: (emailError as Error).stack
      });

      return NextResponse.json(
        { 
          error: 'Failed to send reply email', 
          details: String(emailError),
          errorType: (emailError as Error).name
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Unexpected error in contact form reply:', {
      error,
      errorName: (error as Error).name,
      errorMessage: (error as Error).message,
      stack: (error as Error).stack
    });

    return NextResponse.json(
      { 
        error: 'Failed to process contact form reply', 
        details: String(error),
        errorType: (error as Error).name
      },
      { status: 500 }
    );
  }
} 