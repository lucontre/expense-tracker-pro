import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const supabase = await createClient();

  try {
    // Process webhook event
    switch (body.event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED':
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const subscriptionId = body.resource.id;
        const payerEmail = body.resource.subscriber?.email_address;

        // Find user by email
        if (payerEmail) {
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('email', payerEmail)
            .single();

          if (user) {
            // Update user subscription plan
            await supabase
              .from('users')
              .update({ subscription_plan: 'pro' })
              .eq('id', user.id);

            // Create subscription record
            const periodEnd = new Date();
            periodEnd.setMonth(periodEnd.getMonth() + 1);

            await supabase
              .from('user_subscriptions')
              .upsert({
                user_id: user.id,
                plan_id: 'pro',
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: periodEnd.toISOString(),
                paypal_subscription_id: subscriptionId,
              }, {
                onConflict: 'user_id',
              });
          }
        }
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        const subscriptionId = body.resource.id;

        // Find subscription by PayPal subscription ID
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('paypal_subscription_id', subscriptionId)
          .single();

        if (subscription) {
          // Update user subscription plan to free
          await supabase
            .from('users')
            .update({ subscription_plan: 'free' })
            .eq('id', subscription.user_id);

          // Update subscription status
          await supabase
            .from('user_subscriptions')
            .update({ status: 'cancelled' })
            .eq('user_id', subscription.user_id);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${body.event_type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing PayPal webhook:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

