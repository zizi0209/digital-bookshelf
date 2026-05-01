"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookOpen, Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Kệ Sách" },
  { href: "/gallery", label: "Phòng Trưng Bày" },
  { href: "/submit", label: "Gửi Tác Phẩm" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#fdfaf6]/90 backdrop-blur-xl border-b border-[#e5e0d5] shadow-sm">
      <div className="w-full px-10 sm:px-14 lg:px-24 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-[#3d2b1f]">
          <BookOpen className="w-5 h-5 text-[#5a5a40]" />
          Tsuki<span className="font-light text-[#8e8a7d]">zoe</span>
        </Link>
        <nav className="hidden md:flex gap-8 text-xs uppercase tracking-[0.2em] font-medium" style={{ fontFamily: "'Inter',sans-serif" }}>
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={`transition-all py-1.5 ${pathname === l.href ? "text-[#5a5a40] border-b border-[#5a5a40]/60 font-semibold" : "text-[#8e8a7d] hover:text-[#5c544d]"}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <button className="md:hidden p-2.5 text-[#5c544d] hover:text-[#3d2b1f] transition-colors" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <nav className="md:hidden border-t border-[#e5e0d5] px-6 py-4 flex flex-col gap-3 bg-[#fdfaf6]/95 backdrop-blur-xl">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`text-xs uppercase tracking-[0.2em] py-2.5 ${pathname === l.href ? "text-[#5a5a40] font-semibold" : "text-[#8e8a7d]"}`}
              style={{ fontFamily: "'Inter',sans-serif" }}>
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
