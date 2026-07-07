"use client";
import { useEffect, useRef, useState } from "react";
import {
  getBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  type BlogPost,
} from "@/lib/firestore";
import { uploadOptimizedImage } from "@/lib/storage";
import { PlusCircle, Pencil, Trash2, Eye, EyeOff, X, ImagePlus } from "lucide-react";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const EMPTY: Omit<BlogPost, "id" | "createdAt" | "updatedAt"> = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  coverUrl: "",
  published: false,
};

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try { setPosts(await getBlogPosts(false)); } catch { /* not configured */ }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startNew() {
    setEditing(null);
    setForm({ ...EMPTY });
    setModalOpen(true);
  }

  function startEdit(post: BlogPost) {
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      body: post.body,
      coverUrl: post.coverUrl ?? "",
      published: post.published,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm({ ...EMPTY });
  }

  function handleTitleChange(title: string) {
    setForm((f) => ({
      ...f,
      title,
      slug: editing ? f.slug : slugify(title),
    }));
  }

  async function handleCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await uploadOptimizedImage(file, "blog");
      setForm((f) => ({ ...f, coverUrl: url }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Cover image upload failed: ${msg}`);
    }
    setUploadingCover(false);
    if (coverInputRef.current) coverInputRef.current.value = "";
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing?.id) {
        await updateBlogPost(editing.id, form);
      } else {
        await createBlogPost(form);
      }
      closeModal();
      await load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Blog save failed:", msg, err);
      alert(`Save failed: ${msg}`);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    await deleteBlogPost(id);
    await load();
  }

  async function togglePublished(post: BlogPost) {
    await updateBlogPost(post.id!, { published: !post.published });
    await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#2C2A25]">
          Blog
        </h1>
        <button
          onClick={startNew}
          className="flex items-center gap-2 bg-[#8B9E7A] text-white px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wide hover:bg-[#5E6E51] transition-colors"
        >
          <PlusCircle size={15} />
          New Post
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
          />
          <form
            onSubmit={handleSave}
            className="relative bg-white rounded-2xl border border-[#EEE9D8] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 pt-6">
              <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#2C2A25]">
                {editing ? "Edit Post" : "New Post"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 rounded-lg text-[#7A7265] hover:bg-[#EEE9D8] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">Title *</label>
                  <input required value={form.title} onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">Slug *</label>
                  <input required value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A] font-mono" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">Cover Image (optional)</label>
                  <div className="flex items-center gap-4">
                    {form.coverUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.coverUrl} alt="Cover preview" className="w-20 h-20 rounded-xl object-cover border border-[#EEE9D8]" />
                    )}
                    <div className="flex-1">
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverSelect}
                        disabled={uploadingCover}
                        className="w-full text-sm text-[#7A7265] file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#EEE9D8] file:text-[#2C2A25] hover:file:bg-[#DFC78A]"
                      />
                      <p className="text-xs text-[#7A7265] mt-1 flex items-center gap-1.5">
                        {uploadingCover ? (
                          <>
                            <span className="inline-block w-3 h-3 rounded-full border-2 border-[#8B9E7A] border-t-transparent animate-spin" />
                            Optimizing &amp; uploading…
                          </>
                        ) : (
                          <>
                            <ImagePlus size={12} />
                            Automatically resized and compressed.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">Excerpt *</label>
                  <textarea required rows={2} value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                    className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A] resize-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">Body *</label>
                  <textarea required rows={10} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                    placeholder="Write your post here. Separate paragraphs with blank lines."
                    className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A] resize-y font-mono" />
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 text-sm text-[#2C2A25] cursor-pointer">
                  <input type="checkbox" checked={form.published}
                    onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                    className="rounded accent-[#8B9E7A]" />
                  Publish immediately
                </label>
                <div className="ml-auto flex gap-3">
                  <button type="button" onClick={closeModal}
                    className="px-5 py-2 rounded-full text-sm font-bold border border-[#EEE9D8] text-[#7A7265] hover:border-[#8B9E7A] transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving || uploadingCover}
                    className="px-6 py-2 rounded-full text-sm font-bold bg-[#8B9E7A] text-white hover:bg-[#5E6E51] active:scale-95 transition-all disabled:opacity-60">
                    {saving ? "Saving…" : editing ? "Update Post" : "Publish Post"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Post list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-[#8B9E7A] border-t-transparent animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-center text-[#7A7265] py-8">No blog posts yet.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id}
              className="bg-white rounded-2xl border border-[#EEE9D8] p-5 shadow-sm flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-[#2C2A25]">{post.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    post.published ? "bg-[#B5C9A4]/30 text-[#4A7C59]" : "bg-[#EEE9D8] text-[#7A7265]"
                  }`}>
                    {post.published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-xs text-[#7A7265] font-mono">/blog/{post.slug}</p>
                <p className="text-sm text-[#7A7265] mt-1 line-clamp-2">{post.excerpt}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => togglePublished(post)}
                  className="p-2 rounded-lg text-[#7A7265] hover:bg-[#EEE9D8] transition-colors" title={post.published ? "Unpublish" : "Publish"}>
                  {post.published ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button onClick={() => startEdit(post)}
                  className="p-2 rounded-lg text-[#7A7265] hover:bg-[#EEE9D8] transition-colors">
                  <Pencil size={15} />
                </button>
                <button onClick={() => handleDelete(post.id!)}
                  className="p-2 rounded-lg text-[#C0392B] hover:bg-red-50 transition-colors">
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
