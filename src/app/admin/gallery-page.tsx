"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Reader } from "@/components/reader";
import { toast } from "sonner";
import {
  Clock, BookCheck, BookX, Eye, CheckCircle, XCircle, Trash2, Search,
} from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

type GalleryItem = {
  _id: Id<"gallery">; title: string; authorName: string; authorEmail: string;
  description: string; genre: string; coverUrl?: string; pages?: string[];
  fileStorageId?: string; fileType?: string; fileName?: string;
  status: string; createdAt: number;
};

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending:  { bg: "rgba(254,243,199,0.15)", text: "#fbbf24", label: "Chờ duyệt" },
  approved: { bg: "rgba(209,250,229,0.12)", text: "#34d399", label: "Đã duyệt" },
  rejected: { bg: "rgba(254,226,226,0.12)", text: "#f87171", label: "Từ chối" },
};

type FilterStatus = "" | "pending" | "approved" | "rejected";

// ─── Tab: Chờ duyệt ───────────────────────────────────────────────────────────
function PendingTab() {
  const [preview, setPreview] = useState<GalleryItem | null>(null);
  const items = useQuery(api.gallery.listPending);
  const approve = useMutation(api.gallery.approve);
  const reject  = useMutation(api.gallery.reject);
  const remove  = useMutation(api.gallery.remove);

  return (
    <>
      {items === undefined ? <SkeletonList /> : items.length === 0 ? (
        <EmptyState icon={<BookX size={48} />} text="Không có tác phẩm nào đang chờ duyệt." />
      ) : (
        <div className="item-list">
          {items.map((item) => (
            <GalleryCard key={item._id} item={item as GalleryItem}
              onView={() => setPreview(item as GalleryItem)}
              onApprove={async () => { await approve({ id: item._id }); toast.success("Đã duyệt!"); }}
              onReject={async ()  => { await reject({ id: item._id });  toast.info("Đã từ chối."); }}
              onRemove={async ()  => { if (confirm("Xóa vĩnh viễn?")) { await remove({ id: item._id }); toast.success("Đã xóa."); } }}
            />
          ))}
        </div>
      )}
      <AnimatePresence>
        {preview && <Reader title={preview.title} author={preview.authorName} genre={preview.genre}
          coverUrl={preview.coverUrl} pages={preview.pages ?? []} onClose={() => setPreview(null)} />}
      </AnimatePresence>
    </>
  );
}

// ─── Tab: Xem lại (có lọc + search) ─────────────────────────────────────────
function ReviewTab() {
  const [preview, setPreview] = useState<GalleryItem | null>(null);
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState<FilterStatus>("");
  const approve = useMutation(api.gallery.approve);
  const reject  = useMutation(api.gallery.reject);
  const remove  = useMutation(api.gallery.remove);

  const items = useQuery(api.gallery.listFiltered, {
    status: status || undefined,
    search: search || undefined,
  });

  return (
    <>
      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={14} className="search-icon" />
          <input className="search-input" placeholder="Tìm tên tác phẩm hoặc tác giả..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="status-tabs">
          {([["", "Tất cả"], ["pending", "Chờ duyệt"], ["approved", "Đã duyệt"], ["rejected", "Từ chối"]] as [FilterStatus, string][]).map(([v, l]) => (
            <button key={v} className={`stab ${status === v ? "active" : ""}`} onClick={() => setStatus(v)}>{l}</button>
          ))}
        </div>
      </div>

      {items === undefined ? <SkeletonList /> : items.length === 0 ? (
        <EmptyState icon={<BookX size={48} />} text="Không tìm thấy tác phẩm nào." />
      ) : (
        <div className="item-list">
          {items.map((item: GalleryItem) => (
            <GalleryCard key={item._id} item={item as GalleryItem}
              onView={() => setPreview(item as GalleryItem)}
              onApprove={item.status !== "approved" ? async () => { await approve({ id: item._id }); toast.success("Đã duyệt!"); } : undefined}
              onReject={item.status !== "rejected"  ? async () => { await reject({ id: item._id });  toast.info("Đã từ chối."); }  : undefined}
              onRemove={async () => { if (confirm("Xóa vĩnh viễn?")) { await remove({ id: item._id }); toast.success("Đã xóa."); } }}
            />
          ))}
        </div>
      )}
      <AnimatePresence>
        {preview && <Reader title={preview.title} author={preview.authorName} genre={preview.genre}
          coverUrl={preview.coverUrl} pages={preview.pages ?? []} onClose={() => setPreview(null)} />}
      </AnimatePresence>
    </>
  );
}

