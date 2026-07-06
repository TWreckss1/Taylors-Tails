import { SITE } from "@/lib/site";

// All crawlers welcome — including AI assistants (ClaudeBot, GPTBot,
// PerplexityBot, Google-Extended etc.) so the business is discoverable
// when people ask chatbots for local dog groomers.
export function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${SITE.url}/sitemap.xml
`;
  return new Response(body, {
    headers: { "content-type": "text/plain" },
  });
}
