import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getBooking } from "@/lib/firestore";

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = (await request.json()) as { bookingId?: string };
    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    const booking = await getBooking(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.status !== "confirmed") {
      return NextResponse.json(
        { error: "This booking hasn't been confirmed yet" },
        { status: 400 }
      );
    }
    if (booking.depositPaid) {
      return NextResponse.json(
        { error: "Deposit has already been paid for this booking" },
        { status: 400 }
      );
    }
    if (!booking.depositAmount || booking.depositAmount <= 0) {
      return NextResponse.json(
        { error: "No deposit is required for this booking" },
        { status: 400 }
      );
    }

    const origin = new URL(request.url).origin;
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: booking.ownerEmail,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: Math.round(booking.depositAmount * 100),
            product_data: {
              name: `Deposit — ${booking.service} for ${booking.dogName}`,
              description: `Booking on ${booking.date} at ${booking.time}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { bookingId },
      success_url: `${origin}/pay/success?bookingId=${bookingId}`,
      cancel_url: `${origin}/pay/cancelled?bookingId=${bookingId}`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("create-checkout-session error:", err);
    return NextResponse.json({ error: "Failed to start payment" }, { status: 500 });
  }
}
