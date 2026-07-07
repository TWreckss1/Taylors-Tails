import type { Metadata } from "next";
import DisclaimerDocument from "@/components/DisclaimerDocument";

export const metadata: Metadata = {
  title: "Matted Dog Disclaimer",
  robots: { index: false, follow: false },
};

export default function MattedDisclaimerPage() {
  return (
    <DisclaimerDocument
      eyebrow="General Client Agreement"
      title="Matted Dog Disclaimer"
      intro={[
        "At Taylor's Tails Dog Grooming Salon, the health, safety, and comfort of your dog is our top priority. In cases where a dog is presented with severe matting, the following disclaimer applies:",
        "Due to the condition of your dog's coat, mat removal will be necessary. Mats can cause severe discomfort, skin irritation, bruising, and even hidden infections. Grooming matted dogs carries increased risk of injury, including but not limited to:",
      ]}
      bulletHeading="Matted Coat Release Form"
      bullets={[
        "Skin nicks, cuts, or abrasions",
        "Stress or trauma to the animal",
        "Discovery of underlying health conditions once mats are removed",
        "Uneven or very short haircut due to matting",
      ]}
      outro={[
        "In many cases, dematting is not humane, and we will recommend shaving the coat. This is done for the welfare of your dog and is supported by the Animal Welfare Act 2006.",
      ]}
      items={[
        "I understand that Taylor's Tails Dog Grooming Salon has my dog's best interests in mind and will use professional judgment during the grooming process.",
        "I am aware of the potential risks associated with mat removal and will not hold Taylor's Tails Dog Grooming Salon or its staff responsible for any injuries or aesthetic outcome that may arise as a result of necessary grooming procedures.",
        "I accept that additional charges may apply due to the time and equipment needed to deal with matted coats.",
        "I authorise Taylor's Tails Dog Grooming Salon to proceed with what is deemed the most humane and safe grooming method, including shaving if required.",
      ]}
    />
  );
}
