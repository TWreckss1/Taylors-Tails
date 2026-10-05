// ── Weekly bookings summary ─────────────────────────────────────────────────
// Sent to the owner every Monday at 9am UK time by the Cron Trigger in
// wrangler.toml (handled in custom-worker.ts). Besides being useful, it keeps
// the Brevo API key active during quiet weeks with no bookings.
//
// Runs outside Next.js, so it can't use the Firebase client SDK (bookings
// aren't publicly readable anyway). Instead it reads Firestore over REST using
// a Google service account stored in the FIREBASE_SERVICE_ACCOUNT secret.

import { emailShell, sendEmail } from "./email-server";
import { SITE } from "./site";

interface SummaryBooking {
  ownerName: string;
  ownerPhone: string;
  dogName: string;
  dogBreed: string;
  service: string;
  date: string;
  time: string;
  status: string;
  depositAmount?: number;
  depositPaid?: boolean;
}

interface ServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

const TIME_ZONE = "Europe/London";

/** Today's date in the UK as YYYY-MM-DD. */
function londonToday(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
}

function londonHour(now: Date): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "numeric", hourCycle: "h23" }).format(now)
  );
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Monday–Sunday of the week containing `isoDate`. */
export function weekRange(isoDate: string): { start: string; end: string } {
  const dow = new Date(isoDate + "T00:00:00Z").getUTCDay(); // 0 = Sunday
  const start = addDays(isoDate, -((dow + 6) % 7));
  return { start, end: addDays(start, 6) };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function formatDay(isoDate: string): string {
  return new Date(isoDate + "T12:00:00Z").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

// ── Google auth (service account → OAuth access token) ─────────────────────

function base64url(data: ArrayBuffer | string): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/datastore",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );

  const pem = sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(`${header}.${claims}`)
  );

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${base64url(sig)}`,
    }),
  });
  if (!res.ok) throw new Error(`Google auth error ${res.status}: ${await res.text()}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

// ── Firestore REST ─────────────────────────────────────────────────────────

type FirestoreValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
};

function plain(v: FirestoreValue | undefined): string | number | boolean | undefined {
  if (!v) return undefined;
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.integerValue !== undefined) return Number(v.integerValue);
  if (v.doubleValue !== undefined) return v.doubleValue;
  if (v.booleanValue !== undefined) return v.booleanValue;
  return undefined;
}

