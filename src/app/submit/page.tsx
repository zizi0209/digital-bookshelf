"use client";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { toast } from "sonner";
import { Send, BookPlus, UploadCloud, FileText, X } from "lucide-react";

const GENRES = [
  { value: "fantasy", label: "Fantasy" },
  { value: "romance", label: "Romance" },
  { value: "mystery", label: "Mystery" },
  { value: "slice_of_life", label: "Slice of Life" },
  { value: "horror", label: "Horror" },
];

const ACCEPTED = ".pdf,.epub";

export default function SubmitPage() {
  const submit = useMutation(api.gallery.submit);
  const generateUploadUrl = useMutation(api.gallery.generateUploadUrl);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ title: "", authorName: "", authorEmail: "", description: "", genre: "" });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const pickFile = (f: File | null) => {
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "epub") { toast.error("Chỉ chấp nhận file .pdf hoặc .epub"); return; }
    if (f.size > 100 * 1024 * 1024) { toast.error("File tối đa 100MB"); return; }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.authorName || !form.authorEmail || !form.genre) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc."); return;
    }
    if (!file) { toast.error("Vui lòng chọn file PDF hoặc EPUB."); return; }

    setLoading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      if (!res.ok) throw new Error("Upload thất bại");
      const { storageId } = await res.json() as { storageId: string };
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
      await submit({ ...form, fileStorageId: storageId, fileType: ext, fileName: file.name });
      toast.success("Đã gửi! Vui lòng chờ admin duyệt.");
      setForm({ title: "", authorName: "", authorEmail: "", description: "", genre: "" });
      setFile(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally { setLoading(false); }
  };

  const inp = "w-full px-4 py-3 rounded-xl border border-[#3d2b1f]/10 bg-[#fdfaf6]/60 text-sm text-[#3d2b1f] outline-none focus:border-[#5a5a40] focus:ring-2 focus:ring-[#5a5a40]/15 transition-all placeholder:text-[#8e8a7d]/50";
  const lbl = "block mb-2 text-[13px] font-semibold text-[#5a5a40] uppercase tracking-wider";

  return (
    <main className="room-wrapper min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-10 md:py-16">
        <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl rounded-2xl p-8 md:p-10 shadow-lg border border-[#e5e0d5]">
          <div className="flex items-center gap-3 mb-3">
            <BookPlus className="w-7 h-7 text-[#5a5a40]" />
            <h1 className="text-3xl font-bold text-[#3d2b1f]">Gửi Tác Phẩm</h1>
          </div>
          <p className="mb-10 text-sm text-[#8e8a7d]" style={{ fontFamily: "'Inter',sans-serif" }}>
            Gửi truyện/sách digital của bạn (PDF hoặc EPUB). Sau khi admin duyệt, tác phẩm sẽ xuất hiện tại Phòng Trưng Bày.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6" style={{ fontFamily: "'Inter',sans-serif" }}>
            <div><label className={lbl}>Tên tác phẩm *</label><input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Nhập tên truyện..." className={inp} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className={lbl}>Tên tác giả *</label><input value={form.authorName} onChange={(e) => set("authorName", e.target.value)} placeholder="Bút danh..." className={inp} /></div>
              <div><label className={lbl}>Email *</label><input type="email" value={form.authorEmail} onChange={(e) => set("authorEmail", e.target.value)} placeholder="email@example.com" className={inp} /></div>
            </div>
            <div><label className={lbl}>Thể loại *</label>
              <select value={form.genre} onChange={(e) => set("genre", e.target.value)} className={inp}>
                <option value="">-- Chọn --</option>
                {GENRES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Mô tả ngắn</label><textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Tóm tắt..." rows={3} className={`${inp} resize-y`} /></div>

            {/* File upload */}
            <div>
              <label className={lbl}>File sách * <span className="text-[#8e8a7d] normal-case font-normal">(PDF hoặc EPUB, tối đa 100MB)</span></label>
              <input ref={fileRef} type="file" accept={ACCEPTED} className="hidden" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
              {file ? (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#5a5a40]/30 bg-[#f5f2ea]">
                  <FileText className="w-5 h-5 text-[#5a5a40] shrink-0" />
                  <span className="text-sm text-[#3d2b1f] truncate flex-1">{file.name}</span>
                  <span className="text-xs text-[#8e8a7d] shrink-0">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                  <button type="button" onClick={() => setFile(null)} className="text-[#8e8a7d] hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files[0] ?? null); }}
                  className={`cursor-pointer flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-xl border-2 border-dashed transition-all
                    ${dragging ? "border-[#5a5a40] bg-[#5a5a40]/5" : "border-[#3d2b1f]/15 hover:border-[#5a5a40]/50 hover:bg-[#fdfaf6]"}`}
                >
                  <UploadCloud className="w-10 h-10 text-[#5a5a40]/60" />
                  <p className="text-sm text-[#5a5a40] font-medium">Kéo thả hoặc nhấn để chọn file</p>
                  <p className="text-xs text-[#8e8a7d]">.pdf, .epub — tối đa 100 MB</p>
                </div>
              )}
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
