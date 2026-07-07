import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts } from "@/lib/firestore";
import { format } from "date-fns";
import type { Timestamp } from "firebase/firestore";

export const metadata: Metadata = {
  title: "Blog — Grooming Tips & News",
  description:
    "Dog grooming tips, coat care advice and news from Taylor's Tails grooming salon.",
};

// Fetch fresh on every request — see gallery/page.tsx for why (ISR's
// `revalidate` doesn't work without a KV cache binding on Cloudflare Workers).
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof getBlogPosts>> = [];
  try {
    posts = await getBlogPosts(true);
  } catch {
    // Firebase not configured yet
  }

  return (
    <div className="min-h-[80vh] bg-[#F8F7F0] py-16 px-4">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-[#8B9E7A] text-sm font-bold uppercase tracking-widest">
            News &amp; Tips
          </span>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-[#2C2A25] mt-2">
            The Tails Blog
          </h1>
          <p className="text-[#7A7265] mt-4 max-w-lg mx-auto">
            Grooming guides, dog care tips, and updates from Taylor&apos;s Tails.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-24">
            <span className="text-6xl mb-6 block">✍️</span>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#2C2A25] mb-3">
              Posts Coming Soon
            </h2>
            <p className="text-[#7A7265] max-w-sm mx-auto">
              Blog posts will appear here once published from the admin panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const date = post.createdAt
                ? format(
                    (post.createdAt as Timestamp).toDate(),
                    "d MMMM yyyy"
                  )
                : "";
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl border border-[#EEE9D8] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {post.coverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverUrl}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="p-6">
                    {date && (
                      <p className="text-xs text-[#7A7265] uppercase tracking-wide mb-2">
                        {date}
                      </p>
                    )}
                    <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#2C2A25] mb-2 group-hover:text-[#8B9E7A] transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-sm text-[#7A7265] line-clamp-3">
                      {post.excerpt}
                    </p>
                    <span className="inline-block mt-4 text-xs font-bold text-[#8B9E7A] uppercase tracking-wide">
                      Read More →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
