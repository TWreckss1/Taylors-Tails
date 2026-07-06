"use client";
import { useEffect, useRef, useState } from "react";
import {
  getGalleryItems,
  createGalleryItem,
  deleteGalleryItem,
  type GalleryItem,
} from "@/lib/firestore";
import { Trash2, Upload } from "lucide-react";
import { uploadFile } from "@/lib/storage";

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ dogName: "", breed: "", caption: "" });

  async function load() {
    setLoading(true);
    try { setItems(await getGalleryItems()); } catch { /* not configured */ }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const beforeFile = beforeRef.current?.files?.[0];
    const afterFile = afterRef.current?.files?.[0];
    if (!beforeFile || !afterFile) return alert("Please select both before and after images.");

    setUploading(true);
    try {
      const [beforeUrl, afterUrl] = await Promise.all([
        uploadFile(beforeFile, "gallery"),
        uploadFile(afterFile, "gallery"),
      ]);
      await createGalleryItem({ beforeUrl, afterUrl, ...form });
      setForm({ dogName: "", breed: "", caption: "" });
      if (beforeRef.current) beforeRef.current.value = "";
      if (afterRef.current) afterRef.current.value = "";
      await load();
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check Firebase Storage is enabled in your Firebase project.");
    }
    setUploading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this gallery item?")) return;
    await deleteGalleryItem(id);
    await load();
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#2C2A25] mb-8">
        Gallery
      </h1>

      {/* Upload form */}
      <form
        onSubmit={handleUpload}
        className="bg-white rounded-2xl border border-[#EEE9D8] p-6 shadow-sm mb-8"
      >
        <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#2C2A25] mb-4">
          Add New Before &amp; After
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">
              Before Photo *
            </label>
            <input ref={beforeRef} type="file" accept="image/*" required
              className="w-full text-sm text-[#7A7265] file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#EEE9D8] file:text-[#2C2A25] hover:file:bg-[#DFC78A]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">
              After Photo *
            </label>
            <input ref={afterRef} type="file" accept="image/*" required
              className="w-full text-sm text-[#7A7265] file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#EEE9D8] file:text-[#2C2A25] hover:file:bg-[#DFC78A]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">Dog Name</label>
            <input value={form.dogName} onChange={(e) => setForm((f) => ({ ...f, dogName: e.target.value }))}
              className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">Breed</label>
            <input value={form.breed} onChange={(e) => setForm((f) => ({ ...f, breed: e.target.value }))}
              className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">Caption</label>
            <input value={form.caption} onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
              className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]" />
          </div>
        </div>

        <button type="submit" disabled={uploading}
          className="flex items-center gap-2 bg-[#8B9E7A] text-white px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide hover:bg-[#5E6E51] active:scale-95 transition-all disabled:opacity-60">
          <Upload size={15} />
          {uploading ? "Uploading…" : "Upload Photos"}
        </button>
      </form>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-[#8B9E7A] border-t-transparent animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-[#7A7265] py-8">No gallery items yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-[#EEE9D8] overflow-hidden shadow-sm">
              <div className="grid grid-cols-2 divide-x divide-[#EEE9D8]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.beforeUrl} alt="Before" className="w-full aspect-square object-cover" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.afterUrl} alt="After" className="w-full aspect-square object-cover" />
              </div>
              <div className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#2C2A25]">{item.dogName || "—"}</p>
                  <p className="text-xs text-[#7A7265]">{item.breed || ""}</p>
                </div>
                <button onClick={() => handleDelete(item.id!)}
                  className="text-[#C0392B] hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
