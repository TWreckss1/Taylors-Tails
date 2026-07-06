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

export const SITE: SiteConfig = {
  name: "Taylor's Tails",
  legalName: "Taylor's Tails Dog Grooming Salon",
  // Set NEXT_PUBLIC_SITE_URL in Cloudflare once the domain exists
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://taylors-tails.pages.dev",
  description:
    "Professional dog grooming salon offering full grooms, bath & dry, puppy packages and tidy-ups in a warm, caring environment. Book online today.",

  // TODO: fill in real business details
  phone: "",                    // e.g. "+44 7700 900000"
  email: "",                    // public contact email
  address: {
    street: "",                 // e.g. "12 High Street"
    town: "",                   // e.g. "Maidstone"
    region: "",                 // e.g. "Kent"
    postcode: "",               // e.g. "ME14 1AA"
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
    { name: "Full Groom", description: "Complete grooming service: bath, dry, full haircut, nails, ears and finishing touches." },
    { name: "Bath & Dry", description: "Refreshing bath with premium shampoo, blow dry and brush-out." },
    { name: "Puppy Package", description: "Gentle introduction to grooming for puppies — building happy, calm salon visits." },
    { name: "Tidy Up", description: "Trim around the face, feet and sanitary areas between full grooms." },
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
