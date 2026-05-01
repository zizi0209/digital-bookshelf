"use client";

import { motion } from "framer-motion";

const COLORS = ["#7d6b5d", "#5a5a40", "#944e4e", "#4e6b94", "#8a7d6b", "#6b5a7d"];

interface Book3DProps {
  title: string;
  author?: string;
  coverUrl?: string;
  onClick?: () => void;
}

export function Book3D({ title, author, coverUrl, onClick }: Book3DProps) {
  const hash = title.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const bg = COLORS[hash % COLORS.length];

  return (
    <div className="perspective-1000 w-32 md:w-36 lg:w-40 h-48 md:h-56 lg:h-60 cursor-pointer group" onClick={onClick}>
      <motion.div
        className="w-full h-full relative preserve-3d"
        whileHover={{ rotateY: -15, scale: 1.05, y: -8 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Front Cover */}
        <div
          className="absolute inset-0 backface-hidden shadow-lg rounded-r-md overflow-hidden flex flex-col items-center justify-center text-center p-4"
          style={{ background: coverUrl ? undefined : bg, color: coverUrl ? undefined : "#fdfaf6", border: "1px solid rgba(0,0,0,.1)" }}
        >
          {coverUrl ? (
            <img src={coverUrl} alt={title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <>
              <h3 className="font-bold text-sm md:text-base line-clamp-3 mb-2">{title}</h3>
              {author && <p className="text-xs opacity-80 uppercase tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>{author}</p>}
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-white/10 pointer-events-none" />
        </div>

        {/* Spine */}
        <div
          className="absolute top-0 bottom-0 left-0 w-4 origin-left -rotate-y-90 rounded-l-sm"
          style={{ background: coverUrl ? "#c9bfa9" : bg, borderLeft: "2px solid rgba(0,0,0,.2)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent" />
        </div>

        {/* Pages Edge */}
        <div
          className="absolute top-1 bottom-1 right-0 w-3 origin-right rotate-y-90"
          style={{ background: "#fdfaf6", border: "1px solid var(--color-border)", translate: "1px 0" }}
        />
      </motion.div>
    </div>
  );
}
