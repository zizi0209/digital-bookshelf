"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import HTMLFlipBook from "react-pageflip";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getPdfDoc, getPdfRatio, renderPdfPage, ratioCache } from "./pdf-cover";

/* ---------- Page-flip sound ---------- */
function usePageFlipSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  return useCallback(() => {
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") void ctx.resume();
      const dur = 0.35, len = ctx.sampleRate * dur;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() > 0.4 ? 1 : 0.2);
      const src = ctx.createBufferSource(); src.buffer = buf;
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 3500; bp.Q.value = 0.5;
      const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1200;
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

const nfc = (s: string) => s.normalize("NFC");

/* ---------- Dims — dùng ratio thực ---------- */
function useDims(pageRatio = 0) {
  const [s, setS] = useState({ w: 500, h: 700, mobile: false });
  useEffect(() => {
    const r = pageRatio > 0 ? pageRatio : 0.68;
    const calc = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      if (vw < 768) {
        const w = vw - 16;
        setS({ w, h: Math.min(Math.round(w / r), vh - 80), mobile: true });
      } else {
        // Dự phòng 100px mỗi bên cho nút prev/next + nút đóng
        const maxH = vh - 80;
        const maxW = Math.floor((vw - 200) / 2);
        const h = Math.min(maxH, Math.round(maxW / r));
        setS({ w: Math.round(h * r), h, mobile: false });
      }
    };
    calc(); window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [pageRatio]);
  return s;
}

/* ---------- FlipBook Shell ---------- */
interface ShellProps {
  title: string; author?: string; coverUrl?: string; onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bookRef: React.RefObject<any>;
  w: number; h: number; mobile: boolean; onFlip: () => void;
  children: React.ReactNode;
}
function FlipBookShell({ title, author, coverUrl, onClose, bookRef, w, h, mobile, onFlip, children }: ShellProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 md:p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative flex justify-center items-center z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-0 -right-16 text-[#f5f0e6] hover:text-white hover:bg-white/20 z-[70] rounded-full p-2">
          <X className="w-6 h-6 md:w-8 md:h-8" />
        </button>
        <div className="absolute inset-y-0 -left-4 md:-left-16 flex items-center pointer-events-none z-[80]">
          <button onClick={() => bookRef.current?.pageFlip().flipPrev()} className="pointer-events-auto bg-black/20 hover:bg-black/40 backdrop-blur-md p-3 rounded-full text-white transition-all hover:scale-110 active:scale-95 shadow-lg hidden md:block">
            <ChevronLeft className="w-8 h-8" />
          </button>
        </div>
        <div className="absolute inset-y-0 -right-4 md:-right-16 flex items-center pointer-events-none z-[80]">
          <button onClick={() => bookRef.current?.pageFlip().flipNext()} className="pointer-events-auto bg-black/20 hover:bg-black/40 backdrop-blur-md p-3 rounded-full text-white transition-all hover:scale-110 active:scale-95 shadow-lg hidden md:block">
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
        <div className="shadow-2xl rounded-sm">
          {/* @ts-expect-error react-pageflip typings */}
          <HTMLFlipBook width={w} height={h} size="fixed" maxShadowOpacity={0.5} showCover
            mobileScrollSupport onFlip={onFlip} className="html-book" ref={bookRef}
            flippingTime={800} usePortrait={mobile} useMouseEvents style={{ margin: "0 auto" }}>
            {/* Bìa trước */}
            <div className="demoPage bg-[#fdfaf6] border border-[#dcd7cc] flex flex-col justify-center items-center overflow-hidden shadow-[inset_-20px_0_40px_rgba(0,0,0,0.05)]">
              {coverUrl
                ? <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                : <div className="p-8 text-center h-full flex flex-col items-center justify-center"><h1 className="text-4xl font-serif text-[#5a5a40] mb-4 font-bold">{title}</h1><p className="text-[#8e8a7d] italic text-lg">bởi {author || "Tsukizoe"}</p></div>
              }
              <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/20 to-transparent pointer-events-none z-10" />
            </div>
            {/* Trang lót */}
            <div className="demoPage bg-[#f9f6f0] border-l border-[#dcd7cc] shadow-[inset_20px_0_40px_rgba(0,0,0,0.05)] text-center flex flex-col justify-center text-sm text-stone-300" style={{ fontFamily: "'Inter',sans-serif" }}>
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-10" />Tsukizoe
            </div>
            {children}
            {/* Trang Hết */}
            <div className="demoPage bg-[#fdfaf6] border border-[#dcd7cc] flex flex-col justify-center items-center relative">
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-10" />
              <p className="text-2xl font-serif italic mb-4 opacity-70">Hết</p>
              <div className="w-16 h-px bg-[#e5e0d5]" />
            </div>
            {/* Bìa sau */}
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

/* ==========================================================
   PDF Reader — Không dùng react-pdf, dùng trực tiếp pdfjs
   cache dùng chung với cover trên kệ sách
   - Load doc → lấy numPages + ratio ngay (không render)
   - Render trang 1, 2, 3... tuần tự
   - Flipbook hiện ngay khi có ratio + numPages
   ========================================================== */
function PdfFlipReader({ url, title, author, coverUrl, onClose }: {
  url: string; title: string; author?: string; coverUrl?: string; onClose: () => void;
}) {
  const playFlip = usePageFlipSound();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);

  // Dùng ratio đã cache từ lúc xem bìa trên kệ (instant nếu đã load)
  const [ratio, setRatio] = useState(() => ratioCache.get(url) ?? 0);
  const [numPages, setNumPages] = useState(0);
  const [pageImages, setPageImages] = useState<(string | null)[]>([]);

  const { w, h, mobile } = useDims(ratio);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Bước 1: Load doc (có thể đã cache từ cover)
      const doc = await getPdfDoc(url);
      const n = doc.numPages;

      // Bước 2: Lấy ratio ngay (không render)
      const r = await getPdfRatio(url);
      if (!cancelled) { setRatio(r); setNumPages(n); setPageImages(Array.from({ length: n }, () => null)); }

      // Bước 3: Render trang 1 → 2 → 3... tuần tự
      for (let i = 0; i < n; i++) {
        if (cancelled) break;
        const img = await renderPdfPage(url, i + 1, 650);
        if (!cancelled) setPageImages((prev) => { const next = [...prev]; next[i] = img; return next; });
      }
    }

    load().catch(() => {});
    return () => { cancelled = true; };
  }, [url]);

  if (numPages === 0)
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/80 gap-4">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
        <p className="text-white/70 text-sm">Đang tải…</p>
      </div>
    );

  return (
    <FlipBookShell title={title} author={author} coverUrl={coverUrl ?? pageImages[0] ?? undefined}
      onClose={onClose} bookRef={bookRef} w={w} h={h} mobile={mobile} onFlip={playFlip}>
      {pageImages.slice(1).map((src, idx) => (
        <div key={idx} className="demoPage bg-[#fdfaf6] border border-[#f0ebe1] relative overflow-hidden flex items-center justify-center">
          {src
            ? <img src={src} alt={`Trang ${idx + 2}`} className="w-full h-full object-contain" />
            : <Loader2 className="w-7 h-7 text-[#dcd7cc] animate-spin" />
          }
          <div className={`absolute inset-y-0 ${idx % 2 === 0 ? "right-0 w-6 bg-gradient-to-l" : "left-0 w-6 bg-gradient-to-r"} from-black/10 to-transparent pointer-events-none`} />
        </div>
      ))}
    </FlipBookShell>
  );
}

