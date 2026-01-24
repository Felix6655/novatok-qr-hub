// Stripe configuration with graceful degradation

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export const isStripeConfigured = !!(stripeSecretKey && stripePublishableKey);

// Server-side Stripe instance
export async function getStripe() {
  if (!stripeSecretKey) {
    return null;
  }
  const Stripe = (await import('stripe')).default;
  return new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
  });
}

// Get Stripe status for UI
export function getStripeStatus() {
  return {
    configured: isStripeConfigured,
    publishableKey: stripePublishableKey ? 'Set' : 'Missing',
    secretKey: stripeSecretKey ? 'Set' : 'Missing'
  };
}
