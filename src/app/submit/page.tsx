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

  const inp = "w-full px-4 py-3 rounded-xl border border-[#3d2b1f]/10 bg-[#fdfaf6]/60 text-sm text-[#3d2b1f] outline-none focus:border-[#5a5a40] focus:ring-2 focus:ring-[#5a5a40]/15 transition-all placeholder:text-[#8e8a7d]/50";
  const lbl = "block mb-2 text-[13px] font-semibold text-[#c9bfa9]/80 uppercase tracking-wider";

  return (
    <main className="room-wrapper min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-2xl mx-auto w-full px-6 py-10 md:py-16">
        <div className="bg-[#2a2520]/60 backdrop-blur-xl rounded-2xl p-8 md:p-10 shadow-2xl border border-[#fdfaf6]/6">
          <div className="flex items-center gap-3 mb-3">
            <BookPlus className="w-7 h-7 text-[#c9bfa9]" />
            <h1 className="text-3xl font-bold text-[#fdfaf6]">Gửi Tác Phẩm</h1>
          </div>
          <p className="mb-10 text-sm text-[#c9bfa9]/50" style={{ fontFamily: "'Inter',sans-serif" }}>
            Gửi truyện/sách digital của bạn. Sau khi admin duyệt, tác phẩm sẽ xuất hiện tại Phòng Trưng Bày.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6" style={{ fontFamily: "'Inter',sans-serif" }}>
            <div><label className={lbl}>Tên tác phẩm *</label><input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Nhập tên truyện..." className={inp} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className={lbl}>Tên tác giả *</label><input value={form.authorName} onChange={(e) => set("authorName", e.target.value)} placeholder="Bút danh..." className={inp} /></div>
              <div><label className={lbl}>Email *</label><input type="email" value={form.authorEmail} onChange={(e) => set("authorEmail", e.target.value)} placeholder="email@example.com" className={inp} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className={lbl}>Thể loại *</label><select value={form.genre} onChange={(e) => set("genre", e.target.value)} className={inp}><option value="">-- Chọn --</option>{GENRES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}</select></div>
              <div><label className={lbl}>Ảnh bìa (URL)</label><input value={form.coverUrl} onChange={(e) => set("coverUrl", e.target.value)} placeholder="https://..." className={inp} /></div>
            </div>
            <div><label className={lbl}>Mô tả ngắn</label><textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Tóm tắt..." rows={3} className={`${inp} resize-y`} /></div>
            <div>
              <label className={lbl}>Nội dung các trang *</label>
              <p className="text-xs mb-3 text-[#c9bfa9]/40">Phân tách từng trang bằng <code className="bg-[#fdfaf6]/8 px-1.5 py-0.5 rounded text-[#c9bfa9]/70">---</code></p>
              <textarea value={form.pagesText} onChange={(e) => set("pagesText", e.target.value)} placeholder={"Trang 1...\n---\nTrang 2..."} rows={10} className={`${inp} resize-y min-h-[200px]`} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-full bg-[#5a5a40] text-[#fdfaf6] font-semibold text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 hover:bg-[#6b6b4e] disabled:opacity-50 transition-all shadow-lg hover:shadow-xl">
              <Send className="w-4 h-4" />{loading ? "Đang gửi..." : "Gửi Tác Phẩm"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
