import { Client, Environment } from '@paypal/paypal-server-sdk';

export const paypalClient = (): Client => {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const mode = process.env.PAYPAL_MODE || 'sandbox';

  return new Client({
    environment: mode === 'live' ? Environment.Production : Environment.Sandbox,
    clientCredentialsAuthCredentials: {
      oAuthClientId: clientId,
      oAuthClientSecret: clientSecret,
    },
  });
};

