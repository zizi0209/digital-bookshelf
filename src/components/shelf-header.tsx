"use client";

import { Search, SortAsc, Calendar } from "lucide-react";

type SortMode = "name" | "date";

interface ShelfHeaderProps {
  title: string;
  search: string;
  onSearchChange: (v: string) => void;
  sort: SortMode;
  onSortChange: (v: SortMode) => void;
}

export function ShelfHeader({ title, search, onSearchChange, sort, onSortChange }: ShelfHeaderProps) {
  return (
    <div className="bookshelf-header">
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8e8a7d]" />
        <input type="text" value={search} onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm..." className="bookshelf-search" />
      </div>
      <h2 className="text-base font-semibold tracking-widest uppercase hidden sm:block text-[#5a5a40]/70"
        style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", letterSpacing: "0.25em" }}>{title}</h2>
      <div className="flex items-center gap-2.5">
        <button onClick={() => onSortChange("name")} className={`sort-btn flex items-center gap-1.5 ${sort === "name" ? "active" : ""}`}>
          <SortAsc className="w-3 h-3" /> Tên
        </button>
        <button onClick={() => onSortChange("date")} className={`sort-btn flex items-center gap-1.5 ${sort === "date" ? "active" : ""}`}>
          <Calendar className="w-3 h-3" /> Ngày
        </button>
      </div>
    </div>
  );
}
