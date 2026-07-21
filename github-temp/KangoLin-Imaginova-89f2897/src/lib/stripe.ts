import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
  typescript: true,
});

export const CREDIT_PRICES: Record<number, { price: number; label: string }> = {
  5: { price: 499, label: "5 Credits" },
  10: { price: 999, label: "10 Credits" },
  20: { price: 1899, label: "20 Credits" },
  50: { price: 4499, label: "50 Credits" },
};

export function getPriceForCredits(credits: number): number | null {
  return CREDIT_PRICES[credits]?.price ?? null;
}
