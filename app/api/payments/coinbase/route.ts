import { NextResponse } from 'next/server';
import { Client, resources } from 'coinbase-commerce-node';

// Initialize Coinbase Commerce client
// Note: In a real app, this should be in an environment variable
// For this demo, we'll check if the key exists
const COINBASE_API_KEY = process.env.COINBASE_COMMERCE_API_KEY;

if (COINBASE_API_KEY) {
    Client.init(COINBASE_API_KEY);
}

export async function POST(request: Request) {
    try {
        if (!COINBASE_API_KEY) {
            console.warn('COINBASE_COMMERCE_API_KEY is not set');
            // For demo purposes, if no key is set, we'll return a mock URL or error
            // In production, this should error out
            return NextResponse.json(
                { error: 'Payment gateway configuration missing' },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { amount, currency, description, metadata } = body;

        if (!amount || !currency) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const chargeData = {
            name: 'Print with Muri',
            description: description || '3D Printing Service',
            local_price: {
                amount: amount.toString(),
                currency: currency,
            },
            pricing_type: 'fixed_price',
            metadata: metadata || {},
        };

        const charge = await resources.Charge.create(chargeData);

        return NextResponse.json({
            hosted_url: charge.hosted_url,
            id: charge.id,
        });
    } catch (error: any) {
        console.error('Coinbase Commerce Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create charge' },
            { status: 500 }
        );
    }
}
