"use client";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { toast } from "sonner";
import { Send, BookPlus } from "lucide-react";

const GENRES = [
  { value: "fantasy", label: "Fantasy" },
  { value: "romance", label: "Romance" },
  { value: "mystery", label: "Mystery" },
  { value: "slice_of_life", label: "Slice of Life" },
  { value: "horror", label: "Horror" },
];

export default function SubmitPage() {
  const submit = useMutation(api.gallery.submit);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", authorName: "", authorEmail: "", description: "", genre: "", coverUrl: "", pagesText: "" });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.authorName || !form.authorEmail || !form.genre || !form.pagesText) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc."); return;
    }
    setLoading(true);
    try {
      const pages = form.pagesText.split("---").map((p) => p.trim()).filter(Boolean);
      await submit({ title: form.title, authorName: form.authorName, authorEmail: form.authorEmail, description: form.description, genre: form.genre, coverUrl: form.coverUrl || undefined, pages });
      toast.success("Đã gửi! Vui lòng chờ admin duyệt.");
      setForm({ title: "", authorName: "", authorEmail: "", description: "", genre: "", coverUrl: "", pagesText: "" });
    } catch { toast.error("Có lỗi xảy ra."); } finally { setLoading(false); }
  };

  const inp: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--color-input)", background: "var(--color-secondary)", fontFamily: "'Inter',sans-serif", fontSize: 14, outline: "none" };
  const lbl: React.CSSProperties = { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "var(--color-primary)", fontFamily: "'Inter',sans-serif" };

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--color-bg)" }}>
      <Navbar />
      <div className="max-w-2xl mx-auto w-full px-4 py-8 md:py-12">
        <div className="flex items-center gap-3 mb-2">
          <BookPlus className="w-7 h-7" style={{ color: "var(--color-primary)" }} />
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>Gửi Tác Phẩm</h1>
        </div>
        <p className="mb-8 text-sm" style={{ color: "var(--color-muted)", fontFamily: "'Inter',sans-serif" }}>
          Gửi truyện/sách digital của bạn. Sau khi admin duyệt, tác phẩm sẽ xuất hiện tại Phòng Trưng Bày.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div><label style={lbl}>Tên tác phẩm *</label><input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Nhập tên truyện..." style={inp} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label style={lbl}>Tên tác giả *</label><input value={form.authorName} onChange={(e) => set("authorName", e.target.value)} placeholder="Bút danh..." style={inp} /></div>
            <div><label style={lbl}>Email *</label><input type="email" value={form.authorEmail} onChange={(e) => set("authorEmail", e.target.value)} placeholder="email@example.com" style={inp} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label style={lbl}>Thể loại *</label><select value={form.genre} onChange={(e) => set("genre", e.target.value)} style={inp}><option value="">-- Chọn --</option>{GENRES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}</select></div>
            <div><label style={lbl}>Ảnh bìa (URL)</label><input value={form.coverUrl} onChange={(e) => set("coverUrl", e.target.value)} placeholder="https://..." style={inp} /></div>
          </div>
          <div><label style={lbl}>Mô tả ngắn</label><textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Tóm tắt..." rows={3} style={{ ...inp, resize: "vertical" as const }} /></div>
          <div>
            <label style={lbl}>Nội dung các trang *</label>
            <p className="text-xs mb-2" style={{ color: "var(--color-muted)" }}>Phân tách từng trang bằng <code style={{ background: "var(--color-accent)", padding: "2px 6px", borderRadius: 4 }}>---</code></p>
            <textarea value={form.pagesText} onChange={(e) => set("pagesText", e.target.value)} placeholder={"Trang 1...\n---\nTrang 2..."} rows={10} style={{ ...inp, resize: "vertical" as const, minHeight: 200 }} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-full text-white font-semibold text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: "var(--color-primary)", fontFamily: "'Inter',sans-serif" }}>
            <Send className="w-4 h-4" />{loading ? "Đang gửi..." : "Gửi Tác Phẩm"}
          </button>
        </form>
      </div>
    </main>
  );
}
