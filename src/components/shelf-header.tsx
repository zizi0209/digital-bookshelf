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
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
        <input type="text" value={search} onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm..." className="bookshelf-search" />
      </div>
      <h2 className="text-base font-semibold tracking-wide hidden sm:block">{title}</h2>
      <div className="flex items-center gap-2">
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
