"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Reader } from "@/components/reader";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Shield, CheckCircle, XCircle, Trash2, Eye, Clock, BookCheck, BookX } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

type GalleryItem = {
  _id: Id<"gallery">; title: string; authorName: string; authorEmail: string;
  description: string; genre: string; coverUrl?: string; pages: string[];
  status: string; createdAt: number;
};

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "#fef3c7", text: "#92400e", label: "Chờ duyệt" },
  approved: { bg: "#d1fae5", text: "#065f46", label: "Đã duyệt" },
  rejected: { bg: "#fee2e2", text: "#991b1b", label: "Từ chối" },
};

export default function AdminPage() {
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [preview, setPreview] = useState<GalleryItem | null>(null);
  const pending = useQuery(api.gallery.listPending);
  const all = useQuery(api.gallery.listAll);
  const approve = useMutation(api.gallery.approve);
  const reject = useMutation(api.gallery.reject);
  const remove = useMutation(api.gallery.remove);
  const items = tab === "pending" ? pending : all;

  return (
    <main className="min-h-screen flex flex-col bg-linear-to-b from-[#9b7fd4] to-[#7a5fb0]">
      <Navbar />
      <div className="max-w-5xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-7 h-7 text-white" />
          <h1 className="text-3xl font-bold text-white">Quản Trị</h1>
        </div>

        <div className="flex gap-3 mb-6" style={{ fontFamily: "'Inter',sans-serif" }}>
          {(["pending", "all"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${tab === t ? "bg-white text-[#5a378c] shadow-md" : "bg-white/15 text-white/70 hover:bg-white/25"}`}>
              {t === "pending" ? <><Clock className="w-4 h-4 inline mr-1" />Chờ duyệt ({pending?.length ?? 0})</> : <><BookCheck className="w-4 h-4 inline mr-1" />Tất cả ({all?.length ?? 0})</>}
            </button>
          ))}
        </div>

        {items === undefined ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 rounded-xl bg-white/10 animate-pulse-soft" />)}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-white/60">
            <BookX className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>{tab === "pending" ? "Không có tác phẩm nào đang chờ duyệt." : "Chưa có tác phẩm nào."}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const s = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
              return (
                <div key={item._id} className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl p-5 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-[#2d2440] truncate">{item.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0" style={{ background: s.bg, color: s.text, fontFamily: "'Inter',sans-serif" }}>{s.label}</span>
                      </div>
                      <p className="text-sm text-[#8a7fa0] truncate" style={{ fontFamily: "'Inter',sans-serif" }}>
                        bởi <strong>{item.authorName}</strong> · {item.authorEmail} · {item.genre} · {item.pages.length} trang
                      </p>
                      {item.description && <p className="text-sm mt-1 line-clamp-2 text-[#4a3d60]">{item.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0" style={{ fontFamily: "'Inter',sans-serif" }}>
                      <button className="px-3 py-1.5 rounded-lg text-[13px] font-semibold bg-[#ede7f6] text-[#5a378c] inline-flex items-center gap-1.5 hover:bg-[#d5cce6] transition-colors" onClick={() => setPreview(item as GalleryItem)}>
                        <Eye className="w-4 h-4" />Xem
                      </button>
                      {item.status !== "approved" && (
                        <button className="px-3 py-1.5 rounded-lg text-[13px] font-semibold bg-[#065f46] text-white inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity" onClick={async () => { await approve({ id: item._id }); toast.success("Đã duyệt!"); }}>
                          <CheckCircle className="w-4 h-4" />Duyệt
                        </button>
                      )}
                      {item.status !== "rejected" && (
                        <button className="px-3 py-1.5 rounded-lg text-[13px] font-semibold bg-[#dc2626] text-white inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity" onClick={async () => { await reject({ id: item._id }); toast.info("Đã từ chối."); }}>
                          <XCircle className="w-4 h-4" />Từ chối
                        </button>
                      )}
                      <button className="px-3 py-1.5 rounded-lg text-[13px] font-semibold border border-[#c0392b] text-[#c0392b] inline-flex items-center gap-1.5 hover:bg-[#c0392b] hover:text-white transition-colors"
                        onClick={async () => { if (confirm("Xóa vĩnh viễn?")) { await remove({ id: item._id }); toast.success("Đã xóa."); } }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {preview && <Reader title={preview.title} author={preview.authorName} genre={preview.genre} coverUrl={preview.coverUrl} pages={preview.pages} onClose={() => setPreview(null)} />}
      </AnimatePresence>
    </main>
  );
}
