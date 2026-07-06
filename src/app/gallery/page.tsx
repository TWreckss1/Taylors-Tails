import type { Metadata } from "next";
import { getGalleryItems } from "@/lib/firestore";

export const metadata: Metadata = {
  title: "Before & After Gallery",
  description:
    "See the transformations — before and after photos of dogs groomed at Taylor's Tails. Real results from our grooming salon.",
};

export const revalidate = 60;

export default async function GalleryPage() {
  let items: Awaited<ReturnType<typeof getGalleryItems>> = [];
  try {
    items = await getGalleryItems();
  } catch {
    // Firebase not configured yet — show placeholder UI
  }

  return (
    <div className="min-h-[80vh] bg-[#F8F7F0] py-16 px-4">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-[#8B9E7A] text-sm font-bold uppercase tracking-widest">
            Transformations
          </span>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-[#2C2A25] mt-2">
            Before &amp; After Gallery
          </h1>
          <p className="text-[#7A7265] mt-4 max-w-lg mx-auto">
            Every dog is unique. See the results our grooming delivers across all
            breeds and coat types.
          </p>
        </div>

        {items.length === 0 ? (
          /* Placeholder when no items yet */
          <div className="text-center py-24">
            <span className="text-6xl mb-6 block">📷</span>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#2C2A25] mb-3">
              Gallery Coming Soon
            </h2>
            <p className="text-[#7A7265] max-w-sm mx-auto">
              Photos will appear here once added from the admin panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#EEE9D8] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-2 divide-x divide-[#EEE9D8]">
                  <div className="relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.beforeUrl}
                      alt={`Before — ${item.dogName ?? "dog"}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 bg-[#2C2A25]/70 text-white text-xs px-2 py-0.5 rounded-full">
                      Before
                    </span>
                  </div>
                  <div className="relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.afterUrl}
                      alt={`After — ${item.dogName ?? "dog"}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 right-2 bg-[#8B9E7A]/90 text-white text-xs px-2 py-0.5 rounded-full">
                      After
                    </span>
                  </div>
                </div>

                {(item.dogName || item.caption) && (
                  <div className="p-4">
                    {item.dogName && (
                      <p className="font-bold text-sm text-[#2C2A25]">
                        {item.dogName}
                        {item.breed && (
                          <span className="font-normal text-[#7A7265]">
                            {" "}
                            — {item.breed}
                          </span>
                        )}
                      </p>
                    )}
                    {item.caption && (
                      <p className="text-xs text-[#7A7265] mt-1">
                        {item.caption}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
