interface DisclaimerDocumentProps {
  eyebrow: string;
  title: string;
  intro: string[];
  bulletHeading?: string;
  bullets?: string[];
  outro?: string[];
  items: string[];
}

export default function DisclaimerDocument({
  eyebrow,
  title,
  intro,
  bulletHeading,
  bullets,
  outro,
  items,
}: DisclaimerDocumentProps) {
  return (
    <div className="min-h-[70vh] bg-[#F8F7F0] py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#EEE9D8] p-8 shadow-sm">
        <span className="text-[#8B9E7A] text-sm font-bold uppercase tracking-widest">
          {eyebrow}
        </span>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#2C2A25] mt-2 mb-6">
          {title}
        </h1>

        {intro.map((para, i) => (
          <p key={i} className="text-sm text-[#7A7265] leading-relaxed mb-4">
            {para}
          </p>
        ))}

        {bullets && (
          <>
            {bulletHeading && (
              <p className="text-sm font-bold text-[#2C2A25] mb-2">{bulletHeading}</p>
            )}
            <ul className="list-disc pl-5 space-y-1.5 mb-4">
              {bullets.map((b, i) => (
                <li key={i} className="text-sm text-[#7A7265] leading-relaxed">
                  {b}
                </li>
              ))}
            </ul>
          </>
        )}

        {outro?.map((para, i) => (
          <p key={i} className="text-sm text-[#7A7265] leading-relaxed mb-4">
            {para}
          </p>
        ))}

        <p className="text-sm font-bold text-[#2C2A25] mb-4">
          By booking this service, you acknowledge and agree to the following:
        </p>

        <ol className="space-y-4">
          {items.map((term, i) => (
            <li key={i} className="flex gap-3 text-sm text-[#2C2A25] leading-relaxed">
              <span className="font-bold text-[#8B9E7A] shrink-0">{i + 1}.</span>
              {term}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