/* ==========================================================
   EPUB
   ========================================================== */
function EpubReader({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl h-[92vh] bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#1e293b] text-white shrink-0">
          <span className="text-sm font-medium truncate max-w-xs">{title}</span>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 rounded p-1.5 ml-3"><X className="w-4 h-4" /></button>
        </div>
        <iframe src={url} className="flex-1 w-full border-0" title={title} sandbox="allow-scripts allow-same-origin" />
      </div>
    </div>
  );
}

/* ==========================================================
   File wrapper
   ========================================================== */
function FileFlipReader({ storageId, fileType, title, author, coverUrl, source, onClose }: {
  storageId: string; fileType: string; title: string; author?: string;
  coverUrl?: string; source: "books" | "gallery"; onClose: () => void;
}) {
  const fileUrl = useQuery(
    source === "books" ? api.books.getFileUrl : api.gallery.getFileUrl,
    { storageId },
  );

  if (fileUrl === undefined)
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80">
        <Loader2 className="w-8 h-8 text-white animate-spin mr-3" />
        <p className="text-white/70 text-sm">Đang lấy tệp…</p>
      </div>
    );
  if (!fileUrl)
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80">
        <p className="text-red-400 text-sm mr-4">Không tìm thấy tệp.</p>
        <button onClick={onClose} className="text-white/60 hover:text-white text-sm underline">Đóng</button>
      </div>
    );
  if (fileType === "epub") return <EpubReader url={fileUrl} title={title} onClose={onClose} />;
  return <PdfFlipReader url={fileUrl} title={title} author={author} coverUrl={coverUrl} onClose={onClose} />;
}

