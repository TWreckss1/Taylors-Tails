import Stripe from "stripe";

let stripe: Stripe | null = null;

/** Lazily creates a Stripe client using the fetch-based HTTP client so it
 * runs on Cloudflare Workers (no Node network APIs). */
export function getStripe(): Stripe {
  if (stripe) return stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  stripe = new Stripe(key, {
    httpClient: Stripe.createFetchHttpClient(),
  });
  return stripe;
}
