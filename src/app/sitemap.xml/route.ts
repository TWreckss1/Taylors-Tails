import { SITE } from "@/lib/site";
import { getBlogPosts } from "@/lib/firestore";

export async function GET() {
  const urls: { loc: string; priority: number }[] = [
    { loc: SITE.url, priority: 1.0 },
    { loc: `${SITE.url}/book`, priority: 0.9 },
    { loc: `${SITE.url}/offerings`, priority: 0.8 },
    { loc: `${SITE.url}/gallery`, priority: 0.7 },
    { loc: `${SITE.url}/blog`, priority: 0.6 },
  ];

  try {
    const posts = await getBlogPosts(true);
    for (const p of posts) {
      urls.push({ loc: `${SITE.url}/blog/${p.slug}`, priority: 0.5 });
    }
  } catch {
    /* Firebase unavailable — static pages only */
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <priority>${u.priority.toFixed(1)}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml",
      "cache-control": "public, max-age=3600",
    },
  });
}
