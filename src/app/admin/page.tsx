"use client";
import { useState } from "react";
import { AdminLoginForm } from "@/components/admin-login-form";
import { useAdminAuth } from "@/components/use-admin-auth";
import { BookOpen, Shield, LogOut, BookCheck, Upload } from "lucide-react";
import { GalleryPage } from "./gallery-page";
import { BooksPage } from "./books-page";

type Page = "gallery" | "books";

function AdminDashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [page, setPage] = useState<Page>("gallery");

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-brand">
          <BookOpen size={20} />
          <span>Tsuki<span className="muted">zoe</span> Admin</span>
        </div>
        <nav className="admin-nav">
          <button className={`nav-btn ${page === "gallery" ? "active" : ""}`} onClick={() => setPage("gallery")}>
            <BookCheck size={14} /> Duyệt tác phẩm
          </button>
          <button className={`nav-btn ${page === "books" ? "active" : ""}`} onClick={() => setPage("books")}>
            <Upload size={14} /> Đăng tải
          </button>
        </nav>
        <div className="admin-user">
          <Shield size={14} />
          <span>{email}</span>
          <button className="logout-btn" onClick={onLogout} title="Đăng xuất"><LogOut size={14} /></button>
        </div>
      </header>

      <main className="admin-content">
        {page === "gallery" ? <GalleryPage /> : <BooksPage />}
      </main>

      <style>{`
        .admin-shell { min-height: 100vh; background: linear-gradient(160deg,#0f172a 0%,#1e293b 100%); color: #e2e8f0; }
        .admin-topbar {
          height: 56px; background: rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 28px; position: sticky; top: 0; z-index: 20;
          backdrop-filter: blur(12px); gap: 16px;
        }
        .admin-brand { display: flex; align-items: center; gap: 9px; font-size: 15px; font-weight: 700; color: #e2e8f0; white-space: nowrap; }
        .admin-brand .muted { font-weight: 300; color: #64748b; }
        .admin-nav { display: flex; gap: 6px; }
        .nav-btn {
          display: flex; align-items: center; gap: 6px; padding: 6px 16px;
          border-radius: 999px; border: 1px solid rgba(255,255,255,0.08);
          background: transparent; color: #64748b; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.2s; font-family: inherit; white-space: nowrap;
        }
        .nav-btn.active { background: rgba(96,165,250,0.15); border-color: rgba(96,165,250,0.3); color: #93c5fd; }
        .nav-btn:not(.active):hover { color: #94a3b8; background: rgba(255,255,255,0.04); }
        .admin-user { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #94a3b8; white-space: nowrap; }
        .logout-btn {
          background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2);
          color: #f87171; border-radius: 7px; padding: 5px 8px; cursor: pointer;
          display: flex; align-items: center; transition: background 0.2s; margin-left: 4px;
        }
        .logout-btn:hover { background: rgba(248,113,113,0.2); }
        .admin-content { max-width: 900px; margin: 0 auto; padding: 36px 24px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function AdminPage() {
  const { session, loading, login, logout } = useAdminAuth();
  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0f172a", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:32, height:32, border:"3px solid rgba(255,255,255,0.1)", borderTopColor:"#3b82f6", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!session) return <AdminLoginForm onSuccess={login} />;
  return <AdminDashboard email={session.email} onLogout={logout} />;
}
