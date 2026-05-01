"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Book3D } from "@/components/book-3d";
import { Reader } from "@/components/reader";
import { BookSkeleton } from "@/components/skeleton";
import { Library, Sparkles } from "lucide-react";

const GENRES = ["all", "fantasy", "romance", "mystery", "slice_of_life", "horror"] as const;
const GENRE_LABELS: Record<string, string> = {
  all: "Tất Cả", fantasy: "Fantasy", romance: "Romance",
  mystery: "Mystery", slice_of_life: "Slice of Life", horror: "Horror",
};

type BookDoc = {
  _id: string;
  title: string;
  description: string;
  genre: string;
  coverUrl?: string;
  pages: string[];
  isFeatured?: boolean;
  createdAt: number;
};

export default function Home() {
  const [genre, setGenre] = useState("all");
  const [selected, setSelected] = useState<BookDoc | null>(null);
  const books = useQuery(api.books.list, genre === "all" ? {} : { genre });
  const seed = useMutation(api.books.seed);

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3d2b1f] via-[#5a5a40] to-[#4e6b94]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 md:py-24 text-white relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-sm uppercase tracking-widest mb-3 opacity-70" style={{ fontFamily: "'Inter',sans-serif" }}>
              <Sparkles className="w-4 h-4 inline mr-1" /> Tác giả Tsukizoe
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Digital Bookshelf</h1>
            <p className="text-lg md:text-xl opacity-80 max-w-2xl leading-relaxed">
              Chào mừng bạn đến với kệ sách số của Zoe. Nơi đây lưu giữ những câu chuyện được viết bằng trái tim — mời bạn mở từng trang và cảm nhận.
            </p>
          </motion.div>
        </div>
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white opacity-10" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white opacity-10" />
      </section>

      {/* Category Bar */}
      <div className="h-12 w-full px-4 sm:px-8 flex items-center gap-4 sm:gap-6 bg-[#f9f6f0] border-b border-[#e5e0d5] overflow-x-auto whitespace-nowrap">
        <span className="text-xs font-bold uppercase text-[#8e8a7d]" style={{ fontFamily: "'Inter',sans-serif" }}>Thể loại:</span>
        {GENRES.map((g) => (
          <button key={g} onClick={() => setGenre(g)}
            className={`text-sm italic hover:text-[#5a5a40] transition-colors capitalize ${genre === g ? "text-[#5a5a40] font-bold underline underline-offset-4" : "text-[#8e8a7d]"}`}>
            {GENRE_LABELS[g] || g}
          </button>
        ))}
      </div>

      {/* Bookshelf */}
      <section className="flex-1 relative py-8 px-4 sm:px-12 bg-[#f2ede4]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(0,0,0,0.02)] to-transparent pointer-events-none" />

        {books === undefined ? (
          <BookSkeleton />
        ) : books.length === 0 ? (
          <div className="text-center py-20 text-[#8e8a7d] flex flex-col items-center max-w-7xl mx-auto">
            <Library className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">Không tìm thấy tác phẩm nào.</p>
            <p className="text-sm">Thử thay đổi từ khóa hoặc tải lên truyện mới.</p>
            <button onClick={() => seed()}
              className="mt-6 px-6 py-2 rounded-full text-sm border border-[#5a5a40] text-[#5a5a40] hover:bg-[#5a5a40] hover:text-white transition-colors"
              style={{ fontFamily: "'Inter',sans-serif" }}>
              Tạo Dữ Liệu Sách Mẫu
            </button>
          </div>
        ) : (
          <div className="relative max-w-7xl mx-auto h-full">
            {/* Shelf lines background */}
            <div className="absolute inset-0 pointer-events-none shelf-lines" style={{ zIndex: -1 }} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-0 pb-16">
              <AnimatePresence mode="popLayout">
                {books.map((book, i) => (
                  <motion.div key={book._id}
                    layoutId={`book-${book._id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex justify-center mb-6 h-64 items-end drop-shadow-md z-10">
                    <Book3D title={book.title} author="Tsukizoe" coverUrl={book.coverUrl}
                      onClick={() => setSelected(book as unknown as BookDoc)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </section>

      <AnimatePresence>
        {selected && (
          <Reader title={selected.title} author="Tsukizoe" genre={selected.genre}
            coverUrl={selected.coverUrl} pages={selected.pages} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </main>
  );
}