async function fetchBookings(start: string, end: string): Promise<SummaryBooking[]> {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT secret is not set");
  const sa = JSON.parse(raw) as ServiceAccount;
  const token = await getAccessToken(sa);

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents:runQuery`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "bookings" }],
          where: {
            compositeFilter: {
              op: "AND",
              filters: [
                { fieldFilter: { field: { fieldPath: "date" }, op: "GREATER_THAN_OR_EQUAL", value: { stringValue: start } } },
                { fieldFilter: { field: { fieldPath: "date" }, op: "LESS_THAN_OR_EQUAL", value: { stringValue: end } } },
              ],
            },
          },
          orderBy: [{ field: { fieldPath: "date" }, direction: "ASCENDING" }],
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`Firestore error ${res.status}: ${await res.text()}`);

  const rows = (await res.json()) as { document?: { fields: Record<string, FirestoreValue> } }[];
  return rows
    .filter((r) => r.document)
    .map((r) => {
      const f = r.document!.fields;
      const s = (k: string) => String(plain(f[k]) ?? "");
      return {
        ownerName: s("ownerName"),
        ownerPhone: s("ownerPhone"),
        dogName: s("dogName"),
        dogBreed: s("dogBreed"),
        service: s("service"),
        date: s("date"),
        time: s("time"),
        status: s("status"),
        depositAmount: plain(f.depositAmount) as number | undefined,
        depositPaid: plain(f.depositPaid) as boolean | undefined,
      };
    })
    .filter((b) => b.status !== "cancelled")
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

// ── Email ──────────────────────────────────────────────────────────────────

function bookingRow(b: SummaryBooking): string {
  const tags: string[] = [];
  if (b.status === "pending") tags.push(`<span style="color:#C4A55A;font-weight:bold;">Awaiting confirmation</span>`);
  if (b.depositAmount && b.depositAmount > 0) {
    tags.push(
      b.depositPaid
        ? `Deposit £${b.depositAmount.toFixed(2)} paid`
        : `<span style="color:#C4A55A;">Deposit £${b.depositAmount.toFixed(2)} unpaid</span>`
    );
  }
  return `<tr>
    <td style="padding:10px 12px 10px 0;color:#2C2A25;font-size:14px;font-weight:bold;vertical-align:top;border-bottom:1px solid #EEE9D8;white-space:nowrap;">${escapeHtml(b.time)}</td>
    <td style="padding:10px 0;color:#2C2A25;font-size:14px;line-height:1.5;border-bottom:1px solid #EEE9D8;">
      <strong>${escapeHtml(b.dogName)}</strong>${b.dogBreed ? ` (${escapeHtml(b.dogBreed)})` : ""} — ${escapeHtml(b.service)}<br />
      <span style="color:#7A7265;">${escapeHtml(b.ownerName)}${b.ownerPhone ? ` · ${escapeHtml(b.ownerPhone)}` : ""}</span>
      ${tags.length ? `<br /><span style="font-size:13px;color:#7A7265;">${tags.join(" · ")}</span>` : ""}
    </td>
  </tr>`;
}

function summaryHtml(bookings: SummaryBooking[], start: string, end: string): string {
  const range = `${formatDay(start)} – ${formatDay(end)}`;
  if (bookings.length === 0) {
    return emailShell(
      "Your week ahead",
      `<p style="color:#7A7265;font-size:14px;line-height:1.6;">${range}</p>
      <p style="color:#2C2A25;font-size:14px;line-height:1.6;">No bookings this week yet.</p>
      <p style="font-size:14px;"><a href="${SITE.url}/admin/bookings" style="color:#8B9E7A;font-weight:bold;">Open the admin panel</a></p>`
    );
  }

  const byDay = new Map<string, SummaryBooking[]>();
  for (const b of bookings) byDay.set(b.date, [...(byDay.get(b.date) ?? []), b]);
  const pending = bookings.filter((b) => b.status === "pending").length;

  const days = [...byDay.entries()]
    .map(
      ([date, list]) => `<h3 style="margin:24px 0 4px;color:#8B9E7A;font-size:15px;">${formatDay(date)}</h3>
      <table style="width:100%;border-collapse:collapse;">${list.map(bookingRow).join("")}</table>`
    )
    .join("");

  return emailShell(
    "Your week ahead",
    `<p style="color:#7A7265;font-size:14px;line-height:1.6;">${range}</p>
    <p style="color:#2C2A25;font-size:14px;line-height:1.6;">
      <strong>${bookings.length}</strong> appointment${bookings.length === 1 ? "" : "s"} this week${
        pending ? `, <strong style="color:#C4A55A;">${pending} still awaiting confirmation</strong>` : ""
      }.
    </p>
    ${days}
    <p style="font-size:14px;margin-top:24px;"><a href="${SITE.url}/admin/bookings" style="color:#8B9E7A;font-weight:bold;">Open the admin panel</a></p>`
  );
}

function errorHtml(err: unknown): string {
  return emailShell(
    "Your week ahead",
    `<p style="color:#2C2A25;font-size:14px;line-height:1.6;">
      This week's bookings couldn't be loaded automatically, so please check them in the
      <a href="${SITE.url}/admin/bookings" style="color:#8B9E7A;font-weight:bold;">admin panel</a>.
    </p>
    <p style="color:#7A7265;font-size:12px;line-height:1.6;">Details for your web developer: ${escapeHtml(String(err))}</p>`
  );
}

/**
 * Called by the Cron Trigger. The cron fires at both 08:00 and 09:00 UTC so
 * that one of them is always 9am UK time (BST or GMT); the other is skipped.
 * Pass `force` to send regardless of the time (for testing).
 */
export async function sendWeeklySummary(now = new Date(), force = false): Promise<void> {
  if (!force && londonHour(now) !== 9) return;

  const ownerEmail = process.env.OWNER_NOTIFY_EMAIL;
  if (!ownerEmail) throw new Error("OWNER_NOTIFY_EMAIL is not set");

  const { start, end } = weekRange(londonToday(now));
  let html: string;
  let subject: string;
  try {
    const bookings = await fetchBookings(start, end);
    html = summaryHtml(bookings, start, end);
    subject = `This week at Taylor's Tails: ${bookings.length} booking${bookings.length === 1 ? "" : "s"} 🐾`;
  } catch (err) {
    // Still send something, so the owner knows to check and Brevo stays active.
    console.error("weekly summary: failed to load bookings:", err);
    html = errorHtml(err);
    subject = "This week at Taylor's Tails — please check the admin panel";
  }

  await sendEmail(ownerEmail, "Taylor", subject, html);
}
