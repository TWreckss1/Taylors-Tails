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

export async function createBooking(data: Omit<Booking, "id" | "createdAt">) {
  return addDoc(collection(requireDb(), "bookings"), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export async function getBookings(): Promise<Booking[]> {
  const snap = await getDocs(
    query(collection(requireDb(), "bookings"), orderBy("date", "asc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
}

export async function getBookedSlots(date: string): Promise<string[]> {
  const snap = await getDocs(
    query(
      collection(requireDb(), "bookings"),
      where("date", "==", date),
      where("status", "!=", "cancelled")
    )
  );
  return snap.docs.map((d) => (d.data() as Booking).time);
}

export async function updateBookingStatus(
  id: string,
  status: Booking["status"]
) {
  return updateDoc(doc(requireDb(), "bookings", id), { status });
}

export async function deleteBooking(id: string) {
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
  const constraints = publishedOnly
    ? [where("published", "==", true), orderBy("createdAt", "desc")]
    : [orderBy("createdAt", "desc")];
  const snap = await getDocs(query(collection(requireDb(), "blog"), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BlogPost));
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

// ── Availability ───────────────────────────────────────────────────────────

export interface Availability {
  // 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
  workingDays: number[];
  startTime: string;     // "09:00"
  endTime: string;       // "17:00"
  slotDuration: number;  // minutes e.g. 60
  maxPerSlot: number;    // how many bookings allowed per slot
  blockedDates: string[];// ["2025-12-25"]
}

export const DEFAULT_AVAILABILITY: Availability = {
  workingDays: [1, 2, 3, 4, 5, 6], // Mon–Sat
  startTime: "09:00",
  endTime: "17:00",
  slotDuration: 60,
  maxPerSlot: 1,
  blockedDates: [],
};

export async function getAvailability(): Promise<Availability> {
  const snap = await getDoc(doc(requireDb(), "settings", "availability"));
  if (!snap.exists()) return DEFAULT_AVAILABILITY;
  return snap.data() as Availability;
}

export async function saveAvailability(data: Availability): Promise<void> {
  await setDoc(doc(requireDb(), "settings", "availability"), data);
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