// ─── Card dùng chung ──────────────────────────────────────────────────────────
function GalleryCard({ item, onView, onApprove, onReject, onRemove }: {
  item: GalleryItem;
  onView: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onRemove: () => void;
}) {
  const s = STATUS_COLORS[item.status] ?? STATUS_COLORS.pending;
  return (
    <div className="item-card">
      <div className="item-main">
        <div className="item-info">
          <div className="item-title-row">
            <h3>{item.title}</h3>
            <span className="status-badge" style={{ background: s.bg, color: s.text }}>{s.label}</span>
          </div>
          <p className="item-meta">
            bởi <strong>{item.authorName}</strong> · {item.authorEmail} · {item.genre}
            {item.fileName ? ` · ${item.fileName}` : item.pages?.length ? ` · ${item.pages.length} trang` : ""}
          </p>
          {item.description && <p className="item-desc">{item.description}</p>}
          <p className="item-date">{new Date(item.createdAt).toLocaleDateString("vi-VN")}</p>
        </div>
        <div className="item-actions">
          <button className="action-btn" onClick={onView}><Eye size={14} />Xem</button>
          {onApprove && <button className="action-btn approve" onClick={onApprove}><CheckCircle size={14} />Duyệt</button>}
          {onReject  && <button className="action-btn reject"  onClick={onReject}><XCircle size={14} />Từ chối</button>}
          <button className="action-btn danger" onClick={onRemove}><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function SkeletonList() {
  return <div className="skeleton-list">{[1,2,3].map((i) => <div key={i} className="skeleton-row" />)}</div>;
}
function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="empty-state">{icon}<p>{text}</p></div>;
}

// ─── GalleryPage ──────────────────────────────────────────────────────────────
export function GalleryPage() {
  const [tab, setTab] = useState<"pending" | "review">("pending");
  const pendingCount = useQuery(api.gallery.listPending)?.length ?? 0;

  return (
    <div>
      <div className="page-header">
        <h1>Duyệt Tác Phẩm Cộng Đồng</h1>
        <p>Xem xét và quản lý tác phẩm do đọc giả gửi lên</p>
      </div>
      <div className="tab-bar">
        <button className={`tab-btn ${tab === "pending" ? "active" : ""}`} onClick={() => setTab("pending")}>
          <Clock size={14} /> Chờ duyệt
          {pendingCount > 0 && <span className="count">{pendingCount}</span>}
        </button>
        <button className={`tab-btn ${tab === "review" ? "active" : ""}`} onClick={() => setTab("review")}>
          <BookCheck size={14} /> Xem lại
        </button>
      </div>
      {tab === "pending" ? <PendingTab /> : <ReviewTab />}

      <style>{`
        .page-header { margin-bottom: 24px; }
        .page-header h1 { font-size: 22px; font-weight: 700; color: #f1f5f9; margin: 0 0 4px; }
        .page-header p  { font-size: 14px; color: #64748b; margin: 0; }
        .tab-bar { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
        .tab-btn {
          display: flex; align-items: center; gap: 6px; padding: 7px 18px;
          border-radius: 999px; border: 1px solid rgba(255,255,255,0.08);
          background: transparent; color: #64748b; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.2s; font-family: inherit;
        }
        .tab-btn.active { background: rgba(96,165,250,0.15); border-color: rgba(96,165,250,0.3); color: #93c5fd; }
        .tab-btn:not(.active):hover { color: #94a3b8; background: rgba(255,255,255,0.04); }
        .count { background: rgba(251,191,36,0.2); color: #fbbf24; border-radius: 20px; padding: 1px 8px; font-size: 11px; }

        .filter-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
        .search-wrap { position: relative; flex: 1; min-width: 200px; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #475569; }
        .search-input {
          width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 9px 12px 9px 34px; color: #e2e8f0; font-size: 13px;
          font-family: inherit; outline: none; transition: border-color 0.2s; box-sizing: border-box;
        }
        .search-input:focus { border-color: rgba(96,165,250,0.4); }
        .search-input::placeholder { color: #334155; }
        .status-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
        .stab {
          padding: 6px 14px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.08);
          background: transparent; color: #64748b; font-size: 12px; cursor: pointer;
          transition: all 0.2s; font-family: inherit;
        }
        .stab.active { background: rgba(96,165,250,0.15); border-color: rgba(96,165,250,0.3); color: #93c5fd; }
        .stab:not(.active):hover { color: #94a3b8; }

        .skeleton-list { display: flex; flex-direction: column; gap: 12px; }
        .skeleton-row { height: 80px; border-radius: 12px; background: rgba(255,255,255,0.05); animation: pulse 1.6s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .empty-state { text-align: center; padding: 80px 0; color: #334155; }
        .empty-state p { margin-top: 16px; font-size: 15px; color: #475569; }
        .item-list { display: flex; flex-direction: column; gap: 12px; }
        .item-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 18px 20px; transition: border-color 0.2s, background 0.2s;
        }
        .item-card:hover { border-color: rgba(255,255,255,0.14); background: rgba(255,255,255,0.06); }
        .item-main { display: flex; flex-direction: column; gap: 14px; }
        @media (min-width: 640px) { .item-main { flex-direction: row; align-items: center; justify-content: space-between; } }
        .item-info { flex: 1; min-width: 0; }
        .item-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 5px; flex-wrap: wrap; }
        .item-title-row h3 { font-size: 15px; font-weight: 600; color: #e2e8f0; margin: 0; }
        .status-badge { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 999px; flex-shrink: 0; }
        .item-meta { font-size: 13px; color: #64748b; margin: 0; }
        .item-meta strong { color: #94a3b8; }
        .item-desc { font-size: 13px; color: #475569; margin: 6px 0 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .item-date { font-size: 12px; color: #334155; margin: 4px 0 0; }
        .item-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; flex-wrap: wrap; }
        .action-btn {
          display: inline-flex; align-items: center; gap: 5px; padding: 7px 13px;
          border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.05); color: #94a3b8; font-size: 13px;
          font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: inherit;
        }
        .action-btn:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
        .action-btn.approve { background: rgba(52,211,153,0.1); border-color: rgba(52,211,153,0.2); color: #34d399; }
        .action-btn.approve:hover { background: rgba(52,211,153,0.2); }
        .action-btn.reject { background: rgba(248,113,113,0.08); border-color: rgba(248,113,113,0.15); color: #f87171; }
        .action-btn.reject:hover { background: rgba(248,113,113,0.18); }
        .action-btn.danger { background: transparent; border-color: rgba(248,113,113,0.15); color: rgba(248,113,113,0.5); padding: 7px 10px; }
        .action-btn.danger:hover { background: rgba(248,113,113,0.12); color: #f87171; }
      `}</style>
    </div>
  );
}
