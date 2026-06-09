import { getBookings, getGalleryItems, getBlogPosts } from "@/lib/firestore";
import { CalendarCheck, Images, FileText, Clock } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export default async function AdminDashboard() {
  let bookings: Awaited<ReturnType<typeof getBookings>> = [];
  let gallery: Awaited<ReturnType<typeof getGalleryItems>> = [];
  let posts: Awaited<ReturnType<typeof getBlogPosts>> = [];
  try {
    const results = await Promise.all([
      getBookings(),
      getGalleryItems(),
      getBlogPosts(false),
    ]);
    bookings = results[0];
    gallery = results[1];
    posts = results[2];
  } catch { /* Firebase not configured yet */ }

  const today = new Date().toISOString().split("T")[0];
  const pending = bookings.filter((b) => b.status === "pending").length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const todayCount = bookings.filter((b) => b.date === today && b.status !== "cancelled").length;

  const stats = [
    { label: "Pending", value: pending, icon: Clock, color: "text-[#C4A55A]", bg: "bg-[#DFC78A]/20", href: "/admin/bookings" },
    { label: "Confirmed", value: confirmed, icon: CalendarCheck, color: "text-[#4A7C59]", bg: "bg-[#B5C9A4]/20", href: "/admin/bookings" },
    { label: "Gallery Photos", value: gallery.length, icon: Images, color: "text-[#8B9E7A]", bg: "bg-[#B5C9A4]/20", href: "/admin/gallery" },
    { label: "Blog Posts", value: posts.length, icon: FileText, color: "text-[#8B5E3C]", bg: "bg-[#DFC78A]/20", href: "/admin/blog" },
  ];

  const upcoming = bookings
    .filter((b) => b.status !== "cancelled" && b.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 8);

  const todayBookings = upcoming.filter((b) => b.date === today);
  const futureBookings = upcoming.filter((b) => b.date > today);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#2C2A25]">
            Dashboard
          </h1>
          <p className="text-sm text-[#7A7265] mt-1">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        {todayCount > 0 && (
          <span className="bg-[#8B9E7A] text-white text-sm font-bold px-4 py-2 rounded-full">
            {todayCount} appointment{todayCount > 1 ? "s" : ""} today
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl border border-[#EEE9D8] p-5 shadow-sm hover:shadow-md hover:border-[#B5C9A4] transition-all"
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-bold text-[#2C2A25]">{value}</p>
            <p className="text-xs text-[#7A7265] mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Today's appointments */}
      {todayBookings.length > 0 && (
        <div className="bg-[#8B9E7A]/10 border border-[#8B9E7A]/30 rounded-2xl p-6 mb-6">
          <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#2C2A25] mb-4">
            Today&apos;s Appointments
          </h2>
          <div className="space-y-3">
            {todayBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm">
                <div>
                  <p className="font-bold text-sm text-[#2C2A25]">
                    {b.dogName} <span className="font-normal text-[#7A7265]">({b.dogBreed})</span>
                  </p>
                  <p className="text-xs text-[#7A7265]">{b.ownerName} · {b.service}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#2C2A25]">{b.time}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    b.status === "confirmed"
                      ? "bg-[#B5C9A4]/30 text-[#4A7C59]"
                      : "bg-[#DFC78A]/30 text-[#8B6F2E]"
                  }`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming bookings */}
      <div className="bg-white rounded-2xl border border-[#EEE9D8] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#2C2A25]">
            Upcoming Appointments
          </h2>
          <Link href="/admin/bookings" className="text-sm font-bold text-[#8B9E7A] hover:text-[#5E6E51]">
            View all →
          </Link>
        </div>
        {futureBookings.length === 0 && todayBookings.length === 0 ? (
          <p className="text-[#7A7265] text-sm py-6 text-center">No upcoming bookings yet.</p>
        ) : futureBookings.length === 0 ? (
          <p className="text-[#7A7265] text-sm py-4 text-center">No further bookings scheduled.</p>
        ) : (
          <div className="space-y-3">
            {futureBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3 border-b border-[#EEE9D8] last:border-0">
                <div>
                  <p className="font-bold text-sm text-[#2C2A25]">
                    {b.dogName} <span className="font-normal text-[#7A7265]">({b.dogBreed})</span>
                  </p>
                  <p className="text-xs text-[#7A7265]">{b.ownerName} · {b.service}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#2C2A25]">{formatDate(b.date)} at {b.time}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    b.status === "confirmed"
                      ? "bg-[#B5C9A4]/30 text-[#4A7C59]"
                      : "bg-[#DFC78A]/30 text-[#8B6F2E]"
                  }`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
