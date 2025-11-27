import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Test 1: Check connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (connectionError && connectionError.code !== 'PGRST116') {
      throw connectionError;
    }

    // Test 2: Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful!',
      tests: {
        connection: connectionError ? 'Failed' : 'Passed',
        auth: authError ? 'No user logged in (expected)' : `User logged in: ${user?.email}`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Supabase connection failed',
      error: error.message || 'Unknown error',
      hint: 'Check your .env.local file and ensure you have run the database migrations',
    }, { status: 500 });
  }
}
