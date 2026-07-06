import { NextRequest, NextResponse } from "next/server";

interface BookingDetails {
  ownerName: string;
  ownerEmail: string;
  dogName: string;
  service: string;
  date: string;
  time: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function emailShell(heading: string, body: string): string {
  return `
  <div style="background:#F8F7F0;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #EEE9D8;">
      <div style="background:#8B9E7A;padding:28px 32px;">
        <h1 style="margin:0;color:#ffffff;font-size:22px;">Taylor's Tails</h1>
        <p style="margin:4px 0 0;color:#E8EFE0;font-size:13px;">Dog Grooming Salon</p>
      </div>
      <div style="padding:32px;">
        <h2 style="margin:0 0 16px;color:#2C2A25;font-size:19px;">${heading}</h2>
        ${body}
      </div>
      <div style="background:#F8F7F0;padding:16px 32px;border-top:1px solid #EEE9D8;">
        <p style="margin:0;color:#7A7265;font-size:12px;">Taylor's Tails Dog Grooming Salon</p>
      </div>
    </div>
  </div>`;
}

function detailsTable(b: BookingDetails): string {
  const rows = [
    ["Dog", b.dogName],
    ["Service", b.service],
    ["Date", formatDate(b.date)],
    ["Time", b.time],
  ];
  return `<table style="width:100%;border-collapse:collapse;margin:16px 0;">
    ${rows
      .map(
        ([k, v]) =>
          `<tr>
            <td style="padding:8px 0;color:#7A7265;font-size:14px;border-bottom:1px solid #EEE9D8;">${k}</td>
            <td style="padding:8px 0;color:#2C2A25;font-size:14px;font-weight:bold;text-align:right;border-bottom:1px solid #EEE9D8;">${v}</td>
          </tr>`
      )
      .join("")}
  </table>`;
}

async function sendEmail(to: string, toName: string, subject: string, html: string) {
  const apiKey = process.env.BREVO_API_KEY;
  const sender = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !sender) throw new Error("Email not configured");

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Taylor's Tails", email: sender },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brevo error ${res.status}: ${text}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { type, booking } = payload as {
      type: "new" | "confirmed" | "cancelled";
      booking: BookingDetails;
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

    const ownerEmail = process.env.OWNER_NOTIFY_EMAIL;

    if (type === "new") {
      // 1. Receipt to the customer
      const customerHtml = emailShell(
        `Thanks, ${booking.ownerName}! We've received your booking.`,
        `<p style="color:#7A7265;font-size:14px;line-height:1.6;">
          ${booking.dogName} is booked in — we'll be in touch within 24 hours to confirm your appointment.
        </p>
        ${detailsTable(booking)}
        <p style="color:#7A7265;font-size:13px;line-height:1.6;">
          Need to change anything? Just reply to this email.
        </p>`
      );
      await sendEmail(
        booking.ownerEmail,
        booking.ownerName,
        `Booking received — ${booking.dogName} at Taylor's Tails 🐾`,
        customerHtml
      );

      // 2. Alert to Taylor
      if (ownerEmail) {
        const ownerHtml = emailShell(
          `New booking request`,
          `<p style="color:#7A7265;font-size:14px;line-height:1.6;">
            <strong style="color:#2C2A25;">${booking.ownerName}</strong> (${booking.ownerEmail}) has requested a booking.
          </p>
          ${detailsTable(booking)}
          <p style="font-size:14px;">
            <a href="${new URL(request.url).origin}/admin/bookings" style="color:#8B9E7A;font-weight:bold;">Open the admin panel</a> to confirm or decline.
          </p>`
        );
        await sendEmail(ownerEmail, "Taylor", `New booking: ${booking.dogName} — ${booking.date} ${booking.time}`, ownerHtml);
      }
    } else if (type === "confirmed") {
      const html = emailShell(
        `Great news, ${booking.ownerName} — you're confirmed! 🎉`,
        `<p style="color:#7A7265;font-size:14px;line-height:1.6;">
          ${booking.dogName}'s appointment is confirmed. We look forward to seeing you both!
        </p>
        ${detailsTable(booking)}
        <p style="color:#7A7265;font-size:13px;line-height:1.6;">
          Need to reschedule? Just reply to this email as soon as you can.
        </p>
        <p style="color:#7A7265;font-size:13px;line-height:1.6;">
          After your visit, we'd love to hear how it went —
          <a href="${new URL(request.url).origin}/review" style="color:#8B9E7A;font-weight:bold;">leave us a review</a>.
        </p>`
      );
      await sendEmail(
        booking.ownerEmail,
        booking.ownerName,
        `Confirmed! ${booking.dogName}'s grooming appointment 🐾`,
        html
      );
    } else if (type === "cancelled") {
      const html = emailShell(
        `Your booking has been cancelled`,
        `<p style="color:#7A7265;font-size:14px;line-height:1.6;">
          Hi ${booking.ownerName}, unfortunately ${booking.dogName}'s appointment below has been cancelled.
        </p>
        ${detailsTable(booking)}
        <p style="color:#7A7265;font-size:13px;line-height:1.6;">
          Sorry for any inconvenience — you're welcome to book another slot on our website, or reply to this email if you have questions.
        </p>`
      );
      await sendEmail(
        booking.ownerEmail,
        booking.ownerName,
        `Booking cancelled — ${booking.dogName} at Taylor's Tails`,
        html
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("notify error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
