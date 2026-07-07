import type { Metadata } from "next";
import DisclaimerDocument from "@/components/DisclaimerDocument";

export const metadata: Metadata = {
  title: "Reactive or Anxious Dog Disclaimer",
  robots: { index: false, follow: false },
};

export default function ReactiveDisclaimerPage() {
  return (
    <DisclaimerDocument
      eyebrow="General Client Agreement"
      title="Reactive or Anxious Dog Disclaimer"
      intro={[
        "At Taylor's Tails Dog Grooming Salon, I understand that some dogs may be anxious, reactive, or fearful during grooming. We use patience, experience, and gentle techniques to manage this safely.",
      ]}
      items={[
        "I have disclosed any history of reactivity, anxiety, or aggression to the grooming staff.",
        "I understand that extra time, care, and handling may be required, which may result in additional charges.",
        "I acknowledge that despite best efforts, grooming reactive dogs carries risks of injury to the dog or staff.",
        "I will not hold Taylor's Tails Dog Grooming Salon responsible for any injuries or incomplete grooms due to my dog's behaviour.",
        "I understand that grooming may be stopped at any point if it becomes unsafe.",
      ]}
    />
  );
}
