import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Taylor's Tails collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-[70vh] bg-[#F8F7F0] py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#EEE9D8] p-8 shadow-sm">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#2C2A25] mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#7A7265] mb-6">Last updated: 8 July 2026</p>

        <div className="space-y-6 text-sm text-[#7A7265] leading-relaxed">
          <p>
            This policy explains what personal information Taylor&apos;s Tails
            Dog Grooming Salon collects when you use this website or book an
            appointment with us, why we collect it, and the choices and
            rights you have over it.
          </p>

          <div>
            <h2 className="font-bold text-[#2C2A25] text-base mb-2">Who we are</h2>
            <p>
              Taylor&apos;s Tails Dog Grooming Salon is the data controller
              for the information described in this policy.
              <br />
              {SITE.address.street}, {SITE.address.town}, {SITE.address.postcode}, United Kingdom.
              <br />
              Email:{" "}
              <a href={`mailto:${SITE.email}`} className="text-[#8B9E7A] font-bold hover:text-[#5E6E51] underline underline-offset-2">
                {SITE.email}
              </a>
            </p>
          </div>

          <div>
            <h2 className="font-bold text-[#2C2A25] text-base mb-2">What we collect</h2>
            <p className="mb-2">When you make a booking, we collect:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your name, email address, and phone number</li>
              <li>Your dog&apos;s name and breed</li>
              <li>Your chosen service, appointment date and time</li>
              <li>Any optional notes you add (e.g. behavioural notes relevant to grooming)</li>
            </ul>
            <p className="mt-2">
              We do not ask you to submit any health or veterinary records
              through this website — the health and vaccination confirmation
              in our{" "}
              <Link href="/terms" className="text-[#8B9E7A] font-bold hover:text-[#5E6E51] underline underline-offset-2">
                Terms &amp; Conditions
              </Link>{" "}
              is an agreement you make with us, not data we store as part of
              your booking record.
            </p>
            <p className="mt-2">
              If you pay a deposit, this is handled directly by our payment
              provider, Stripe — we never see or store your card details.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-[#2C2A25] text-base mb-2">How we use it</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To arrange, confirm, and manage your grooming appointment</li>
              <li>To send you booking confirmations and reminders by email</li>
              <li>To take deposit payments where applicable</li>
              <li>To improve this website, only where you&apos;ve consented to analytics cookies</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[#2C2A25] text-base mb-2">Who we share it with</h2>
            <p className="mb-2">
              We use a small number of trusted service providers to run this
              website and our booking system. Each only receives what it
              needs to do its job, and none of them may use your information
              for their own marketing:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Firebase/Google Cloud — secure hosting, sign-in, and storage of booking records</li>
              <li>Brevo — sending booking confirmation and notification emails</li>
              <li>Stripe — processing deposit payments</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[#2C2A25] text-base mb-2">How long we keep it</h2>
            <p>
              We keep booking and contact information only for as long as
              needed to provide our services and meet our legal and
              accounting obligations, after which it is deleted.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-[#2C2A25] text-base mb-2">Your rights</h2>
            <p>
              Under UK data protection law, you have the right to access,
              correct, or ask us to delete your personal information, object
              to or restrict how we use it, and request a copy in a portable
              format. To exercise any of these rights, email{" "}
              <a href={`mailto:${SITE.email}`} className="text-[#8B9E7A] font-bold hover:text-[#5E6E51] underline underline-offset-2">
                {SITE.email}
              </a>
              . If you&apos;re unhappy with how we&apos;ve handled your data, you can
              also complain to the Information Commissioner&apos;s Office at{" "}
              <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-[#8B9E7A] font-bold hover:text-[#5E6E51] underline underline-offset-2">
                ico.org.uk
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="font-bold text-[#2C2A25] text-base mb-2">Cookies</h2>
            <p>
              This website uses cookies. See our{" "}
              <Link href="/cookie-policy" className="text-[#8B9E7A] font-bold hover:text-[#5E6E51] underline underline-offset-2">
                Cookie Policy
              </Link>{" "}
              for details on what we use and how to manage your preferences.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-[#2C2A25] text-base mb-2">Changes to this policy</h2>
            <p>
              We may update this policy from time to time. Any changes will
              be posted on this page with an updated date at the top.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
