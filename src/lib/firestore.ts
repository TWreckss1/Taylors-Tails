import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

function requireDb() {
  if (!db) throw new Error("Firebase not configured. Set NEXT_PUBLIC_FIREBASE_* env vars.");
  return db;
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface Booking {
  id?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  dogName: string;
  dogBreed: string;
  service: string;
  date: string;        // ISO date string YYYY-MM-DD
  time: string;        // e.g. "10:00"
  notes?: string;
  status: "pending" | "confirmed" | "cancelled";
  // Deposit is only requested once a booking is confirmed — never taken
  // up-front — so there's nothing to refund if the owner can't take the slot.
  depositAmount?: number;   // pounds, snapshotted at confirm time
  depositPaid?: boolean;
  depositPaidAt?: Timestamp;
  createdAt?: Timestamp;
}

export interface GalleryItem {
  id?: string;
  beforeUrl: string;
  afterUrl: string;
  dogName?: string;
  breed?: string;
  caption?: string;
  createdAt?: Timestamp;
}

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverUrl?: string;
  published: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ── Bookings ───────────────────────────────────────────────────────────────

// "bookingSlots" mirrors just {date, time, status} for each booking, with no
// customer details — it's the only booking-related collection that's safe to
// let the public /book page read (via a Firestore `list` query), since the
// real "bookings" collection holds names/emails/phone numbers and is kept
// admin-only for list/read.
function slotMirror(id: string, data: Pick<Booking, "date" | "time" | "status">) {
  return setDoc(doc(requireDb(), "bookingSlots", id), data);
}

export async function createBooking(data: Omit<Booking, "id" | "createdAt">) {
  const ref = await addDoc(collection(requireDb(), "bookings"), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  await slotMirror(ref.id, { date: data.date, time: data.time, status: "pending" });
  return ref;
}

export async function getBookings(): Promise<Booking[]> {
  const snap = await getDocs(
    query(collection(requireDb(), "bookings"), orderBy("date", "asc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
}

/** Every currently-occupied time on a date (not cancelled) — safe for public use. */
export async function getBookedSlots(date: string): Promise<string[]> {
  // Filter by date only (no composite index needed) and exclude cancelled
  // client-side — combining this with a "!=" filter requires a Firestore
  // composite index that doesn't exist, which silently broke this query.
  const snap = await getDocs(
    query(collection(requireDb(), "bookingSlots"), where("date", "==", date))
  );
  return snap.docs
    .map((d) => d.data() as { time: string; status: string })
    .filter((d) => d.status !== "cancelled")
    .map((d) => d.time);
}

export async function updateBookingStatus(
  id: string,
  status: Booking["status"],
  date: string,
  time: string,
  depositAmount?: number
) {
  // Snapshot the deposit amount at the moment of confirming, so later
  // price changes in Deposit Settings don't affect bookings already confirmed.
  const updates: Partial<Booking> =
    status === "confirmed" && depositAmount !== undefined
      ? { status, depositAmount, depositPaid: false }
      : { status };
  await updateDoc(doc(requireDb(), "bookings", id), updates);
  // setDoc + merge (not updateDoc) so this also backfills a missing mirror
  // doc for bookings created before the "bookingSlots" collection existed.
  await slotMirror(id, { date, time, status });
}

/** One-off repair for bookings created before the "bookingSlots" mirror
 * collection existed — backfills every booking's mirror doc so older
 * confirmed appointments correctly block nearby slots on the public page. */
export async function syncAllBookingSlots(): Promise<number> {
  const bookings = await getBookings();
  await Promise.all(
    bookings.map((b) => slotMirror(b.id!, { date: b.date, time: b.time, status: b.status }))
  );
  return bookings.length;
}

export async function getBooking(id: string): Promise<Booking | null> {
  const snap = await getDoc(doc(requireDb(), "bookings", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Booking;
}

export async function markDepositPaid(id: string): Promise<void> {
  await updateDoc(doc(requireDb(), "bookings", id), {
    depositPaid: true,
    depositPaidAt: serverTimestamp(),
  });
}

export async function deleteBooking(id: string) {
  await deleteDoc(doc(requireDb(), "bookingSlots", id));
  return deleteDoc(doc(requireDb(), "bookings", id));
}

// ── Gallery ────────────────────────────────────────────────────────────────

export async function createGalleryItem(
  data: Omit<GalleryItem, "id" | "createdAt">
) {
  return addDoc(collection(requireDb(), "gallery"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const snap = await getDocs(
    query(collection(requireDb(), "gallery"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryItem));
}

export async function deleteGalleryItem(id: string) {
  return deleteDoc(doc(requireDb(), "gallery", id));
}

// ── Blog ───────────────────────────────────────────────────────────────────

export async function createBlogPost(
  data: Omit<BlogPost, "id" | "createdAt" | "updatedAt">
) {
  return addDoc(collection(requireDb(), "blog"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getBlogPosts(publishedOnly = true): Promise<BlogPost[]> {
  // Filter by published only (no orderBy) to avoid needing a Firestore
  // composite index; sort client-side instead — same fix as reviews/bookings.
  const constraints = publishedOnly ? [where("published", "==", true)] : [];
  const snap = await getDocs(query(collection(requireDb(), "blog"), ...constraints));
  const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as BlogPost));
  return posts.sort(
    (a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0)
  );
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const snap = await getDocs(
    query(collection(requireDb(), "blog"), where("slug", "==", slug))
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as BlogPost;
}

export async function updateBlogPost(
  id: string,
  data: Partial<Omit<BlogPost, "id" | "createdAt">>
) {
  return updateDoc(doc(requireDb(), "blog", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBlogPost(id: string) {
  return deleteDoc(doc(requireDb(), "blog", id));
}

// ── Reviews ────────────────────────────────────────────────────────────────

export interface Review {
  id?: string;
  name: string;
  dogName: string;
  rating: number; // 1–5
  quote: string;
  status: "pending" | "approved";
  createdAt?: Timestamp;
}

export async function createReview(
  data: Omit<Review, "id" | "status" | "createdAt">
) {
  return addDoc(collection(requireDb(), "reviews"), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export async function getApprovedReviews(): Promise<Review[]> {
  // Filter by status only (no orderBy) to avoid needing a Firestore composite
  // index; sort client-side instead since review counts are small.
  const snap = await getDocs(
    query(collection(requireDb(), "reviews"), where("status", "==", "approved"))
  );
  const reviews = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
  return reviews.sort(
    (a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0)
  );
}

export async function getAllReviews(): Promise<Review[]> {
  const snap = await getDocs(
    query(collection(requireDb(), "reviews"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
}

export async function updateReviewStatus(id: string, status: Review["status"]) {
  return updateDoc(doc(requireDb(), "reviews", id), { status });
}

export async function deleteReview(id: string) {
  return deleteDoc(doc(requireDb(), "reviews", id));
}

// ── Availability ───────────────────────────────────────────────────────────

export interface Availability {
  // 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
  workingDays: number[];
  startTime: string;     // "09:00"
  endTime: string;       // "17:00"
  slotDuration: number;  // minutes e.g. 60
  maxPerSlot: number;    // how many bookings allowed per slot
  bufferHours: number;   // hours blocked either side of a booked slot
  blockedDates: string[];// ["2025-12-25"]
}

export const DEFAULT_AVAILABILITY: Availability = {
  workingDays: [1, 2, 3, 4, 5, 6], // Mon–Sat
  startTime: "09:00",
  endTime: "17:00",
  slotDuration: 60,
  maxPerSlot: 1,
  bufferHours: 3,
  blockedDates: [],
};

export async function getAvailability(): Promise<Availability> {
  const snap = await getDoc(doc(requireDb(), "settings", "availability"));
  if (!snap.exists()) return DEFAULT_AVAILABILITY;
  // Merge with defaults so older saved settings (before bufferHours existed) still work.
  return { ...DEFAULT_AVAILABILITY, ...(snap.data() as Partial<Availability>) };
}

export async function saveAvailability(data: Availability): Promise<void> {
  await setDoc(doc(requireDb(), "settings", "availability"), data);
}

// ── Deposit Settings ─────────────────────────────────────────────────────────

/** Deposit amount in whole pounds, keyed by service name. */
export type DepositSettings = Record<string, number>;

export async function getDepositSettings(): Promise<DepositSettings> {
  const snap = await getDoc(doc(requireDb(), "settings", "deposits"));
  if (!snap.exists()) return {};
  return snap.data() as DepositSettings;
}

export async function saveDepositSettings(data: DepositSettings): Promise<void> {
  await setDoc(doc(requireDb(), "settings", "deposits"), data);
}

/** Generate all time slots between startTime and endTime given a duration */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMins: number
): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  let totalMins = startH * 60 + startM;
  const endTotalMins = endH * 60 + endM;
  while (totalMins + durationMins <= endTotalMins) {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    totalMins += durationMins;
  }
  return slots;
}
