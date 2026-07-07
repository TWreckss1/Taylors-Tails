import type { Metadata } from "next";
import DisclaimerDocument from "@/components/DisclaimerDocument";

export const metadata: Metadata = {
  title: "Senior Dog Disclaimer",
  robots: { index: false, follow: false },
};

export default function SeniorDisclaimerPage() {
  return (
    <DisclaimerDocument
      eyebrow="General Client Agreement"
      title="Senior Dog Disclaimer"
      intro={[
        "At Taylor's Tails Dog Grooming Salon, we welcome dogs of all ages. However, senior dogs (typically aged 8+ years) may have special needs or health concerns that require extra care and caution during grooming.",
        "Older dogs may have age-related conditions such as arthritis, heart conditions, respiratory issues, or decreased mobility and tolerance to stress. As such, grooming can pose additional risks.",
      ]}
      items={[
        "I understand that Taylor's Tails Dog Grooming Salon will take all reasonable precautions and use gentle handling techniques to keep my senior dog safe and comfortable during grooming.",
        "I accept that due to my dog's age and possible health conditions, there is an increased risk of injury, stress, or medical emergency during or after grooming.",
        "I confirm that I have informed Taylor's Tails Dog Grooming Salon of any known health conditions, medications, or concerns relevant to my dog's care.",
        "I will not hold Taylor's Tails Dog Grooming Salon or its staff liable for any adverse reactions, health issues, or complications that may occur as a result of grooming my senior dog.",
        "In case of emergency, I authorise Taylor's Tails Dog Grooming Salon to seek veterinary care at my expense.",
      ]}
    />
  );
}
