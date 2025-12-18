import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 30 requests per minute
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`newsletter:${clientId}`, RATE_LIMITS.STANDARD);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Too many requests. Please try again in ${rateLimit.resetIn} seconds.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email } = body;

    // Validation
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Insert newsletter signup
    const { data, error } = await supabase
      .from('newsletter_signups')
      .insert([
        {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.toLowerCase().trim(),
        },
      ])
      .select()
      .single();

    if (error) {
      // Check if email already exists
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already subscribed to our newsletter' },
          { status: 409 }
        );
      }

      console.error('Newsletter signup error:', error);
      return NextResponse.json(
        { error: 'Failed to subscribe to newsletter' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully subscribed to newsletter',
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
