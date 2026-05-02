"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useCoverFromStorage, useAspectRatioFromStorage } from "./pdf-cover";

const COLORS = ["bg-[#7d6b5d]", "bg-[#5a5a40]", "bg-[#944e4e]", "bg-[#6b5a48]", "bg-[#8a7d6b]"];
const BASE_H = 192; // px — chiều cao cố định, width tính từ ratio

interface Book3DProps {
  title: string;
  author?: string;
  coverUrl?: string;
  fileStorageId?: string;
  fileType?: string;
  source?: "books" | "gallery";
  onClick?: () => void;
  className?: string;
}

export function Book3D({ title, author, coverUrl, fileStorageId, fileType, source = "books", onClick, className = "" }: Book3DProps) {
  const extractedCover = useCoverFromStorage(fileStorageId, fileType, source);
  const storedRatio = useAspectRatioFromStorage(fileStorageId, fileType, source);
  const displayCover = coverUrl ?? extractedCover;
  const hash = title.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const fallback = COLORS[hash % COLORS.length];

  const ratio = storedRatio || 0.68;
  const w = Math.round(BASE_H * ratio);

  return (
    <div
      className={`perspective-1000 cursor-pointer group ${className}`}
      style={{ width: w, height: BASE_H }}
      onClick={onClick}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        whileHover={{ rotateY: -15, scale: 1.05, y: -8 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Front Cover */}
        <div className={`absolute inset-0 backface-hidden shadow-lg border border-[#3d2b1f]/10 rounded-r-md overflow-hidden flex flex-col items-center justify-center text-center p-4 ${!displayCover ? `${fallback} text-[#fdfaf6]` : ""}`}>
          {displayCover ? (
            <Image src={displayCover} alt={title} fill className="object-cover" referrerPolicy="no-referrer" unoptimized={displayCover.startsWith("data:")} />
          ) : (
            <>
              <h3 className="font-serif font-bold text-sm md:text-base line-clamp-3 mb-2">{title}</h3>
              {author && <p className="text-xs opacity-80 uppercase tracking-wide" style={{ fontFamily: "'Inter',sans-serif" }}>{author}</p>}
            </>
          )}
          {/* Lighting overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#3d2b1f]/15 via-transparent to-[#fdfaf6]/10 pointer-events-none" />
        </div>

        {/* Spine */}
        <div className={`absolute top-0 bottom-0 left-0 w-4 origin-left -rotate-y-90 rounded-l-sm border-l-2 border-[#3d2b1f]/15 ${!displayCover ? fallback : "bg-[#dcd7cc]"}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#3d2b1f]/10 to-transparent pointer-events-none" />
        </div>

        {/* Pages Edge */}
        <div className="absolute top-1 bottom-1 right-0 w-3 bg-[#fdfaf6] border-y border-y-[#e5e0d5] border-r border-r-[#dcd7cc] origin-right rotate-y-90 translate-x-[1px]" />
      </motion.div>
    </div>
  );
}
