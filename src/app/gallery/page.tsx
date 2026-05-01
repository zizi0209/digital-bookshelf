"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Book3D } from "@/components/book-3d";
import { Reader } from "@/components/reader";
import { BookSkeleton } from "@/components/skeleton";
import { Users, Filter } from "lucide-react";

const GENRES = ["all", "fantasy", "romance", "mystery", "slice_of_life", "horror"] as const;
const GENRE_LABELS: Record<string, string> = {
  all: "Tất Cả", fantasy: "Fantasy", romance: "Romance",
  mystery: "Mystery", slice_of_life: "Slice of Life", horror: "Horror",
};

type GalleryDoc = {
  _id: string; title: string; authorName: string; description: string;
  genre: string; coverUrl?: string; pages: string[]; status: string; createdAt: number;
};

export default function GalleryPage() {
  const [genre, setGenre] = useState("all");
  const [selected, setSelected] = useState<GalleryDoc | null>(null);
  const items = useQuery(api.gallery.listApproved, genre === "all" ? {} : { genre });

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-[#f9f6f0] border-b border-[#e5e0d5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-12 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-[#5a5a40]" />
            <h1 className="text-3xl md:text-5xl font-bold text-[#5a5a40]">Phòng Trưng Bày</h1>
          </div>
          <p className="max-w-2xl text-sm md:text-base text-[#8e8a7d]" style={{ fontFamily: "'Inter',sans-serif" }}>
            Tác phẩm do cộng đồng đọc giả sáng tác, đã được duyệt bởi admin. Mỗi câu chuyện là một thế giới riêng — hãy khám phá!
          </p>
        </div>
      </div>

      {/* Genre filter */}
      <div className="h-12 w-full px-4 sm:px-8 flex items-center gap-4 sm:gap-6 bg-[#fdfaf6] border-b border-[#e5e0d5] overflow-x-auto whitespace-nowrap">
        <span className="text-xs font-bold uppercase text-[#8e8a7d]" style={{ fontFamily: "'Inter',sans-serif" }}>
          <Filter className="w-3 h-3 inline mr-1" />Lọc:
        </span>
        {GENRES.map((g) => (
          <button key={g} onClick={() => setGenre(g)}
            className={`text-sm italic transition-colors capitalize ${genre === g ? "text-[#5a5a40] font-bold underline underline-offset-4" : "text-[#8e8a7d] hover:text-[#5a5a40]"}`}>
            {GENRE_LABELS[g] || g}
          </button>
        ))}
      </div>

      {/* Grid */}
      <section className="flex-1 py-8 px-4 sm:px-12 bg-[#f2ede4]">
        {items === undefined ? (
          <BookSkeleton />
        ) : items.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center text-[#8e8a7d]">
            <Users className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">Chưa có tác phẩm nào được duyệt.</p>
            <p className="text-sm mt-2">Hãy gửi tác phẩm của bạn qua trang &quot;Gửi Tác Phẩm&quot;!</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="relative shelf-lines">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-0 pb-16">
                <AnimatePresence mode="popLayout">
                  {items.map((item, i) => (
                    <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="flex justify-center mb-6 h-64 items-end drop-shadow-md z-10">
                      <Book3D title={item.title} author={item.authorName} coverUrl={item.coverUrl}
                        onClick={() => setSelected(item as unknown as GalleryDoc)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </section>

      <AnimatePresence>
        {selected && (
          <Reader title={selected.title} author={selected.authorName} genre={selected.genre}
            coverUrl={selected.coverUrl} pages={selected.pages} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </main>
  );
}
