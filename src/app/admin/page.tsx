import { getBookings, getGalleryItems, getBlogPosts } from "@/lib/firestore";
import { CalendarCheck, Images, FileText, Clock } from "lucide-react";

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

  const pending = bookings.filter((b) => b.status === "pending").length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;

  const stats = [
    { label: "Pending Bookings", value: pending, icon: Clock, color: "text-[#C4A55A]", bg: "bg-[#DFC78A]/20" },
    { label: "Confirmed Bookings", value: confirmed, icon: CalendarCheck, color: "text-[#4A7C59]", bg: "bg-[#B5C9A4]/20" },
    { label: "Gallery Photos", value: gallery.length, icon: Images, color: "text-[#8B9E7A]", bg: "bg-[#B5C9A4]/20" },
    { label: "Blog Posts", value: posts.length, icon: FileText, color: "text-[#8B5E3C]", bg: "bg-[#DFC78A]/20" },
  ];

  const upcoming = bookings
    .filter((b) => b.status !== "cancelled" && b.date >= new Date().toISOString().split("T")[0])
    .slice(0, 5);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#2C2A25] mb-8">
        Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-[#EEE9D8] p-5 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-bold text-[#2C2A25]">{value}</p>
            <p className="text-xs text-[#7A7265] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming bookings */}
      <div className="bg-white rounded-2xl border border-[#EEE9D8] p-6 shadow-sm">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#2C2A25] mb-4">
          Upcoming Appointments
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-[#7A7265] text-sm py-6 text-center">
            No upcoming bookings yet.
          </p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between py-3 border-b border-[#EEE9D8] last:border-0"
              >
                <div>
                  <p className="font-bold text-sm text-[#2C2A25]">
                    {b.dogName}{" "}
                    <span className="font-normal text-[#7A7265]">
                      ({b.dogBreed})
                    </span>
                  </p>
                  <p className="text-xs text-[#7A7265]">
                    {b.ownerName} · {b.service}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#2C2A25]">
                    {b.date} at {b.time}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      b.status === "confirmed"
                        ? "bg-[#B5C9A4]/30 text-[#4A7C59]"
                        : "bg-[#DFC78A]/30 text-[#8B6F2E]"
                    }`}
                  >
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
