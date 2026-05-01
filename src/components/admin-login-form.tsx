"use client";
import { useState } from "react";
import { BookOpen, Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";

interface Props {
  onSuccess: (email: string) => void;
}

export function AdminLoginForm({ onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return setError("Vui lòng nhập đầy đủ thông tin.");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        onSuccess(email);
      } else {
        setError(data.error ?? "Đăng nhập thất bại.");
      }
    } catch {
      setError("Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <BookOpen size={28} />
          <span>Tsuki<span className="muted">zoe</span></span>
        </div>

        <div className="admin-login-header">
          <ShieldCheck size={20} className="shield-icon" />
          <h1>Đăng nhập quản trị</h1>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="field">
            <label htmlFor="admin-email">Email</label>
            <div className="input-wrap">
              <Mail size={15} className="field-icon" />
              <input id="admin-email" type="email" autoComplete="email"
                placeholder="admin@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="admin-password">Mật khẩu</label>
            <div className="input-wrap">
              <Lock size={15} className="field-icon" />
              <input id="admin-password" type={showPw ? "text" : "password"}
                autoComplete="current-password" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="eye-btn" onClick={() => setShowPw(!showPw)}
                aria-label="Hiện/ẩn mật khẩu">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Đang xử lý…" : "Đăng nhập"}
          </button>
        </form>
      </div>

      <style>{`
        .admin-login-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .admin-login-card {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px; padding: 44px 40px;
          width: 100%; max-width: 400px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.4);
        }
        .admin-login-logo {
          display: flex; align-items: center; gap: 10px;
          font-size: 20px; font-weight: 700; color: #e2e8f0;
          margin-bottom: 32px; letter-spacing: -0.3px;
        }
        .admin-login-logo .muted { font-weight: 300; color: #94a3b8; }
        .admin-login-header {
          display: flex; align-items: center; gap: 8px; margin-bottom: 24px;
        }
        .admin-login-header h1 { font-size: 16px; font-weight: 600; color: #cbd5e1; margin: 0; }
        .shield-icon { color: #60a5fa; flex-shrink: 0; }
        .admin-login-form { display: flex; flex-direction: column; gap: 18px; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field label {
          font-size: 12px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8;
        }
        .input-wrap { position: relative; display: flex; align-items: center; }
        .field-icon { position: absolute; left: 13px; color: #64748b; pointer-events: none; }
        .input-wrap input {
          width: 100%; background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
          padding: 11px 40px 11px 38px; font-size: 14px; color: #e2e8f0;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s; font-family: inherit;
        }
        .input-wrap input::placeholder { color: #475569; }
        .input-wrap input:focus {
          border-color: rgba(96,165,250,0.5);
          box-shadow: 0 0 0 3px rgba(96,165,250,0.1);
        }
        .eye-btn {
          position: absolute; right: 12px; background: none; border: none;
          color: #64748b; cursor: pointer; padding: 4px;
          display: flex; align-items: center; transition: color 0.2s;
        }
        .eye-btn:hover { color: #94a3b8; }
        .login-error {
          font-size: 13px; color: #f87171;
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: 8px; padding: 9px 13px; margin: 0;
        }
        .login-btn {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: #fff; border: none; border-radius: 10px;
          padding: 12px; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: opacity 0.2s, transform 0.15s;
          margin-top: 4px; font-family: inherit;
        }
        .login-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .login-btn:disabled { opacity: 0.55; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
