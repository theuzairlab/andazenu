import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';

const resend = new Resend('re_ZyL7tT9P_5w1fEMSnEQhN2VNyruZprXX3');
const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Check if there's an existing OTP token for this email
    const existingToken = await prisma.oTPToken.findFirst({
      where: { email },
    });

    // If token exists, update it. Otherwise, create a new one
    if (existingToken) {
      await prisma.oTPToken.update({
        where: { id: existingToken.id },
        data: {
          token: otp,
          expiresAt,
        },
      });
    } else {
      await prisma.oTPToken.create({
        data: {
          email,
          token: otp,
          expiresAt,
        },
      });
    }

    // Send email with OTP
    const { data, error } = await resend.emails.send({
      from: 'Andaze E Nu <onboarding@resend.dev>',
      to: email,
      subject: 'Your login OTP code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">T-Shirt Store Login</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">
            Here's your one-time password to login to your account. This code will expire in 5 minutes.
          </p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #777; margin-top: 30px;">
            If you didn't request this OTP, please ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in send-otp route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 