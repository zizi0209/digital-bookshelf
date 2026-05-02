"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Upload, FilePlus, Search, Eye, EyeOff, Trash2, BookOpen, X, FileText,
} from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

type BookPreview = { title: string; storageId: string; fileType?: string };

// ─── File Viewer Modal ────────────────────────────────────────────────────────
function FileViewerModal({ book, onClose }: { book: BookPreview; onClose: () => void }) {
  const url = useQuery(api.books.getFileUrl, { storageId: book.storageId });
  const isPdf = book.fileType === "pdf";

  return (
    <div className="fv-overlay" onClick={onClose}>
      <div className="fv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fv-header">
          <span className="fv-title"><FileText size={15} />{book.title}</span>
          <button className="fv-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="fv-body">
          {url === undefined ? (
            <div className="fv-loading"><span className="spin-icon" />Đang tải...</div>
          ) : !url ? (
            <div className="fv-empty">Không lấy được URL file.</div>
          ) : isPdf ? (
            <iframe src={url} className="fv-iframe" title={book.title} />
          ) : (
            <div className="fv-epub-note">
              <FileText size={48} style={{ color: "#6366f1", marginBottom: 16 }} />
              <p>File EPUB không thể xem trực tiếp trên trình duyệt.</p>
              <a href={url} download className="fv-download">Tải xuống để đọc</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const GENRES = [
  { value: "fantasy",      label: "Tiểu thuyết kỳ ảo" },
  { value: "romance",      label: "Lãng mạn" },
  { value: "mystery",      label: "Bí ẩn / Trinh thám" },
  { value: "horror",       label: "Kinh dị" },
  { value: "slice_of_life",label: "Đời thường" },
  { value: "other",        label: "Khác" },
];

// ─── Upload Tab ───────────────────────────────────────────────────────────────
function UploadTab() {
  const generateUrl = useMutation(api.books.generateUploadUrl);
  const createBook  = useMutation(api.books.create);
  const [form, setForm]     = useState({ title: "", description: "", genre: "fantasy" });
  const [file, setFile]     = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "epub") { toast.error("Chỉ hỗ trợ .pdf hoặc .epub"); return; }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.genre) { toast.error("Vui lòng điền đầy đủ thông tin"); return; }
    if (!file) { toast.error("Vui lòng chọn file (.pdf hoặc .epub)"); return; }
    setUploading(true);
    try {
      const uploadUrl = await generateUrl();
      const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      if (!res.ok) throw new Error("Upload thất bại");
      const { storageId } = await res.json() as { storageId: string };
      await createBook({
        title: form.title, description: form.description, genre: form.genre,
        fileStorageId: storageId, fileType: file.name.split(".").pop()?.toLowerCase() ?? "pdf", fileName: file.name,
      });
      toast.success("Đã đăng tải tác phẩm thành công!");
      setForm({ title: "", description: "", genre: "fantasy" });
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <div className="upload-grid">
        <div className="form-field">
          <label>Tiêu đề *</label>
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Tên tác phẩm..." disabled={uploading} />
        </div>
        <div className="form-field">
          <label>Thể loại *</label>
          <select value={form.genre} onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))} disabled={uploading}>
            {GENRES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
        <div className="form-field full">
          <label>Mô tả</label>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Mô tả ngắn về tác phẩm..." rows={3} disabled={uploading} />
        </div>
      </div>

      <div className="file-drop-area" onClick={() => !uploading && fileRef.current?.click()}>
        <input ref={fileRef} type="file" accept=".pdf,.epub" onChange={handleFile} style={{ display: "none" }} disabled={uploading} />
        {file ? (
          <>
            <FilePlus size={32} style={{ color: "#60a5fa" }} />
            <p className="file-name">{file.name}</p>
            <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <button type="button" className="change-file-btn"
              onClick={(e) => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ""; }}>
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

      <button className="submit-btn" type="submit" disabled={uploading}>
        {uploading ? <><span className="spin-icon" />Đang tải lên...</> : <><Upload size={16} />Đăng tải tác phẩm</>}
      </button>
    </form>
  );
}

// ─── Manage Tab ───────────────────────────────────────────────────────────────
function ManageTab() {
  const [search, setSearch] = useState("");
  const [genre,  setGenre]  = useState("");
  const [preview, setPreview] = useState<BookPreview | null>(null);
  const toggleHidden = useMutation(api.books.toggleHidden);
  const remove       = useMutation(api.books.remove);

  const items = useQuery(api.books.listAdmin, {
    genre:  genre  || undefined,
    search: search || undefined,
  });

  return (
    <>
      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={14} className="search-icon" />
          <input className="search-input" placeholder="Tìm tên tác phẩm..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="genre-select" value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">Tất cả thể loại</option>
          {GENRES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
      </div>

      {items === undefined ? (
        <div className="skeleton-list">{[1,2,3].map((i) => <div key={i} className="skeleton-row" />)}</div>
      ) : items.length === 0 ? (
        <div className="empty-state"><BookOpen size={48} /><p>Chưa có tác phẩm nào.</p></div>
      ) : (
        <div className="item-list">
          {items.map((book) => (
            <div key={book._id} className={`item-card ${book.isHidden ? "hidden-card" : ""}`}>
              <div className="item-main">
                <div className="item-info">
                  <div className="item-title-row">
                    <h3>{book.title}</h3>
                    {book.isHidden && <span className="hidden-badge">Đang ẩn</span>}
                    <span className="genre-badge">{GENRES.find((g) => g.value === book.genre)?.label ?? book.genre}</span>
                  </div>
                  <p className="item-meta">
                    {book.fileName ?? "Không có file"} · {new Date(book.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                  {book.description && <p className="item-desc">{book.description}</p>}
                </div>
                <div className="item-actions">
                  <button className="action-btn"
                    onClick={() => book.fileStorageId
                      ? setPreview({ title: book.title, storageId: book.fileStorageId, fileType: book.fileType })
                      : toast.info("Tác phẩm này chưa có file.")}
                  >
                    <Eye size={14} />Xem
                  </button>
                  <button className={`action-btn ${book.isHidden ? "show" : "hide"}`}
                    onClick={async () => {
                      await toggleHidden({ id: book._id as Id<"books"> });
                      toast.success(book.isHidden ? "Đã hiện tác phẩm." : "Đã ẩn tác phẩm.");
                    }}>
                    {book.isHidden ? <><Eye size={14} />Hiện</> : <><EyeOff size={14} />Ẩn</>}
                  </button>
                  <button className="action-btn danger"
                    onClick={async () => { if (confirm("Xóa vĩnh viễn?")) { await remove({ id: book._id as Id<"books"> }); toast.success("Đã xóa."); } }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {preview && <FileViewerModal book={preview} onClose={() => setPreview(null)} />}
    </>
  );
}

// ─── BooksPage ────────────────────────────────────────────────────────────────
export function BooksPage() {
  const [tab, setTab] = useState<"upload" | "manage">("upload");

  return (
    <div>
      <div className="page-header">
        <h1>Đăng Tải Tác Phẩm</h1>
        <p>Quản lý các tác phẩm chính thức của Tsukizoe</p>
      </div>
      <div className="tab-bar">
        <button className={`tab-btn ${tab === "upload" ? "active" : ""}`} onClick={() => setTab("upload")}>
          <Upload size={14} /> Đăng tác phẩm mới
        </button>
        <button className={`tab-btn ${tab === "manage" ? "active" : ""}`} onClick={() => setTab("manage")}>
          <BookOpen size={14} /> Quản lý tác phẩm
        </button>
      </div>

      {tab === "upload" ? <UploadTab /> : <ManageTab />}

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

        /* Upload form */
        .upload-form { display: flex; flex-direction: column; gap: 20px; }
        .upload-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 600px) { .upload-grid { grid-template-columns: 1fr; } }
        .form-field.full { grid-column: 1 / -1; }
        .form-field label { display: block; font-size: 13px; color: #94a3b8; margin-bottom: 6px; font-weight: 500; }
        .form-field input, .form-field select, .form-field textarea {
          width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 10px 14px; color: #e2e8f0; font-size: 14px;
          font-family: inherit; outline: none; transition: border-color 0.2s; box-sizing: border-box;
        }
        .form-field input:focus, .form-field select:focus, .form-field textarea:focus { border-color: rgba(96,165,250,0.5); }
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
        .submit-btn {
          display: flex; align-items: center; justify-content: center; gap: 9px;
          padding: 13px 28px; border-radius: 12px; font-size: 15px; font-weight: 600;
          border: none; background: linear-gradient(135deg,#3b82f6,#6366f1);
          color: #fff; cursor: pointer; transition: opacity 0.2s, transform 0.15s;
          font-family: inherit; align-self: flex-start;
        }
        .submit-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .spin-icon {
          width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%; animation: bspin 0.7s linear infinite; display: inline-block;
        }
        @keyframes bspin { to { transform: rotate(360deg); } }

        /* Manage tab */
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
        .genre-select {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 9px 14px; color: #94a3b8; font-size: 13px;
          font-family: inherit; outline: none; cursor: pointer;
        }
        .genre-select option { background: #1e293b; }
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
        .hidden-card { opacity: 0.55; }
        .item-main { display: flex; flex-direction: column; gap: 14px; }
        @media (min-width: 640px) { .item-main { flex-direction: row; align-items: center; justify-content: space-between; } }
        .item-info { flex: 1; min-width: 0; }
        .item-title-row { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; flex-wrap: wrap; }
        .item-title-row h3 { font-size: 15px; font-weight: 600; color: #e2e8f0; margin: 0; }
        .hidden-badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px; background: rgba(100,116,139,0.2); color: #94a3b8; }
        .genre-badge { font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 999px; background: rgba(99,102,241,0.15); color: #a5b4fc; }
        .item-meta { font-size: 13px; color: #64748b; margin: 0; }
        .item-desc { font-size: 13px; color: #475569; margin: 6px 0 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .item-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .action-btn {
          display: inline-flex; align-items: center; gap: 5px; padding: 7px 13px;
          border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.05); color: #94a3b8; font-size: 13px;
          font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: inherit;
        }
        .action-btn:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
        .action-btn.hide { color: #64748b; }
        .action-btn.show { background: rgba(52,211,153,0.08); border-color: rgba(52,211,153,0.2); color: #34d399; }
        .action-btn.show:hover { background: rgba(52,211,153,0.18); }
        .action-btn.danger { background: transparent; border-color: rgba(248,113,113,0.15); color: rgba(248,113,113,0.5); padding: 7px 10px; }
        .action-btn.danger:hover { background: rgba(248,113,113,0.12); color: #f87171; }

        /* File viewer modal */
        .fv-overlay {
          position: fixed; inset: 0; z-index: 60;
          background: rgba(0,0,0,0.75); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .fv-modal {
          background: #1e293b; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px; width: 100%; max-width: 900px;
          height: 85vh; display: flex; flex-direction: column; overflow: hidden;
        }
        .fv-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); flex-shrink: 0;
        }
        .fv-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #e2e8f0; }
        .fv-close {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; padding: 6px; color: #94a3b8; cursor: pointer; display: flex;
          transition: background 0.2s;
        }
        .fv-close:hover { background: rgba(255,255,255,0.12); color: #e2e8f0; }
        .fv-body { flex: 1; overflow: hidden; }
        .fv-iframe { width: 100%; height: 100%; border: none; background: #fff; }
        .fv-loading, .fv-empty {
          height: 100%; display: flex; align-items: center; justify-content: center;
          gap: 10px; color: #64748b; font-size: 14px;
        }
        .fv-epub-note {
          height: 100%; display: flex; flex-direction: column; align-items: center;
          justify-content: center; color: #64748b; font-size: 14px; text-align: center;
        }
        .fv-epub-note p { margin: 0 0 20px; }
        .fv-download {
          padding: 10px 24px; border-radius: 10px; background: linear-gradient(135deg,#6366f1,#3b82f6);
          color: #fff; font-size: 14px; font-weight: 600; text-decoration: none;
          transition: opacity 0.2s;
        }
        .fv-download:hover { opacity: 0.85; }
      `}</style>
    </div>
  );
}
