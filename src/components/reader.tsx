"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ReaderProps {
  title: string;
  author?: string;
  genre?: string;
  coverUrl?: string;
  pages: string[];
  onClose: () => void;
}

function usePageFlip() {
  const ctxRef = useRef<AudioContext | null>(null);
  return useCallback(() => {
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const len = ctx.sampleRate * 0.15;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass"; bp.frequency.value = 1000; bp.Q.value = 0.5;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      src.connect(bp).connect(g).connect(ctx.destination);
      src.start();
    } catch {}
  }, []);
}

export function Reader({ title, author, genre, coverUrl, pages, onClose }: ReaderProps) {
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1);
  const flip = usePageFlip();
  const total = pages.length;

  const next = () => { if (page < total - 1) { setDir(1); setPage(p => p + 1); flip(); } };
  const prev = () => { if (page > 0) { setDir(-1); setPage(p => p - 1); flip(); } };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8" style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-4xl h-[85vh] md:h-[90vh] flex"
      >
        <button onClick={onClose} className="absolute -top-12 right-0 text-white hover:text-white/70 z-50 p-2 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="w-full h-full rounded-lg shadow-2xl relative flex overflow-hidden" style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
          {/* Spine shadow */}
          <div className="absolute inset-y-0 left-1/2 w-12 -ml-6 bg-gradient-to-r from-black/5 via-black/10 to-transparent pointer-events-none z-10 hidden md:block" />

          {/* Left page (desktop) */}
          <div className="hidden md:flex w-1/2 h-full flex-col p-8 relative" style={{ borderRight: "1px solid var(--color-border)", boxShadow: "inset -30px 0 40px rgba(0,0,0,.03)" }}>
            <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <span className="text-[10px] uppercase tracking-widest opacity-50" style={{ color: "var(--color-primary)", fontFamily: "'Inter',sans-serif" }}>{title}</span>
              <span className="text-[10px] opacity-50" style={{ fontFamily: "'Inter',sans-serif" }}>{page > 0 ? `Trang ${page}` : ""}</span>
            </div>
            <div className="flex-1 overflow-y-auto pr-4">
              <AnimatePresence mode="popLayout">
                <motion.div key={`l-${page}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
                  className="leading-relaxed whitespace-pre-wrap" style={{ color: "#5c544d" }}
                >
                  {page > 0 ? pages[page - 1] : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--color-primary)" }}>{title}</h1>
                      <p className="italic mb-8" style={{ color: "var(--color-muted)" }}>bởi {author || "Tsukizoe"}</p>
                      {coverUrl && <img src={coverUrl} alt="Cover" className="w-48 h-64 object-cover rounded shadow-lg" />}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right page */}
          <div className="w-full md:w-1/2 h-full flex flex-col p-6 md:p-8 relative" style={{ boxShadow: "inset 30px 0 40px rgba(0,0,0,.03)" }}>
            <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <span className="text-[10px] uppercase tracking-widest opacity-50" style={{ color: "var(--color-primary)", fontFamily: "'Inter',sans-serif" }}>{genre || ""}</span>
              <span className="text-[10px] opacity-50" style={{ fontFamily: "'Inter',sans-serif" }}>Trang {page + 1}</span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
              <AnimatePresence mode="popLayout">
                <motion.div key={`r-${page}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
                  className="leading-relaxed whitespace-pre-wrap" style={{ color: "#5c544d" }}
                >
                  {pages[page] || (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                      <p className="text-2xl italic mb-4">— Hết —</p>
                      <div className="w-16 h-px" style={{ background: "var(--color-border)" }} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Nav overlay */}
          <div className="absolute inset-0 flex justify-between items-center pointer-events-none px-2 md:px-0">
            <button onClick={prev} disabled={page === 0}
              className="pointer-events-auto h-full w-1/4 md:w-16 flex items-center justify-start md:justify-center opacity-0 hover:opacity-100 transition-opacity disabled:opacity-0 disabled:cursor-not-allowed"
            >
              <div className="p-2 rounded-full" style={{ background: "rgba(0,0,0,.1)", backdropFilter: "blur(8px)" }}>
                <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
              </div>
            </button>
            <button onClick={next} disabled={page >= total - 1}
              className="pointer-events-auto h-full w-1/4 md:w-16 flex items-center justify-end md:justify-center opacity-0 hover:opacity-100 transition-opacity disabled:opacity-0 disabled:cursor-not-allowed"
            >
              <div className="p-2 rounded-full" style={{ background: "rgba(0,0,0,.1)", backdropFilter: "blur(8px)" }}>
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
