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
    <header className="sticky top-0 z-30 bg-[#1f1b17]/90 backdrop-blur-xl border-b border-[#fdfaf6]/5 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-[#fdfaf6]">
          <BookOpen className="w-5 h-5 text-[#c9bfa9]" />
          Tsuki<span className="font-light text-[#c9bfa9]/70">zoe</span>
        </Link>
        <nav className="hidden md:flex gap-8 text-xs uppercase tracking-[0.2em] font-medium" style={{ fontFamily: "'Inter',sans-serif" }}>
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={`transition-all py-1.5 ${pathname === l.href ? "text-[#fdfaf6] border-b border-[#c9bfa9]/60" : "text-[#fdfaf6]/40 hover:text-[#fdfaf6]/70"}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <button className="md:hidden p-2.5 text-[#fdfaf6]/70 hover:text-[#fdfaf6] transition-colors" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <nav className="md:hidden border-t border-[#fdfaf6]/5 px-6 py-4 flex flex-col gap-3 bg-[#1f1b17]/95 backdrop-blur-xl">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`text-xs uppercase tracking-[0.2em] py-2.5 ${pathname === l.href ? "text-[#fdfaf6] font-semibold" : "text-[#fdfaf6]/40"}`}
              style={{ fontFamily: "'Inter',sans-serif" }}>
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
