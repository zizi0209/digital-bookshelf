"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { ShelfBook, BookshelfGrid } from "@/components/book-shelf";
import { ShelfHeader } from "@/components/shelf-header";
import { Reader } from "@/components/reader";
import { BookSkeleton } from "@/components/skeleton";
import { Users } from "lucide-react";

type GalleryDoc = {
  _id: string; title: string; authorName: string; description: string;
  genre: string; coverUrl?: string; pages: string[]; status: string; createdAt: number;
};

type SortMode = "name" | "date";

export default function GalleryPage() {
  const [selected, setSelected] = useState<GalleryDoc | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("date");
  const items = useQuery(api.gallery.listApproved, {});

  const filtered = useMemo(() => {
    if (!items) return undefined;
    let list = [...items];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) => b.title.toLowerCase().includes(q) || b.authorName.toLowerCase().includes(q));
    }
    list.sort((a, b) => sort === "name" ? a.title.localeCompare(b.title) : b.createdAt - a.createdAt);
    return list;
  }, [items, search, sort]);

  return (
    <main className="room-wrapper min-h-screen flex flex-col">
      <Navbar />
      <ShelfHeader title="Phòng Trưng Bày Cộng Đồng" search={search} onSearchChange={setSearch} sort={sort} onSortChange={setSort} />

      {filtered === undefined ? (
        <div className="shelf-wall flex-1 px-8 py-10"><BookSkeleton /></div>
      ) : filtered.length === 0 ? (
        <div className="shelf-wall flex-1 flex items-center justify-center">
          <div className="text-center py-24 text-[#8e8a7d] flex flex-col items-center">
            <Users className="w-14 h-14 mb-5 opacity-30" />
            <p className="text-xl font-serif">Phòng trưng bày đang trống.</p>
            <p className="text-sm opacity-60 mt-2" style={{ fontFamily: "'Inter',sans-serif" }}>
              Hãy gửi tác phẩm qua trang &quot;Gửi Tác Phẩm&quot;!
            </p>
          </div>
        </div>
      ) : (
        <BookshelfGrid items={filtered as GalleryDoc[]} perRow={5}
          renderBook={(item, i) => (
            <ShelfBook key={item._id} title={item.title} author={item.authorName} coverUrl={item.coverUrl}
              onClick={() => setSelected(item as unknown as GalleryDoc)} delay={i * 40} />
          )} />
      )}

      <div className="shelf-floor" />

      <AnimatePresence>
        {selected && (
          <Reader title={selected.title} author={selected.authorName} genre={selected.genre}
            coverUrl={selected.coverUrl} pages={selected.pages} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </main>
  );
}
