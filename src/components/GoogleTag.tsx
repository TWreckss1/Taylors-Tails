"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import { hasConsent, CONSENT_EVENT } from "@/lib/cookieConsent";

const GA_MEASUREMENT_ID = "G-183VMJL4G1";

// Gated behind analytics consent to match what the Cookie Policy and Privacy
// Policy promise visitors — nothing here loads until "Accept All" (or
// analytics enabled in preferences).
export default function GoogleTag() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    function sync() {
      setEnabled(hasConsent("analytics"));
    }
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-tag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
