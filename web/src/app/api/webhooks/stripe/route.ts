import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-10-29.clover',
  });
};

const getWebhookSecret = () => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }
  return secret;
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    const webhookSecret = getWebhookSecret();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (userId) {
          // Update user subscription plan
          await supabase
            .from('users')
            .update({ subscription_plan: 'pro' })
            .eq('id', userId);

          // Create or update subscription record
          if (session.subscription) {
            const stripe = getStripe();
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string
            );

            await supabase
              .from('user_subscriptions')
              .upsert({
                user_id: userId,
                plan_id: 'pro',
                status: 'active',
                current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
                current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
                cancel_at_period_end: (subscription as any).cancel_at_period_end,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscription.id,
              }, {
                onConflict: 'user_id',
              });
          }
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customer ID
        const { data: subscriptionData } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (subscriptionData) {
          if (subscription.status === 'active') {
            const stripe = getStripe();
            await supabase
              .from('users')
              .update({ subscription_plan: 'pro' })
              .eq('id', subscriptionData.user_id);

            await supabase
              .from('user_subscriptions')
              .update({
                status: 'active',
                current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
                current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
                cancel_at_period_end: (subscription as any).cancel_at_period_end,
              })
              .eq('user_id', subscriptionData.user_id);
          } else {
            await supabase
              .from('users')
              .update({ subscription_plan: 'free' })
              .eq('id', subscriptionData.user_id);

            await supabase
              .from('user_subscriptions')
              .update({ status: 'cancelled' })
              .eq('user_id', subscriptionData.user_id);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

