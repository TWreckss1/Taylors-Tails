import { NextRequest, NextResponse } from "next/server";
import {
  sendNewBookingEmails,
  sendBookingConfirmedEmail,
  sendBookingCancelledEmail,
  type BookingEmailDetails,
} from "@/lib/email-server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { type, booking } = payload as {
      type: "new" | "confirmed" | "cancelled";
      booking: BookingEmailDetails;
    };

    if (
      !type ||
      !booking?.ownerEmail ||
      !booking?.ownerName ||
      !booking?.dogName ||
      !booking?.date ||
      !booking?.time ||
      !booking?.service
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const origin = new URL(request.url).origin;

    if (type === "new") {
      await sendNewBookingEmails(booking, origin);
    } else if (type === "confirmed") {
      await sendBookingConfirmedEmail(booking, origin);
    } else if (type === "cancelled") {
      await sendBookingCancelledEmail(booking);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("notify error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
