import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leave a Review",
  description:
    "Had your dog groomed at Taylor's Tails? We'd love to hear how it went — leave us a review.",
};

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
