import type { Booking } from "./firestore";

type NotifyType = "new" | "confirmed" | "cancelled";

/**
 * Fire-and-forget email notification. Never throws — a failed email
 * should never break a booking or a status change.
 */
export function sendBookingNotification(type: NotifyType, booking: Booking): void {
  const payload = {
    type,
    booking: {
      id: booking.id,
      ownerName: booking.ownerName,
      ownerEmail: booking.ownerEmail,
      dogName: booking.dogName,
      service: booking.service,
      date: booking.date,
      time: booking.time,
      depositAmount: booking.depositAmount,
    },
  };
  fetch("/api/notify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  }).catch((err) => console.error("Email notification failed:", err));
}
