import { NextRequest, NextResponse } from 'next/server';
import { paypalClient } from '@/lib/paypal';
import { createClient } from '@/lib/supabase/server';
import { OrdersCreateRequest } from '@paypal/paypal-server-sdk';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the Pro plan price from database
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('price')
      .eq('id', 'pro')
      .single();

    if (!plan) {
      return NextResponse.json(
        { error: 'Pro plan not found' },
        { status: 400 }
      );
    }

    const price = parseFloat(plan.price.toString());

    // Create PayPal Order for Subscription
    const client = paypalClient();
    const orderRequest = new OrdersCreateRequest();
    
    orderRequest.prefer('return=representation');
    orderRequest.requestBody({
      intent: 'SUBSCRIPTION',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: price.toFixed(2),
          },
          description: 'Expense Tracker Pro - Monthly Subscription',
        },
      ],
      application_context: {
        brand_name: 'Expense Tracker Pro',
        landing_page: 'BILLING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: `${request.headers.get('origin')}/checkout/success`,
        cancel_url: `${request.headers.get('origin')}/checkout?canceled=true`,
      },
    });

    const order = await client.execute(orderRequest);

    // Find approval URL
    const approvalLink = order.result.links?.find(
      (link: any) => link.rel === 'approve'
    );

    if (!approvalLink) {
      return NextResponse.json(
        { error: 'Failed to get approval URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: order.result.id,
      approvalUrl: approvalLink.href,
    });
  } catch (error: any) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}

