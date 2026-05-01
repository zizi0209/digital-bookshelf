"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import HTMLFlipBook from "react-pageflip";

/* ---------- Page-flip sound hook ---------- */
function usePageFlipSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  return useCallback(() => {
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") void ctx.resume();
      const dur = 0.35;
      const len = ctx.sampleRate * dur;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() > 0.4 ? 1 : 0.2);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass"; bp.frequency.value = 3500; bp.Q.value = 0.5;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass"; hp.frequency.value = 1200;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
      g.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.06);
      g.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.12);
      g.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.18);
      g.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.25);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      src.connect(bp).connect(hp).connect(g).connect(ctx.destination);
      src.start();
    } catch { /* silent */ }
  }, []);
}

/* ---------- Reader component ---------- */
interface ReaderProps {
  title: string;
  author?: string;
  genre?: string;
  coverUrl?: string;
  pages: string[];
  onClose: () => void;
}

export function Reader({ title, author, genre, coverUrl, pages, onClose }: ReaderProps) {
  const playFlip = usePageFlipSound();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);
  const [dims, setDims] = useState({ width: 500, height: 700 });
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const resize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (vw < 768) {
        setMobile(true);
        const w = vw - 16;
        const h = vh - 80;
        setDims({ width: w, height: h });
      } else {
        // Desktop spread: tổng rộng = width*2, phải vừa viewport
        setMobile(false);
        const h = vh - 60;
        const wFromH = Math.round(h * 0.68);
        const wFromVw = Math.floor((vw - 80) / 2);
        const w = Math.min(wFromH, wFromVw);
        setDims({ width: w, height: h });
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const next = () => bookRef.current?.pageFlip().flipNext();
  const prev = () => bookRef.current?.pageFlip().flipPrev();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 md:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative flex justify-center items-center z-10"
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-0 -right-16 text-[#f5f0e6] hover:text-white hover:bg-white/20 z-[70] rounded-full p-2">
          <X className="w-6 h-6 md:w-8 md:h-8" />
        </button>

        {/* Nav Prev */}
        <div className="absolute inset-y-0 -left-4 md:-left-16 flex items-center pointer-events-none z-[80]">
          <button onClick={prev} className="pointer-events-auto bg-black/20 hover:bg-black/40 backdrop-blur-md p-3 rounded-full text-white transition-all hover:scale-110 active:scale-95 shadow-lg hidden md:block">
            <ChevronLeft className="w-8 h-8" />
          </button>
        </div>

        {/* Nav Next */}
        <div className="absolute inset-y-0 -right-4 md:-right-16 flex items-center pointer-events-none z-[80]">
          <button onClick={next} className="pointer-events-auto bg-black/20 hover:bg-black/40 backdrop-blur-md p-3 rounded-full text-white transition-all hover:scale-110 active:scale-95 shadow-lg hidden md:block">
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        <div className="shadow-2xl rounded-sm">
          {/* @ts-expect-error react-pageflip typings */}
          <HTMLFlipBook
            width={dims.width} height={dims.height} size="fixed"
            maxShadowOpacity={0.5} showCover mobileScrollSupport
            onFlip={() => playFlip()} className="html-book" ref={bookRef}
            flippingTime={800} usePortrait={mobile} useMouseEvents
            style={{ margin: "0 auto" }}
          >
            {/* Front Cover */}
            <div className="demoPage bg-[#fdfaf6] border border-[#dcd7cc] flex flex-col justify-center items-center overflow-hidden shadow-[inset_-20px_0_40px_rgba(0,0,0,0.05)]">
              {coverUrl ? (
                <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                  <h1 className="text-4xl font-serif text-[#5a5a40] mb-4 font-bold">{title}</h1>
                  <p className="text-[#8e8a7d] italic text-lg mb-8">bởi {author || "Tsukizoe"}</p>
                </div>
              )}
              <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/20 to-transparent pointer-events-none z-10" />
            </div>

            {/* Inside Cover */}
            <div className="demoPage bg-[#f9f6f0] border-l border-[#dcd7cc] shadow-[inset_20px_0_40px_rgba(0,0,0,0.05)] text-center flex flex-col justify-center text-sm text-stone-300" style={{ fontFamily: "'Inter',sans-serif" }}>
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-10" />
              Tsukizoe
            </div>

            {/* Content Pages */}
            {pages.map((content, idx) => (
              <div key={idx} className="demoPage bg-[#fdfaf6] py-10 px-8 md:px-12 border border-[#f0ebe1] flex flex-col relative">
                <div className={`absolute inset-y-0 ${idx % 2 === 0 ? "right-0 w-8 bg-gradient-to-l from-black/10" : "left-0 w-8 bg-gradient-to-r from-black/10"} to-transparent pointer-events-none z-10`} />
                <div className="flex justify-between items-center mb-6 border-b border-[#e5e0d5] pb-3 opacity-50 z-20 relative">
                  <span className="text-[10px] uppercase tracking-widest text-[#5a5a40]" style={{ fontFamily: "'Inter',sans-serif" }}>
                    {idx % 2 !== 0 ? title : (genre || "").replace("_", " ")}
                  </span>
                  <span className="text-[10px] text-[#5a5a40] tracking-widest" style={{ fontFamily: "'Inter',sans-serif" }}>
                    TRANG {idx + 1}
                  </span>
                </div>
                <div className="font-serif text-[#5c544d] leading-[1.8] text-base md:text-lg flex-1 overflow-hidden z-20 relative" dangerouslySetInnerHTML={{ __html: content.replace(/\\n/g, "<br/>") }} />
              </div>
            ))}

            {/* End Page */}
            <div className="demoPage bg-[#fdfaf6] border border-[#dcd7cc] flex flex-col justify-center items-center relative">
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-10" />
              <p className="text-2xl font-serif italic mb-4 opacity-70">Hết</p>
              <div className="w-16 h-px bg-[#e5e0d5]" />
            </div>

            {/* Back Cover */}
            <div className="demoPage bg-[#8e8a7d] border border-[#5c544d] flex justify-center items-center shadow-[inset_20px_0_40px_rgba(0,0,0,0.1)] relative">
              <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/20 to-transparent pointer-events-none z-10" />
              <p className="text-[#e5e0d5] text-sm opacity-50 tracking-widest uppercase" style={{ fontFamily: "'Inter',sans-serif" }}>Tsukizoe</p>
            </div>
          </HTMLFlipBook>
        </div>
      </motion.div>
    </div>
  );
}
