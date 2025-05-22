// Add this at the top of each affected API route file
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate input
    const { reply } = body;

    if (!reply || reply.trim() === '') {
      return NextResponse.json({ error: 'Reply message is required' }, { status: 400 });
    }

    try {
      // Find the contact to get email details
      const contact = await prisma.contact.findUnique({
        where: { id },
      });

      if (!contact) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
      }

      // Validate email
      if (!contact.email) {
        return NextResponse.json(
          { error: 'No email address found for this contact' },
          { status: 400 }
        );
      }

      // Send email
      const emailResponse = await resend.emails.send({
        from: 'Andaz Nu <support@andazenu.com>',
        to: contact.email,
        subject: 'Response to Your Inquiry',
        text: `Dear ${contact.name},

We have reviewed your message and would like to provide the following response:

${reply}

Best regards,
Customer Support Team
Andaz E Nu`,
      });

      // Check for Resend-specific errors
      if (emailResponse.error) {
        console.error('Resend email sending error:', emailResponse.error);
        return NextResponse.json(
          {
            error: 'Failed to send reply email',
            details: emailResponse.error,
          },
          { status: 500 }
        );
      }

      // Update contact with reply and status
      const updatedContact = await prisma.contact.update({
        where: { id },
        data: {
          reply,
          status: 'REPLIED',
        },
      });

      return NextResponse.json(
        {
          message: 'Reply sent successfully',
          contactId: updatedContact.id,
          emailSent: true,
        },
        { status: 200 }
      );
    } catch (dbError) {
      console.error('Database or email error:', dbError);
      return NextResponse.json(
        {
          error: 'Failed to process contact reply',
          details: String(dbError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error processing contact reply:', error);
    return NextResponse.json(
      {
        error: 'Failed to process contact reply',
        details: String(error),
      },
      { status: 500 }
    );
  }
}
