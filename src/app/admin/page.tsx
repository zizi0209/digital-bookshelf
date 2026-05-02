"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useRef } from "react";
import { Reader } from "@/components/reader";
import { AdminLoginForm } from "@/components/admin-login-form";
import { useAdminAuth } from "@/components/use-admin-auth";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Shield, CheckCircle, XCircle, Trash2, Eye,
  Clock, BookCheck, BookX, LogOut, BookOpen, Upload, FilePlus,
} from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

type GalleryItem = {
  _id: Id<"gallery">; title: string; authorName: string; authorEmail: string;
  description: string; genre: string; coverUrl?: string; pages?: string[];
  fileStorageId?: string; fileType?: string; fileName?: string;
  status: string; createdAt: number;
};

const GENRES = [
  { value: "fantasy", label: "Tiểu thuyết kỳ ảo" },
  { value: "romance", label: "Lãng mạn" },
  { value: "mystery", label: "Bí ẩn / Trinh thám" },
  { value: "horror", label: "Kinh dị" },
  { value: "slice_of_life", label: "Đời thường" },
  { value: "other", label: "Khác" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "rgba(254,243,199,0.15)", text: "#fbbf24", label: "Chờ duyệt" },
  approved: { bg: "rgba(209,250,229,0.12)", text: "#34d399", label: "Đã duyệt" },
  rejected: { bg: "rgba(254,226,226,0.12)", text: "#f87171", label: "Từ chối" },
};

