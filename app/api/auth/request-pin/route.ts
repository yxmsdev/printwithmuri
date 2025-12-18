import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { generatePin, hashPin, getExpirationTime } from '@/lib/pin-utils';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 requests per minute
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`request-pin:${clientId}`, RATE_LIMITS.STRICT);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Too many requests. Please try again in ${rateLimit.resetIn} seconds.` },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if user exists with this email using admin client
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();

    const user = users?.find(u => u.email?.toLowerCase() === normalizedEmail);

    if (userError || !user) {
      // For security, don't reveal if user exists
      // Return success even if user doesn't exist
      return NextResponse.json(
        { success: true, message: 'If an account exists with this email, a PIN code has been sent.' },
        { status: 200 }
      );
    }

    // Delete any existing PINs for this email (only one active PIN at a time)
    // Use admin client to bypass RLS
    await supabaseAdmin
      .from('password_reset_pins')
      .delete()
      .eq('email', normalizedEmail);

    // Generate new PIN
    const pin = generatePin();
    const pinHash = hashPin(pin);
    const expiresAt = getExpirationTime(10); // 10 minutes

    // Store PIN in database using admin client to bypass RLS
    const { error: dbError } = await supabaseAdmin
      .from('password_reset_pins')
      .insert({
        email: normalizedEmail,
        pin_hash: pinHash,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
        max_attempts: 5,
      });

    if (dbError) {
      console.error('Database error storing PIN:', dbError);
      throw new Error('Failed to create password reset request');
    }

    // Send PIN via Resend email service
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not configured');
      throw new Error('Email service not configured');
    }

    // Use custom from email if domain is verified, otherwise use Resend's test domain
    // For production: Set RESEND_FROM_EMAIL to your verified domain email
    // For development: Leave unset to use onboarding@resend.dev
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = process.env.RESEND_FROM_NAME || 'Print with Muri';

    console.log(`Sending PIN email from ${fromName} <${fromEmail}>`);

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: normalizedEmail,
        subject: 'Your Password Reset PIN Code',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Password Reset PIN</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f6f6;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f6f6; padding: 40px 0;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                      <!-- Header with colorful border -->
                      <tr>
                        <td style="padding: 0;">
                          <div style="height: 4px; background: linear-gradient(to right, #FFD913 0%, #CF2886 50%, #41D4EA 100%);"></div>
                        </td>
                      </tr>

                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px 40px 20px 40px;">
                          <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #1F1F1F;">Password Reset Request</h1>
                          <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #7A7A7A;">
                            You requested to reset your password for your Print with Muri account. Use the PIN code below to continue:
                          </p>

                          <!-- PIN Code Box -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                            <tr>
                              <td align="center" style="background-color: #F6F6F6; border-radius: 8px; padding: 24px;">
                                <div style="font-size: 14px; font-weight: 500; color: #7A7A7A; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Your PIN Code</div>
                                <div style="font-size: 48px; font-weight: 700; color: #F4008A; letter-spacing: 8px; font-family: 'Courier New', monospace;">${pin}</div>
                              </td>
                            </tr>
                          </table>

                          <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 20px; color: #7A7A7A;">
                            <strong style="color: #1F1F1F;">This PIN code will expire in 10 minutes.</strong><br>
                            You have 5 attempts to enter the correct code.
                          </p>
                        </td>
                      </tr>

                      <!-- Security Notice -->
                      <tr>
                        <td style="padding: 0 40px 40px 40px;">
                          <div style="background-color: #FFF5F5; border-left: 4px solid #F4008A; padding: 16px; border-radius: 4px;">
                            <p style="margin: 0; font-size: 14px; line-height: 20px; color: #7A7A7A;">
                              <strong style="color: #1F1F1F;">Security Notice:</strong> If you didn't request this password reset, please ignore this email or contact our support team if you have concerns about your account security.
                            </p>
                          </div>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #F6F6F6; padding: 24px 40px; border-top: 1px solid #E6E6E6;">
                          <p style="margin: 0; font-size: 12px; line-height: 18px; color: #7A7A7A; text-align: center;">
                            Print with Muri &copy; ${new Date().getFullYear()}<br>
                            <a href="mailto:support@printwithmuri.com" style="color: #F4008A; text-decoration: none;">support@printwithmuri.com</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('Resend API error:', {
        status: emailResponse.status,
        statusText: emailResponse.statusText,
        error: errorData,
        fromEmail,
        toEmail: normalizedEmail
      });
      
      // Provide more specific error messages
      if (errorData?.name === 'validation_error') {
        throw new Error(`Email validation error: ${errorData.message || 'Invalid email configuration'}`);
      }
      if (errorData?.message?.includes('domain')) {
        throw new Error('Email domain not verified. Please check Resend dashboard.');
      }
      throw new Error(errorData?.message || 'Failed to send email');
    }

    console.log('PIN email sent successfully');

    return NextResponse.json(
      {
        success: true,
        message: 'If an account exists with this email, a PIN code has been sent.',
        email: normalizedEmail // Return email so we can pass it to next step
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Request PIN error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process password reset request. Please try again.' },
      { status: 500 }
    );
  }
}
