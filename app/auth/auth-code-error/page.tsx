
'use client';

import Link from 'next/link';

export default function AuthCodeError() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded shadow text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
                <p className="text-gray-700 mb-6">
                    There was a problem signing you in with Google. The authentication code could not be exchanged for a session.
                </p>
                <div className="bg-gray-100 p-4 rounded mb-6 text-left text-sm">
                    <p className="font-semibold">Possible causes:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>The login link expired (they only last a short time).</li>
                        <li>There is a configuration mismatch in the server settings.</li>
                        <li>Your browser cookies are disabled or blocked.</li>
                    </ul>
                </div>
                <Link
                    href="/auth/login"
                    className="inline-block bg-[#F4008A] text-white px-6 py-2 rounded font-medium hover:bg-[#d00075] transition-colors"
                >
                    Return to Login
                </Link>
            </div>
        </div>
    );
}