// ─── Upload Tab ──────────────────────────────────────────────────────────────
function UploadBookTab() {
  const generateUrl = useMutation(api.books.generateUploadUrl);
  const createBook = useMutation(api.books.create);

  const [form, setForm] = useState({ title: "", description: "", genre: "fantasy" });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "epub") {
      toast.error("Chỉ hỗ trợ file .pdf hoặc .epub");
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.genre) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (!file) {
      toast.error("Vui lòng chọn file tác phẩm (.pdf hoặc .epub)");
      return;
    }

    setUploading(true);
    try {
      const uploadUrl = await generateUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error("Upload thất bại");
      const { storageId } = await res.json() as { storageId: string };
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";

      await createBook({
        title: form.title,
        description: form.description,
        genre: form.genre,
        fileStorageId: storageId,
        fileType: ext,
        fileName: file.name,
      });

      toast.success("Đã đăng tải tác phẩm thành công!");
      setForm({ title: "", description: "", genre: "fantasy" });
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi không xác định";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <div className="upload-form-grid">
        <div className="form-field">
          <label>Tiêu đề *</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Tên tác phẩm..."
            disabled={uploading}
          />
        </div>
        <div className="form-field">
          <label>Thể loại *</label>
          <select
            value={form.genre}
            onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
            disabled={uploading}
          >
            {GENRES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
        <div className="form-field full">
          <label>Mô tả</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Mô tả ngắn về tác phẩm..."
            rows={3}
            disabled={uploading}
          />
        </div>

      </div>

      <div className="file-drop-area" onClick={() => !uploading && fileRef.current?.click()}>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.epub"
          onChange={handleFile}
          style={{ display: "none" }}
          disabled={uploading}
        />
        {file ? (
          <>
            <FilePlus size={32} style={{ color: "#60a5fa" }} />
            <p className="file-name">{file.name}</p>
            <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <button
              type="button"
              className="change-file-btn"
              onClick={(e) => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
            >
              Đổi file
            </button>
          </>
        ) : (
          <>
            <Upload size={32} style={{ color: "#475569" }} />
            <p>Kéo thả hoặc <strong>bấm để chọn file</strong></p>
            <p className="file-hint">Hỗ trợ .PDF và .EPUB</p>
          </>
        )}
      </div>

      <button className="submit-upload-btn" type="submit" disabled={uploading}>
        {uploading ? (
          <><span className="spin-icon" />Đang tải lên...</>
        ) : (
          <><Upload size={16} />Đăng tải tác phẩm</>
        )}
      </button>
    </form>
  );
}

// ─── Gallery Management Tab ──────────────────────────────────────────────────
function GalleryTab({ mode }: { mode: "pending" | "all" }) {
  const [preview, setPreview] = useState<GalleryItem | null>(null);
  const pending = useQuery(api.gallery.listPending);
  const all = useQuery(api.gallery.listAll);
  const approve = useMutation(api.gallery.approve);
  const reject = useMutation(api.gallery.reject);
  const remove = useMutation(api.gallery.remove);
  const items = mode === "pending" ? pending : all;

  return (
    <>
      {items === undefined ? (
        <div className="skeleton-list">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton-row" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <BookX size={48} />
          <p>{mode === "pending" ? "Không có tác phẩm nào đang chờ duyệt." : "Chưa có tác phẩm nào."}</p>
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

      <AnimatePresence>
        {preview && (
          <Reader title={preview.title} author={preview.authorName} genre={preview.genre}
            coverUrl={preview.coverUrl} pages={preview.pages ?? []} onClose={() => setPreview(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [tab, setTab] = useState<"pending" | "all" | "upload">("pending");
  const pending = useQuery(api.gallery.listPending);
  const all = useQuery(api.gallery.listAll);

  const TABS = [
    { id: "pending" as const, icon: <Clock size={14} />, label: "Chờ duyệt", count: pending?.length ?? 0 },
    { id: "all" as const, icon: <BookCheck size={14} />, label: "Tất cả", count: all?.length ?? 0 },
    { id: "upload" as const, icon: <Upload size={14} />, label: "Đăng tải", count: null },
  ];

  return (
    <div className="admin-shell">
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

      <main className="admin-content">
        <div className="admin-page-title">
          <h1>{tab === "upload" ? "Đăng Tải Tác Phẩm" : "Quản Trị Gallery"}</h1>
          <p>{tab === "upload" ? "Tải lên tác phẩm của bạn dưới dạng PDF hoặc EPUB" : "Duyệt và quản lý tác phẩm cộng đồng"}</p>
        </div>

        <div className="admin-tabs">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn ${tab === t.id ? "active" : ""}`}>
              {t.icon}{t.label}
              {t.count !== null && <span className="count">{t.count}</span>}
            </button>
          ))}
        </div>

        {tab === "upload" ? (
          <UploadBookTab />
        ) : (
          <GalleryTab mode={tab} />
        )}
      </main>

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
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 28px; position: sticky; top: 0; z-index: 20;
          backdrop-filter: blur(12px);
        }
        .admin-brand { display: flex; align-items: center; gap: 9px; font-size: 15px; font-weight: 700; color: #e2e8f0; letter-spacing: -0.2px; }
        .admin-brand .muted { font-weight: 300; color: #64748b; }
        .admin-user { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #94a3b8; }
        .logout-btn {
          background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2);
          color: #f87171; border-radius: 7px; padding: 5px 8px; cursor: pointer;
          display: flex; align-items: center; transition: background 0.2s; margin-left: 4px;
        }
        .logout-btn:hover { background: rgba(248,113,113,0.2); }
        .admin-content { max-width: 860px; margin: 0 auto; padding: 36px 24px; }
        .admin-page-title { margin-bottom: 28px; }
        .admin-page-title h1 { font-size: 24px; font-weight: 700; color: #f1f5f9; margin: 0 0 4px; }
        .admin-page-title p { font-size: 14px; color: #64748b; margin: 0; }
        .admin-tabs { display: flex; gap: 10px; margin-bottom: 28px; flex-wrap: wrap; }
        .tab-btn {
          display: flex; align-items: center; gap: 7px; padding: 8px 18px;
          border-radius: 999px; border: 1px solid rgba(255,255,255,0.08);
          background: transparent; color: #64748b; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.2s; font-family: inherit;
        }
        .tab-btn.active { background: rgba(96,165,250,0.15); border-color: rgba(96,165,250,0.3); color: #93c5fd; }
        .tab-btn:not(.active):hover { color: #94a3b8; background: rgba(255,255,255,0.04); }
        .count { background: rgba(255,255,255,0.08); border-radius: 20px; padding: 1px 8px; font-size: 12px; }

        /* Upload form */
        .upload-form { display: flex; flex-direction: column; gap: 20px; }
        .upload-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 600px) { .upload-form-grid { grid-template-columns: 1fr; } }
        .form-field.full { grid-column: 1 / -1; }
        .form-field label { display: block; font-size: 13px; color: #94a3b8; margin-bottom: 6px; font-weight: 500; }
        .form-field input, .form-field select, .form-field textarea {
          width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 10px 14px; color: #e2e8f0; font-size: 14px;
          font-family: inherit; outline: none; transition: border-color 0.2s; box-sizing: border-box;
        }
        .form-field input:focus, .form-field select:focus, .form-field textarea:focus {
          border-color: rgba(96,165,250,0.5);
        }
        .form-field select option { background: #1e293b; }
        .form-field textarea { resize: vertical; }

        .file-drop-area {
          border: 2px dashed rgba(255,255,255,0.12); border-radius: 14px;
          padding: 40px 24px; text-align: center; cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .file-drop-area:hover { border-color: rgba(96,165,250,0.4); background: rgba(96,165,250,0.04); }
        .file-drop-area p { margin: 0; color: #64748b; font-size: 14px; }
        .file-drop-area strong { color: #93c5fd; }
        .file-hint { font-size: 12px !important; color: #334155 !important; }
        .file-name { font-size: 15px !important; color: #e2e8f0 !important; font-weight: 600; word-break: break-all; }
        .file-size { font-size: 12px !important; color: #475569 !important; }
        .change-file-btn {
          margin-top: 4px; padding: 5px 14px; border-radius: 8px; font-size: 12px;
          border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.06);
          color: #94a3b8; cursor: pointer; font-family: inherit; transition: background 0.2s;
        }
        .change-file-btn:hover { background: rgba(255,255,255,0.12); color: #e2e8f0; }

        .submit-upload-btn {
          display: flex; align-items: center; justify-content: center; gap: 9px;
          padding: 13px 28px; border-radius: 12px; font-size: 15px; font-weight: 600;
          border: none; background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: #fff; cursor: pointer; transition: opacity 0.2s, transform 0.15s;
          font-family: inherit; align-self: flex-start;
        }
        .submit-upload-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .submit-upload-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .spin-icon {
          width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Gallery list */
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

// ─── Page Entry ───────────────────────────────────────────────────────────────
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
