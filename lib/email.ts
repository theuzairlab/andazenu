import { Resend } from 'resend';
import { randomUUID } from 'crypto';
import prisma from './prisma';
import { formatPrice } from './priceUtils';

const resend = new Resend(process.env.RESEND_API_KEY);

// Function to send order confirmation emails
export async function sendOrderConfirmation(email: string, order: any): Promise<void> {
  try {
    // Format order items for display in email
    const orderItems = order.orderItems.map((item: any) => {
      const itemPrice = item.price || 0;
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity} × ${item.size}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.color || 'N/A'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatPrice(itemPrice)}</td>
        </tr>
      `;
    }).join('');

    const totalAmount = formatPrice(order.totalAmount || 0);
    
    const { data, error } = await resend.emails.send({
      from: 'Andaze E Nu <onboarding@resend.dev>',
      to: email,
      subject: `Order Confirmed #${order.id.slice(0, 8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center; margin-bottom: 20px;">Thank You for Your Order!</h1>
          
          <div style="background-color: #f8f8f8; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Order Summary</h2>
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.id.slice(0, 8).toUpperCase()}</p>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${order.name}</p>
            <p style="margin: 5px 0;"><strong>Address:</strong> ${order.address}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.phone}</p>
          </div>
          
          <h3 style="color: #333;">Your Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f8f8f8;">
                <th style="text-align: left; padding: 10px;">Item</th>
                <th style="text-align: left; padding: 10px;">Color</th>
                <th style="text-align: left; padding: 10px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="text-align: right; padding: 10px;"><strong>Total:</strong></td>
                <td style="padding: 10px;"><strong>${totalAmount}</strong></td>
              </tr>
            </tfoot>
          </table>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px;">
            <p style="margin-bottom: 15px;">To view your order history and track your orders, please log in to your account:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders" 
               style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Orders
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #777; font-size: 14px;">
            <p>If you have any questions, please contact our customer support team.</p>
            <p>Thank you for shopping with us!</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending confirmation email:', error);
      throw new Error('Failed to send confirmation email');
    }
  } catch (error) {
    console.error('Error in sendOrderConfirmation:', error);
    throw error;
  }
}

// Send OTP email
export async function sendOTP(email: string): Promise<{ token: string }> {
  try {
    // Generate a 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration to 10 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    // Find if there's an existing OTP token for this email
    const existingToken = await prisma.oTPToken.findFirst({
      where: { email },
    });

    // Update or create OTP token in database
    if (existingToken) {
      await prisma.oTPToken.update({
        where: { id: existingToken.id },
        data: {
          token: otpCode,
          expiresAt,
        },
      });
    } else {
      await prisma.oTPToken.create({
        data: {
          id: randomUUID(),
          email,
          token: otpCode,
          expiresAt,
        },
      });
    }

    // Send email with OTP
    const { data, error } = await resend.emails.send({
      from: 'Andaze E Nu <onboarding@resend.dev>',
      to: email,
      subject: 'Verify Your Order',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Verify Your Order</h1>
          <p>Thank you for placing your order. Please use the code below to confirm your order:</p>
          <div style="background-color: #f4f4f4; padding: 12px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px;">
            ${otpCode}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not place this order, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send verification email');
    }

    return { token: otpCode };
  } catch (error) {
    console.error('Error in sendOTP:', error);
    throw new Error('Failed to generate and send OTP');
  }
} 