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

  const inp = "w-full px-3.5 py-2.5 rounded-lg border border-[#dcd7cc] bg-[#f9f6f0] text-sm outline-none focus:border-[#5a5a40] transition-colors";
  const lbl = "block mb-1.5 text-[13px] font-semibold text-[#5a5a40]";

  return (
    <main className="min-h-screen flex flex-col bg-[#fdfaf6]">
      <Navbar />
      <div className="max-w-2xl mx-auto w-full px-4 py-8 md:py-12">
        <div className="flex items-center gap-3 mb-2">
          <BookPlus className="w-7 h-7 text-[#5a5a40]" />
          <h1 className="text-3xl font-bold text-[#5a5a40]">Gửi Tác Phẩm</h1>
        </div>
        <p className="mb-8 text-sm text-[#8e8a7d]" style={{ fontFamily: "'Inter',sans-serif" }}>
          Gửi truyện/sách digital của bạn. Sau khi admin duyệt, tác phẩm sẽ xuất hiện tại Phòng Trưng Bày.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5" style={{ fontFamily: "'Inter',sans-serif" }}>
          <div><label className={lbl}>Tên tác phẩm *</label><input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Nhập tên truyện..." className={inp} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className={lbl}>Tên tác giả *</label><input value={form.authorName} onChange={(e) => set("authorName", e.target.value)} placeholder="Bút danh..." className={inp} /></div>
            <div><label className={lbl}>Email *</label><input type="email" value={form.authorEmail} onChange={(e) => set("authorEmail", e.target.value)} placeholder="email@example.com" className={inp} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className={lbl}>Thể loại *</label><select value={form.genre} onChange={(e) => set("genre", e.target.value)} className={inp}><option value="">-- Chọn --</option>{GENRES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}</select></div>
            <div><label className={lbl}>Ảnh bìa (URL)</label><input value={form.coverUrl} onChange={(e) => set("coverUrl", e.target.value)} placeholder="https://..." className={inp} /></div>
          </div>
          <div><label className={lbl}>Mô tả ngắn</label><textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Tóm tắt..." rows={3} className={`${inp} resize-y`} /></div>
          <div>
            <label className={lbl}>Nội dung các trang *</label>
            <p className="text-xs mb-2 text-[#8e8a7d]">Phân tách từng trang bằng <code className="bg-[#f2ede4] px-1.5 py-0.5 rounded">---</code></p>
            <textarea value={form.pagesText} onChange={(e) => set("pagesText", e.target.value)} placeholder={"Trang 1...\n---\nTrang 2..."} rows={10} className={`${inp} resize-y min-h-[200px]`} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-full bg-[#5a5a40] text-white font-semibold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#4a4a30] disabled:opacity-50 transition-colors">
            <Send className="w-4 h-4" />{loading ? "Đang gửi..." : "Gửi Tác Phẩm"}
          </button>
        </form>
      </div>
    </main>
  );
}