/* ==========================================================
   Public API
   ========================================================== */
export interface ReaderProps {
  title: string; author?: string; genre?: string; coverUrl?: string;
  pages: string[];
  fileStorageId?: string; fileType?: string;
  onClose: () => void;
  source?: "books" | "gallery";
}

export function Reader({ title, author, genre, coverUrl, pages, fileStorageId, fileType, onClose, source = "books" }: ReaderProps) {
  if (fileStorageId && fileType)
    return <FileFlipReader storageId={fileStorageId} fileType={fileType} title={title} author={author} coverUrl={coverUrl} source={source} onClose={onClose} />;
  return <TextFlipReader title={title} author={author} genre={genre} coverUrl={coverUrl} pages={pages} onClose={onClose} />;
}

/* ---------- Text Reader ---------- */
function TextFlipReader({ title, author, genre, coverUrl, pages, onClose }: Omit<ReaderProps, "fileStorageId" | "fileType" | "source">) {
  const playFlip = usePageFlipSound();
  const { w, h, mobile } = useDims();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);
  return (
    <FlipBookShell title={title} author={author} coverUrl={coverUrl} onClose={onClose} bookRef={bookRef} w={w} h={h} mobile={mobile} onFlip={playFlip}>
      {pages.map((content, idx) => (
        <div key={idx} className="demoPage bg-[#fdfaf6] py-10 px-8 md:px-12 border border-[#f0ebe1] flex flex-col relative">
          <div className={`absolute inset-y-0 ${idx % 2 === 0 ? "right-0 w-8 bg-gradient-to-l from-black/10" : "left-0 w-8 bg-gradient-to-r from-black/10"} to-transparent pointer-events-none z-10`} />
          <div className="flex justify-between items-center mb-6 border-b border-[#e5e0d5] pb-3 opacity-50 z-20 relative">
            <span className="text-[10px] uppercase tracking-widest text-[#5a5a40]" style={{ fontFamily: "'Inter',sans-serif" }}>
              {idx % 2 !== 0 ? title : (genre || "").replace("_", " ")}
            </span>
            <span className="text-[10px] text-[#5a5a40] tracking-widest" style={{ fontFamily: "'Inter',sans-serif" }}>TRANG {idx + 1}</span>
          </div>
          <div className="font-serif text-[#5c544d] leading-[1.8] text-base md:text-lg flex-1 overflow-hidden z-20 relative" dangerouslySetInnerHTML={{ __html: nfc(content).replace(/\\n/g, "<br/>") }} />
        </div>
      ))}
    </FlipBookShell>
  );
}
