// ── Central site & business info ────────────────────────────────────────────
// Used for SEO metadata, structured data (Google/AI search), and the footer.
// FILL IN the placeholder values marked TODO before launch.

interface SiteConfig {
  name: string;
  legalName: string;
  url: string;
  description: string;
  phone: string;
  email: string;
  address: { street: string; town: string; region: string; postcode: string; country: string };
  geo: { lat: number; lng: number };
  openingHours: { days: string[]; opens: string; closes: string }[];
  social: { facebook: string; instagram: string };
  services: { name: string; description: string }[];
}

// Cloudflare env vars are plain strings — guard against someone entering a
// bare domain (e.g. "taylors-tails.com") without a scheme, which crashes
// `new URL()` in layout.tsx at build time.
function normalizeSiteUrl(raw: string): string {
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withScheme.replace(/\/+$/, "");
}

export const SITE: SiteConfig = {
  name: "Taylor's Tails",
  legalName: "Taylor's Tails Dog Grooming Salon",
  // Override with NEXT_PUBLIC_SITE_URL in Cloudflare if this ever changes
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? "https://taylors-tails.com"),
  description:
    "Professional dog grooming salon offering full grooms, bath & dry, puppy packages and tidy-ups in a warm, caring environment. Book online today.",

  phone: "07966 214750",
  email: "enquiries@taylors-tails.com",
  address: {
    street: "Portacabin, Oak Farm, Station Road",
    town: "Ditton Priors",
    region: "Shropshire",
    postcode: "WV16 6SS",
    country: "GB",
  },
  // Approximate map coordinates — grab from Google Maps (right-click → copy coords)
  geo: { lat: 0, lng: 0 },

  openingHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:00", closes: "17:00" },
  ],

  social: {
    facebook: "",               // full URL, e.g. "https://www.facebook.com/taylorstails"
    instagram: "",
  },

  services: [
    { name: "Small Dog Full Groom (from £45)", description: "Full groom for small breeds: bath, blow dry, nail clip, paw pad trim, sanitary trim, ear clean, full body/face styling and perfume/cologne." },
    { name: "Medium Dog Full Groom (from £55)", description: "Full groom for medium breeds: bath, blow dry, nail clip, paw pad trim, sanitary trim, ear clean, full body/face styling and perfume/cologne." },
    { name: "Large Dog Full Groom (from £65)", description: "Full groom for large breeds: bath, blow dry, nail clip, paw pad trim, sanitary trim, ear clean, full body/face styling and perfume/cologne." },
    { name: "X-Large Dog Full Groom (from £75)", description: "Full groom for X-large breeds: bath, blow dry, nail clip, paw pad trim, sanitary trim, ear clean, full body/face styling and perfume/cologne." },
    { name: "Nail Trim Only (Walk-ins Welcome, from £10)", description: "Quick nail trim — no appointment necessary, walk-ins welcome." },
  ],
};

/** JSON-LD LocalBusiness schema for search engines and AI assistants */
export function localBusinessJsonLd() {
  const hasAddress = Boolean(SITE.address.town);
  return {
    "@context": "https://schema.org",
    "@type": "PetGroomingService" as const,
    name: SITE.legalName,
    url: SITE.url,
    image: `${SITE.url}/logo.png`,
    logo: `${SITE.url}/logo.png`,
    description: SITE.description,
    ...(SITE.phone && { telephone: SITE.phone }),
    ...(SITE.email && { email: SITE.email }),
    ...(hasAddress && {
      address: {
        "@type": "PostalAddress",
        streetAddress: SITE.address.street,
        addressLocality: SITE.address.town,
        addressRegion: SITE.address.region,
        postalCode: SITE.address.postcode,
        addressCountry: SITE.address.country,
      },
    }),
    ...(SITE.geo.lat !== 0 && {
      geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    }),
    openingHoursSpecification: SITE.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    ...(Object.values(SITE.social).some(Boolean) && {
      sameAs: Object.values(SITE.social).filter(Boolean),
    }),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Dog Grooming Services",
      itemListElement: SITE.services.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.name, description: s.description },
      })),
    },
    potentialAction: {
      "@type": "ReserveAction",
      target: `${SITE.url}/book`,
      name: "Book a grooming appointment",
    },
  };
}
