import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { verifyResetToken } from '@/lib/pin-utils';

export async function POST(request: NextRequest) {
  try {
    const { email, password, resetToken } = await request.json();

    // Validate inputs
    if (!email || !password || !resetToken) {
      return NextResponse.json(
        { error: 'Email, password, and reset token are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Verify the reset token
    const decoded = verifyResetToken(resetToken, 60); // 60 minutes max age

    if (!decoded || decoded.email !== email.toLowerCase().trim()) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
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

    // Check if PIN was verified and not yet used (use admin client to bypass RLS)
    const { data: pinRecord, error: pinError } = await supabaseAdmin
      .from('password_reset_pins')
      .select('*')
      .eq('email', normalizedEmail)
      .not('verified_at', 'is', null)
      .is('used_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (pinError || !pinRecord) {
      return NextResponse.json(
        { error: 'Invalid password reset request. Please start over.' },
        { status: 400 }
      );
    }

    // Get user by email using admin client
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();

    const user = users?.find(u => u.email?.toLowerCase() === normalizedEmail);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update the user's password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: password }
    );

    if (updateError) {
      console.error('Password update error:', updateError);
      throw new Error('Failed to update password');
    }

    // Mark the PIN as used (use admin client to bypass RLS)
    await supabaseAdmin
      .from('password_reset_pins')
      .update({ used_at: new Date().toISOString() })
      .eq('id', pinRecord.id);

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset successfully'
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}
