import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import AnalyticsListener from "@/components/AnalyticsListener";
import GoogleTag from "@/components/GoogleTag";
import { SITE, localBusinessJsonLd } from "@/lib/site";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Taylor's Tails Dog Grooming Salon — Book Online",
    template: "%s | Taylor's Tails Dog Grooming",
  },
  description: SITE.description,
  keywords: [
    "dog grooming",
    "dog groomer",
    "pet grooming salon",
    "full groom",
    "puppy grooming",
    "dog bath and dry",
    "book dog grooming online",
  ],
  openGraph: {
    title: "Taylor's Tails Dog Grooming Salon",
    description: SITE.description,
    url: SITE.url,
    siteName: "Taylor's Tails",
    type: "website",
    locale: "en_GB",
    images: [{ url: "/logo.png", width: 1491, height: 1491, alt: "Taylor's Tails Dog Grooming Salon logo" }],
  },
  twitter: {
    card: "summary",
    title: "Taylor's Tails Dog Grooming Salon",
    description: SITE.description,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable}`}>
      <body className="bg-[#F8F7F0] text-[#2C2A25] antialiased min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
        />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsent />
        <AnalyticsListener />
        <GoogleTag />
      </body>
    </html>
  );
}
