import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = Number(session.metadata?.userId);
    const credits = Number(session.metadata?.credits);

    if (userId && credits > 0) {
      const insertTx = db.transaction(() => {
        db.prepare(
          "INSERT INTO credit_transactions (user_id, type, amount, description) VALUES (?, 'recharge', ?, ?)"
        ).run(userId, credits, `Recharge (Stripe ${session.id})`);
        db.prepare("UPDATE users SET credits = credits + ? WHERE id = ?").run(credits, userId);
      });
      insertTx();
    }
  }

  return NextResponse.json({ received: true });
}
