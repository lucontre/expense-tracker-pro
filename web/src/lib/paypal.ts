import { PayPalHttpClient, CoreHttpClient, LiveEnvironment, SandboxEnvironment } from '@paypal/paypal-server-sdk';

const environment = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const mode = process.env.PAYPAL_MODE || 'sandbox';

  if (mode === 'live') {
    return new LiveEnvironment(clientId, clientSecret);
  } else {
    return new SandboxEnvironment(clientId, clientSecret);
  }
};

export const paypalClient = (): PayPalHttpClient => {
  return new CoreHttpClient(environment());
};

