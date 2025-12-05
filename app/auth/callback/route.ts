import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/';

    if (code) {
        const supabase = await createClient();
        console.log(`🔐 [Callback] exchanging code for session...`);
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            console.log(`✅ [Callback] Success! User ID: ${data.session?.user?.id}`);
            const baseUrl = process.env.NEXT_PUBLIC_URL || origin;
            // Ensure we don't double slash if next starts with /
            const redirectUrl = `${baseUrl}${next.startsWith('/') ? '' : '/'}${next}`;
            return NextResponse.redirect(redirectUrl);
        } else {
            console.error('❌ [Callback] Error exchanging code:', error);
        }
    } else {
        console.error('❌ [Callback] No code found in URL');
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
