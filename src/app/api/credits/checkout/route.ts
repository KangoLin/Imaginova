import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { stripe, getPriceForCredits } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { credits } = await req.json();
  const amount = typeof credits === "number" && credits > 0 ? credits : null;
  if (!amount) return NextResponse.json({ error: "Invalid credit amount" }, { status: 400 });

  const price = getPriceForCredits(amount);
  if (!price) return NextResponse.json({ error: "Unsupported credit amount" }, { status: 400 });

  const origin = req.headers.get("origin") || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{ price_data: { currency: "usd", product_data: { name: `${amount} Credits` }, unit_amount: price }, quantity: 1 }],
    metadata: { userId: String(userId), credits: String(amount) },
    success_url: `${origin}/credits?success=1`,
    cancel_url: `${origin}/credits?cancelled=1`,
  });

  return NextResponse.json({ url: session.url });
}
