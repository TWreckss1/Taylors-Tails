import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getBooking, markDepositPaid } from "@/lib/firestore";
import { sendDepositReceiptEmail } from "@/lib/email-server";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    // Async + Web Crypto variant — required for Cloudflare Workers, which
    // don't have Node's synchronous crypto APIs.
    event = await Stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      try {
        await markDepositPaid(bookingId);
        const booking = await getBooking(bookingId);
        if (booking) {
          await sendDepositReceiptEmail(booking);
        }
      } catch (err) {
        console.error("Failed to process deposit payment:", err);
        return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
