import { Client, Environment, OrdersController } from '@paypal/paypal-server-sdk';

let paypalClientInstance: Client | null = null;
let ordersControllerInstance: OrdersController | null = null;

export const paypalClient = (): Client => {
  if (!paypalClientInstance) {
    const clientId = process.env.PAYPAL_CLIENT_ID!;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
    const mode = process.env.PAYPAL_MODE || 'sandbox';

    paypalClientInstance = new Client({
      environment: mode === 'live' ? Environment.Production : Environment.Sandbox,
      clientCredentialsAuthCredentials: {
        oAuthClientId: clientId,
        oAuthClientSecret: clientSecret,
      },
    });
  }
  return paypalClientInstance;
};

export const getOrdersController = (): OrdersController => {
  if (!ordersControllerInstance) {
    ordersControllerInstance = new OrdersController(paypalClient());
  }
  return ordersControllerInstance;
};

