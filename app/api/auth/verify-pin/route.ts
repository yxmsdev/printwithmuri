import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPin, generateResetToken } from '@/lib/pin-utils';

export async function POST(request: NextRequest) {
  try {
    const { email, pin } = await request.json();

    // Validate inputs
    if (!email || !pin) {
      return NextResponse.json(
        { error: 'Email and PIN are required' },
        { status: 400 }
      );
    }

    // Validate PIN format (6 digits)
    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be 6 digits' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Create admin client with service role key to bypass RLS
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

    // Fetch PIN record from database
    const { data: pinRecord, error: fetchError } = await supabaseAdmin
      .from('password_reset_pins')
      .select('*')
      .eq('email', normalizedEmail)
      .is('used_at', null) // Only unused PINs
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !pinRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired PIN code' },
        { status: 400 }
      );
    }

    // Check if PIN has expired
    const expiresAt = new Date(pinRecord.expires_at);
    const now = new Date();

    if (expiresAt < now) {
      return NextResponse.json(
        { error: 'PIN code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if max attempts reached
    if (pinRecord.attempts >= pinRecord.max_attempts) {
      return NextResponse.json(
        {
          error: 'Maximum attempts reached. Please request a new PIN.',
          maxAttemptsReached: true
        },
        { status: 400 }
      );
    }

    // Verify PIN against hash
    const isValid = verifyPin(pin, pinRecord.pin_hash);

    if (!isValid) {
      // Increment attempt counter
      const newAttempts = pinRecord.attempts + 1;
      await supabaseAdmin
        .from('password_reset_pins')
        .update({ attempts: newAttempts })
        .eq('id', pinRecord.id);

      const remainingAttempts = pinRecord.max_attempts - newAttempts;

      return NextResponse.json(
        {
          error: 'Invalid PIN code',
          remainingAttempts,
          maxAttemptsReached: remainingAttempts <= 0
        },
        { status: 400 }
      );
    }

    // PIN is valid! Mark as verified
    await supabaseAdmin
      .from('password_reset_pins')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', pinRecord.id);

    // Generate a reset token for the password reset page
    const resetToken = generateResetToken(normalizedEmail);

    return NextResponse.json(
      {
        success: true,
        message: 'PIN verified successfully',
        resetToken,
        email: normalizedEmail
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Verify PIN error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify PIN. Please try again.' },
      { status: 500 }
    );
  }
}
