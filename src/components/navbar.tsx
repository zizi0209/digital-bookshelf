"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookOpen, Menu, X, Search } from "lucide-react";

const links = [
  { href: "/", label: "Kệ Sách" },
  { href: "/gallery", label: "Phòng Trưng Bày" },
  { href: "/submit", label: "Gửi Tác Phẩm" },
  { href: "/admin", label: "Quản Trị" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-30 bg-[#fdfaf6] border-b border-[#e5e0d5] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-[#5a5a40]">
            <BookOpen className="w-6 h-6" />
            Tsuki<span className="font-light">zoe</span>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm uppercase tracking-widest font-medium opacity-70" style={{ fontFamily: "'Inter',sans-serif" }}>
            {links.map((l) => (
              <Link key={l.href} href={l.href}
                className={`transition-colors ${pathname === l.href ? "border-b border-[#5a5a40] text-[#5a5a40]" : "hover:text-[#5a5a40]"}`}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#8e8a7d]" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm..."
              className="bg-[#f5f0e6] border border-[#dcd7cc] rounded-full pl-10 pr-4 py-1.5 text-sm w-48 lg:w-64 outline-none focus:border-[#5a5a40] transition-colors"
              style={{ fontFamily: "'Inter',sans-serif" }} />
          </div>
          <button className="md:hidden p-2 text-[#5a5a40]" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="md:hidden border-t border-[#e5e0d5] px-4 py-4 flex flex-col gap-3 bg-[#f9f6f0]">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`text-sm uppercase tracking-widest py-2 ${pathname === l.href ? "text-[#5a5a40] font-semibold" : "text-[#8e8a7d]"}`}
              style={{ fontFamily: "'Inter',sans-serif" }}>
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
