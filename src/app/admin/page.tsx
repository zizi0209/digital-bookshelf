"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Reader } from "@/components/reader";
import { AdminLoginForm } from "@/components/admin-login-form";
import { useAdminAuth } from "@/components/use-admin-auth";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Shield, CheckCircle, XCircle, Trash2, Eye,
  Clock, BookCheck, BookX, LogOut, BookOpen,
} from "lucide-react";
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

function AdminDashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [preview, setPreview] = useState<GalleryItem | null>(null);
  const pending = useQuery(api.gallery.listPending);
  const all = useQuery(api.gallery.listAll);
  const approve = useMutation(api.gallery.approve);
  const reject = useMutation(api.gallery.reject);
  const remove = useMutation(api.gallery.remove);
  const items = tab === "pending" ? pending : all;

  return (
    <div className="admin-shell">
      {/* Topbar */}
      <header className="admin-topbar">
        <div className="admin-brand">
          <BookOpen size={20} />
          <span>Tsuki<span className="muted">zoe</span> Admin</span>
        </div>
        <div className="admin-user">
          <Shield size={14} />
          <span>{email}</span>
          <button className="logout-btn" onClick={onLogout} title="Đăng xuất">
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="admin-content">
        <div className="admin-page-title">
          <h1>Quản Trị Gallery</h1>
          <p>Duyệt và quản lý tác phẩm cộng đồng</p>
        </div>

        <div className="admin-tabs">
          {(["pending", "all"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`tab-btn ${tab === t ? "active" : ""}`}>
              {t === "pending"
                ? <><Clock size={14} />Chờ duyệt <span className="count">{pending?.length ?? 0}</span></>
                : <><BookCheck size={14} />Tất cả <span className="count">{all?.length ?? 0}</span></>}
            </button>
          ))}
        </div>

        {items === undefined ? (
          <div className="skeleton-list">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton-row" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <BookX size={48} />
            <p>{tab === "pending" ? "Không có tác phẩm nào đang chờ duyệt." : "Chưa có tác phẩm nào."}</p>
          </div>
        ) : (
          <div className="item-list">
            {items.map((item) => {
              const s = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
              return (
                <div key={item._id} className="item-card">
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
                    </div>
                    <div className="item-actions">
                      <button className="action-btn" onClick={() => setPreview(item as GalleryItem)}>
                        <Eye size={14} />Xem
                      </button>
                      {item.status !== "approved" && (
                        <button className="action-btn approve" onClick={async () => { await approve({ id: item._id }); toast.success("Đã duyệt!"); }}>
                          <CheckCircle size={14} />Duyệt
                        </button>
                      )}
                      {item.status !== "rejected" && (
                        <button className="action-btn reject" onClick={async () => { await reject({ id: item._id }); toast.info("Đã từ chối."); }}>
                          <XCircle size={14} />Từ chối
                        </button>
                      )}
                      <button className="action-btn danger" onClick={async () => { if (confirm("Xóa vĩnh viễn?")) { await remove({ id: item._id }); toast.success("Đã xóa."); } }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <AnimatePresence>
        {preview && (
          <Reader title={preview.title} author={preview.authorName} genre={preview.genre}
            coverUrl={preview.coverUrl} pages={preview.pages ?? []} onClose={() => setPreview(null)} />
        )}
      </AnimatePresence>

      <style>{`
        .admin-shell {
          min-height: 100vh;
          background: linear-gradient(160deg, #0f172a 0%, #1e293b 100%);
          color: #e2e8f0;
        }
        .admin-topbar {
          height: 56px;
          background: rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          position: sticky;
          top: 0;
          z-index: 20;
          backdrop-filter: blur(12px);
        }
        .admin-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 15px;
          font-weight: 700;
          color: #e2e8f0;
          letter-spacing: -0.2px;
        }
        .admin-brand .muted { font-weight: 300; color: #64748b; }
        .admin-user {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #94a3b8;
        }
        .logout-btn {
          background: rgba(248,113,113,0.1);
          border: 1px solid rgba(248,113,113,0.2);
          color: #f87171;
          border-radius: 7px;
          padding: 5px 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: background 0.2s;
          margin-left: 4px;
        }
        .logout-btn:hover { background: rgba(248,113,113,0.2); }
        .admin-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 36px 24px;
        }
        .admin-page-title { margin-bottom: 28px; }
        .admin-page-title h1 {
          font-size: 24px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 4px;
        }
        .admin-page-title p { font-size: 14px; color: #64748b; margin: 0; }
        .admin-tabs { display: flex; gap: 10px; margin-bottom: 24px; }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 18px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: #64748b;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .tab-btn.active {
          background: rgba(96,165,250,0.15);
          border-color: rgba(96,165,250,0.3);
          color: #93c5fd;
        }
        .tab-btn:not(.active):hover { color: #94a3b8; background: rgba(255,255,255,0.04); }
        .count {
          background: rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 1px 8px;
          font-size: 12px;
        }
        .skeleton-list { display: flex; flex-direction: column; gap: 12px; }
        .skeleton-row {
          height: 80px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          animation: pulse 1.6s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .empty-state {
          text-align: center;
          padding: 80px 0;
          color: #334155;
        }
        .empty-state p { margin-top: 16px; font-size: 15px; color: #475569; }
        .item-list { display: flex; flex-direction: column; gap: 12px; }
        .item-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 18px 20px;
          transition: border-color 0.2s, background 0.2s;
        }
        .item-card:hover {
          border-color: rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
        }
        .item-main {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        @media (min-width: 640px) {
          .item-main { flex-direction: row; align-items: center; justify-content: space-between; }
        }
        .item-info { flex: 1; min-width: 0; }
        .item-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 5px; flex-wrap: wrap; }
        .item-title-row h3 { font-size: 15px; font-weight: 600; color: #e2e8f0; margin: 0; }
        .status-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 10px;
          border-radius: 999px;
          flex-shrink: 0;
        }
        .item-meta { font-size: 13px; color: #64748b; margin: 0; }
        .item-meta strong { color: #94a3b8; }
        .item-desc {
          font-size: 13px;
          color: #475569;
          margin: 6px 0 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .item-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; flex-wrap: wrap; }
        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 7px 13px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.05);
          color: #94a3b8;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .action-btn:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
        .action-btn.approve {
          background: rgba(52,211,153,0.1);
          border-color: rgba(52,211,153,0.2);
          color: #34d399;
        }
        .action-btn.approve:hover { background: rgba(52,211,153,0.2); }
        .action-btn.reject {
          background: rgba(248,113,113,0.08);
          border-color: rgba(248,113,113,0.15);
          color: #f87171;
        }
        .action-btn.reject:hover { background: rgba(248,113,113,0.18); }
        .action-btn.danger {
          background: transparent;
          border-color: rgba(248,113,113,0.15);
          color: rgba(248,113,113,0.5);
          padding: 7px 10px;
        }
        .action-btn.danger:hover { background: rgba(248,113,113,0.12); color: #f87171; }
      `}</style>
    </div>
  );
}

export default function AdminPage() {
  const { session, loading, login, logout } = useAdminAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!session) return <AdminLoginForm onSuccess={login} />;
  return <AdminDashboard email={session.email} onLogout={logout} />;
}
