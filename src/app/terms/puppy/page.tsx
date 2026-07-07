import type { Metadata } from "next";
import DisclaimerDocument from "@/components/DisclaimerDocument";

export const metadata: Metadata = {
  title: "Puppy Grooming Disclaimer",
  robots: { index: false, follow: false },
};

export default function PuppyDisclaimerPage() {
  return (
    <DisclaimerDocument
      eyebrow="General Client Agreement"
      title="Puppy Grooming Disclaimer"
      intro={[
        "At Taylor's Tails Dog Grooming Salon, we love introducing puppies to grooming in a safe, gentle, and positive way. Puppies are still learning and may be unfamiliar or uncomfortable with grooming procedures.",
      ]}
      items={[
        "I understand that my puppy may be nervous or unsettled during the grooming process and may not tolerate a full groom.",
        "I accept that grooming sessions may be shortened or adjusted based on my puppy's comfort and behaviour.",
        "I understand that accidents can happen due to sudden movements or stress, despite best efforts to prevent them.",
        "I acknowledge that this is part of a learning process, and regular positive exposure to grooming is beneficial for my dog's development.",
      ]}
    />
  );
}
