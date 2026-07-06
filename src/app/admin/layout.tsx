"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthChange } from "@/lib/auth";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  Images,
  FileText,
  LogOut,
  Menu,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { User } from "firebase/auth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/availability", label: "Availability", icon: CalendarDays },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    return onAuthChange((u) => {
      setUser(u);
      if (!u && pathname !== "/admin/login") {
        router.replace("/admin/login");
      }
    });
  }, [router, pathname]);

  // Close sidebar on route change
  useEffect(() => setSidebarOpen(false), [pathname]);

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F0]">
        <div className="w-8 h-8 rounded-full border-4 border-[#8B9E7A] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user && pathname !== "/admin/login") return null;
  if (pathname === "/admin/login") return <>{children}</>;

  const SidebarContent = () => (
    <>
      <div className="mb-8 px-2 flex items-center justify-between">
        <div>
          <p className="font-[family-name:var(--font-playfair)] text-[#B5C9A4] font-bold text-lg leading-tight">
            Taylor&apos;s Tails
          </p>
          <p className="text-[#5A5650] text-xs mt-0.5">Admin Panel</p>
        </div>
        {/* Close button — mobile only */}
        <button
          className="md:hidden text-[#5A5650] hover:text-[#EEE9D8] p-1"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors",
              pathname === href
                ? "bg-[#8B9E7A] text-white"
                : "text-[#7A7265] hover:text-[#EEE9D8] hover:bg-[#3C3A35]"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <button
        onClick={() => signOut().then(() => router.replace("/admin/login"))}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#7A7265] hover:text-[#EEE9D8] hover:bg-[#3C3A35] transition-colors mt-4"
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </>
  );

  return (
    <div className="min-h-screen flex bg-[#F8F7F0]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed on mobile (slide-in), static on desktop */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-40 w-56 bg-[#2C2A25] flex flex-col py-8 px-4 shrink-0 transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-20 bg-white border-b border-[#EEE9D8] px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#7A7265] hover:text-[#2C2A25] p-1"
          >
            <Menu size={22} />
          </button>
          <p className="font-[family-name:var(--font-playfair)] font-bold text-[#2C2A25]">
            Admin Panel
          </p>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
