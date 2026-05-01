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
  description: string; genre: string; coverUrl?: string; pages?: string[];
  fileStorageId?: string; fileType?: string; fileName?: string;
  status: string; createdAt: number;
};

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "rgba(254,243,199,0.15)", text: "#fbbf24", label: "Chờ duyệt" },
  approved: { bg: "rgba(209,250,229,0.12)", text: "#34d399", label: "Đã duyệt" },
  rejected: { bg: "rgba(254,226,226,0.12)", text: "#f87171", label: "Từ chối" },
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
    <main className="room-wrapper min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-5xl mx-auto w-full px-6 sm:px-10 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-7 h-7 text-[#5a5a40]" />
          <h1 className="text-3xl font-bold text-[#3d2b1f]">Quản Trị</h1>
        </div>

        <div className="flex gap-3 mb-8" style={{ fontFamily: "'Inter',sans-serif" }}>
          {(["pending", "all"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${tab === t ? "bg-[#5a5a40] text-[#fdfaf6] shadow-lg" : "bg-[#f2ede4] text-[#8e8a7d] hover:bg-[#e5e0d5] hover:text-[#5c544d]"}`}>
              {t === "pending" ? <><Clock className="w-4 h-4 inline mr-1.5" />Chờ duyệt ({pending?.length ?? 0})</> : <><BookCheck className="w-4 h-4 inline mr-1.5" />Tất cả ({all?.length ?? 0})</>}
            </button>
          ))}
        </div>

        {items === undefined ? (
          <div className="space-y-5">{[1,2,3].map(i => <div key={i} className="h-32 rounded-xl bg-[#fdfaf6]/4 animate-pulse-soft" />)}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-[#8e8a7d]">
            <BookX className="w-14 h-14 mx-auto mb-5 opacity-30" />
            <p className="text-lg font-serif">{tab === "pending" ? "Không có tác phẩm nào đang chờ duyệt." : "Chưa có tác phẩm nào."}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {items.map((item) => {
              const s = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
              return (
                <div key={item._id} className="bg-white/60 backdrop-blur-sm border border-[#e5e0d5] rounded-xl p-6 hover:border-[#dcd7cc] transition-all hover:shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <h3 className="text-lg font-bold text-[#3d2b1f] truncate">{item.title}</h3>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold shrink-0" style={{ background: s.bg, color: s.text, fontFamily: "'Inter',sans-serif" }}>{s.label}</span>
                      </div>
                      <p className="text-sm text-[#8e8a7d] truncate" style={{ fontFamily: "'Inter',sans-serif" }}>
                        bởi <strong className="text-[#5c544d]">{item.authorName}</strong> · {item.authorEmail} · {item.genre}{item.fileName ? ` · ${item.fileName}` : item.pages?.length ? ` · ${item.pages.length} trang` : ""}
                      </p>
                      {item.description && <p className="text-sm mt-2 line-clamp-2 text-[#8e8a7d]/70">{item.description}</p>}
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0" style={{ fontFamily: "'Inter',sans-serif" }}>
                      <button className="px-3.5 py-2 rounded-lg text-[13px] font-semibold bg-[#f2ede4] text-[#5c544d] inline-flex items-center gap-1.5 hover:bg-[#e5e0d5] transition-colors" onClick={() => setPreview(item as GalleryItem)}>
                        <Eye className="w-4 h-4" />Xem
                      </button>
                      {item.status !== "approved" && (
                        <button className="px-3.5 py-2 rounded-lg text-[13px] font-semibold bg-emerald-600/20 text-emerald-400 inline-flex items-center gap-1.5 hover:bg-emerald-600/30 transition-colors" onClick={async () => { await approve({ id: item._id }); toast.success("Đã duyệt!"); }}>
                          <CheckCircle className="w-4 h-4" />Duyệt
                        </button>
                      )}
                      {item.status !== "rejected" && (
                        <button className="px-3.5 py-2 rounded-lg text-[13px] font-semibold bg-red-600/15 text-red-400 inline-flex items-center gap-1.5 hover:bg-red-600/25 transition-colors" onClick={async () => { await reject({ id: item._id }); toast.info("Đã từ chối."); }}>
                          <XCircle className="w-4 h-4" />Từ chối
                        </button>
                      )}
                      <button className="px-3.5 py-2 rounded-lg text-[13px] font-semibold border border-red-400/20 text-red-400/70 inline-flex items-center gap-1.5 hover:bg-red-600/15 hover:text-red-400 transition-colors"
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
        {preview && <Reader title={preview.title} author={preview.authorName} genre={preview.genre} coverUrl={preview.coverUrl} pages={preview.pages ?? []} onClose={() => setPreview(null)} />}
      </AnimatePresence>
    </main>
  );
}
