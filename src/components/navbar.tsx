"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookOpen, Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Kệ Sách" },
  { href: "/gallery", label: "Phòng Trưng Bày" },
  { href: "/submit", label: "Gửi Tác Phẩm" },
  { href: "/admin", label: "Quản Trị" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b" style={{ background: "var(--color-bg)", borderColor: "var(--color-border)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight" style={{ color: "var(--color-primary)" }}>
          <BookOpen className="w-6 h-6" />
          <span>Tsuki<span className="font-light">zoe</span></span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex gap-6 text-sm uppercase tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors"
              style={{
                color: pathname === l.href ? "var(--color-primary)" : "var(--color-muted)",
                fontWeight: pathname === l.href ? 600 : 400,
                borderBottom: pathname === l.href ? "2px solid var(--color-primary)" : "none",
                paddingBottom: 2,
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} style={{ color: "var(--color-primary)" }}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t px-4 py-4 flex flex-col gap-3" style={{ borderColor: "var(--color-border)", background: "var(--color-secondary)" }}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm uppercase tracking-widest py-2"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: pathname === l.href ? "var(--color-primary)" : "var(--color-muted)",
                fontWeight: pathname === l.href ? 600 : 400,
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
