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
    <header className="sticky top-0 z-30 bg-[#5a378c]/90 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-full mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
          <BookOpen className="w-5 h-5" />
          Tsuki<span className="font-light text-white/70">zoe</span>
        </Link>
        <nav className="hidden md:flex gap-6 text-xs uppercase tracking-widest font-medium" style={{ fontFamily: "'Inter',sans-serif" }}>
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={`transition-colors py-1 ${pathname === l.href ? "text-white border-b border-white" : "text-white/50 hover:text-white/80"}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <button className="md:hidden p-2 text-white" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <nav className="md:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-2 bg-[#5a378c]/95 backdrop-blur-md">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`text-xs uppercase tracking-widest py-2 ${pathname === l.href ? "text-white font-semibold" : "text-white/50"}`}
              style={{ fontFamily: "'Inter',sans-serif" }}>
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
