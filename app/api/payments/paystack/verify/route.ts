import { NextRequest, NextResponse } from 'next/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    if (!PAYSTACK_SECRET_KEY) {
      console.error('Paystack secret key not configured');
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    // Verify the transaction with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Paystack verification failed:', data);
      return NextResponse.json(
        { error: 'Payment verification failed', details: data },
        { status: response.status }
      );
    }

    // Check if payment was successful
    if (data.status && data.data.status === 'success') {
      return NextResponse.json({
        success: true,
        verified: true,
        amount: data.data.amount / 100, // Paystack returns amount in kobo
        currency: data.data.currency,
        reference: data.data.reference,
        paidAt: data.data.paid_at,
        customer: {
          email: data.data.customer.email,
          firstName: data.data.customer.first_name,
          lastName: data.data.customer.last_name,
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        verified: false,
        message: 'Payment was not successful',
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
