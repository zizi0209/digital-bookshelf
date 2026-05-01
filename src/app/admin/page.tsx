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
  _id: Id<"gallery">;
  title: string;
  authorName: string;
  authorEmail: string;
  description: string;
  genre: string;
  coverUrl?: string;
  pages: string[];
  status: string;
  createdAt: number;
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

  const cardStyle: React.CSSProperties = {
    background: "var(--color-bg)", border: "1px solid var(--color-border)",
    borderRadius: 12, padding: 20, transition: "box-shadow .2s",
  };
  const btnBase: React.CSSProperties = {
    padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
    fontFamily: "'Inter',sans-serif", display: "inline-flex", alignItems: "center",
    gap: 6, cursor: "pointer", border: "none", transition: "opacity .2s",
  };

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--color-accent)" }}>
      <Navbar />
      <div className="max-w-5xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-7 h-7" style={{ color: "var(--color-primary)" }} />
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>Quản Trị</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6" style={{ fontFamily: "'Inter',sans-serif" }}>
          {(["pending", "all"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              style={{ background: tab === t ? "var(--color-primary)" : "var(--color-secondary)", color: tab === t ? "#fff" : "var(--color-muted)", border: tab === t ? "none" : "1px solid var(--color-border)" }}>
              {t === "pending" ? <><Clock className="w-4 h-4 inline mr-1" />Chờ duyệt ({pending?.length ?? 0})</> : <><BookCheck className="w-4 h-4 inline mr-1" />Tất cả ({all?.length ?? 0})</>}
            </button>
          ))}
        </div>

        {/* List */}
        {items === undefined ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 rounded-xl animate-pulse-soft" style={{ background: "var(--color-border)" }} />)}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16" style={{ color: "var(--color-muted)" }}>
            <BookX className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>{tab === "pending" ? "Không có tác phẩm nào đang chờ duyệt." : "Chưa có tác phẩm nào."}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const s = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
              return (
                <div key={item._id} style={cardStyle} className="hover:shadow-md">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold truncate" style={{ color: "var(--color-primary)" }}>{item.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0" style={{ background: s.bg, color: s.text, fontFamily: "'Inter',sans-serif" }}>{s.label}</span>
                      </div>
                      <p className="text-sm truncate" style={{ color: "var(--color-muted)", fontFamily: "'Inter',sans-serif" }}>
                        bởi <strong>{item.authorName}</strong> · {item.authorEmail} · {item.genre} · {item.pages.length} trang
                      </p>
                      {item.description && <p className="text-sm mt-1 line-clamp-2" style={{ color: "var(--color-fg)" }}>{item.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button style={{ ...btnBase, background: "var(--color-secondary)", color: "var(--color-primary)" }} onClick={() => setPreview(item as GalleryItem)}>
                        <Eye className="w-4 h-4" />Xem
                      </button>
                      {item.status !== "approved" && (
                        <button style={{ ...btnBase, background: "#065f46", color: "#fff" }} onClick={async () => { await approve({ id: item._id }); toast.success("Đã duyệt!"); }}>
                          <CheckCircle className="w-4 h-4" />Duyệt
                        </button>
                      )}
                      {item.status !== "rejected" && (
                        <button style={{ ...btnBase, background: "#dc2626", color: "#fff" }} onClick={async () => { await reject({ id: item._id }); toast.info("Đã từ chối."); }}>
                          <XCircle className="w-4 h-4" />Từ chối
                        </button>
                      )}
                      <button style={{ ...btnBase, background: "transparent", color: "var(--color-danger)", border: "1px solid var(--color-danger)" }}
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
