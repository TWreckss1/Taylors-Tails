import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Book your dog's grooming appointment online — choose a date and time that suits you. Full grooms, bath & dry, puppy packages and tidy-ups.",
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
