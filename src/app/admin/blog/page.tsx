"use client";
import { useEffect, useState } from "react";
import {
  getBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  type BlogPost,
} from "@/lib/firestore";
import { PlusCircle, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

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
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try { setPosts(await getBlogPosts(false)); } catch { /* not configured */ }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startNew() {
    setEditing(null);
    setForm({ ...EMPTY });
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
  }

  function handleTitleChange(title: string) {
    setForm((f) => ({
      ...f,
      title,
      slug: editing ? f.slug : slugify(title),
    }));
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
      setForm({ ...EMPTY });
      setEditing(null);
      await load();
    } catch (err) {
      console.error(err);
      alert("Save failed.");
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

  const isEditorOpen = editing !== null || form.title !== "";

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

      {/* Editor */}
      {isEditorOpen && (
        <form
          onSubmit={handleSave}
          className="bg-white rounded-2xl border border-[#EEE9D8] p-6 shadow-sm mb-8"
        >
          <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#2C2A25] mb-4">
            {editing ? "Edit Post" : "New Post"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">Title *</label>
              <input required value={form.title} onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">Slug *</label>
              <input required value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A] font-mono" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">Cover Image URL</label>
              <input value={form.coverUrl} onChange={(e) => setForm((f) => ({ ...f, coverUrl: e.target.value }))}
                placeholder="https://…"
                className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]" />
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
              <button type="button" onClick={() => { setForm({ ...EMPTY }); setEditing(null); }}
                className="px-5 py-2 rounded-full text-sm font-bold border border-[#EEE9D8] text-[#7A7265] hover:border-[#8B9E7A] transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-6 py-2 rounded-full text-sm font-bold bg-[#8B9E7A] text-white hover:bg-[#5E6E51] active:scale-95 transition-all disabled:opacity-60">
                {saving ? "Saving…" : editing ? "Update Post" : "Publish Post"}
              </button>
            </div>
          </div>
        </form>
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
