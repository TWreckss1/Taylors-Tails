import { getBlogPostBySlug, getBlogPosts } from "@/lib/firestore";
import { format } from "date-fns";
import type { Timestamp } from "firebase/firestore";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const posts = await getBlogPosts(true);
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post = null;
  try {
    post = await getBlogPostBySlug(slug);
  } catch {
    /* Firebase not configured */
  }

  if (!post) notFound();

  const date = post.createdAt
    ? format((post.createdAt as Timestamp).toDate(), "d MMMM yyyy")
    : "";

  return (
    <div className="min-h-[80vh] bg-[#F8F7F0] py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-[#7A7265] hover:text-[#8B9E7A] transition-colors mb-10"
        >
          <ArrowLeft size={16} />
          Back to Blog
        </Link>

        {post.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverUrl}
            alt={post.title}
            className="w-full h-64 object-cover rounded-2xl mb-8"
          />
        )}

        {date && (
          <p className="text-xs text-[#7A7265] uppercase tracking-wide mb-3">
            {date}
          </p>
        )}

        <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-[#2C2A25] mb-6">
          {post.title}
        </h1>

        <div className="prose prose-stone max-w-none text-[#2C2A25] leading-relaxed">
          {post.body.split("\n").map((para, i) =>
            para.trim() ? (
              <p key={i} className="mb-4 text-[#7A7265]">
                {para}
              </p>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
