"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { ShelfBook, BookshelfGrid } from "@/components/book-shelf";
import { ShelfHeader } from "@/components/shelf-header";
import dynamic from "next/dynamic";
const Reader = dynamic(() => import("@/components/reader").then((m) => ({ default: m.Reader })), { ssr: false });
import { BookSkeleton } from "@/components/skeleton";
import { Library } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

type SortMode = "name" | "date";

export default function Home() {
  const [selectedId, setSelectedId] = useState<Id<"books"> | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("date");
  const books = useQuery(api.books.list, {});
  const seed = useMutation(api.books.seed);
  // Chỉ fetch full doc (có pages) khi user click đọc
  const selectedBook = useQuery(api.books.get, selectedId ? { id: selectedId } : "skip");

  const filtered = useMemo(() => {
    if (!books) return undefined;
    let list = [...books];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) => b.title.toLowerCase().includes(q) || b.genre.toLowerCase().includes(q));
    }
    list.sort((a, b) => sort === "name" ? a.title.localeCompare(b.title) : b.createdAt - a.createdAt);
    return list;
  }, [books, search, sort]);

  return (
    <main className="room-wrapper min-h-screen flex flex-col">
      <Navbar />
      <ShelfHeader title="Kệ Sách Của Tsukizoe" search={search} onSearchChange={setSearch} sort={sort} onSortChange={setSort} />

      {filtered === undefined ? (
        <div className="shelf-wall flex-1 px-8 py-10"><BookSkeleton /></div>
      ) : filtered.length === 0 ? (
        <div className="shelf-wall flex-1 flex items-center justify-center">
          <div className="text-center py-24 text-[#8e8a7d] flex flex-col items-center">
            <Library className="w-14 h-14 mb-5 opacity-30" />
            <p className="text-xl font-serif">Kệ sách đang trống.</p>
            <p className="text-sm opacity-60 mt-2" style={{ fontFamily: "'Inter',sans-serif" }}>Chưa có tác phẩm nào.</p>
            <button onClick={() => seed()}
              className="mt-8 px-8 py-2.5 rounded-full text-sm border border-[#dcd7cc] text-[#5c544d] hover:bg-[#5a5a40]/10 hover:text-[#5a5a40] hover:border-[#5a5a40] transition-all"
              style={{ fontFamily: "'Inter',sans-serif" }}>
              Tạo Dữ Liệu Mẫu
            </button>
          </div>
        </div>
      ) : (
        <BookshelfGrid items={filtered} perRow={5}
          renderBook={(book, i) => (
            <ShelfBook key={book._id} title={book.title} author="Tsukizoe" coverUrl={book.coverUrl}
              fileStorageId={book.fileStorageId} fileType={book.fileType} source="books"
              onClick={() => setSelectedId(book._id as Id<"books">)} delay={i * 40} />
          )} />
      )}

      <div className="shelf-floor" />

      <AnimatePresence>
        {selectedId && selectedBook && (
          <Reader title={selectedBook.title} author="Tsukizoe" genre={selectedBook.genre}
            coverUrl={selectedBook.coverUrl} pages={selectedBook.pages}
            fileStorageId={selectedBook.fileStorageId} fileType={selectedBook.fileType}
            source="books" onClose={() => setSelectedId(null)} />
        )}
      </AnimatePresence>
    </main>
  );
}
