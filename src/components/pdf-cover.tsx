"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// ---------- Worker init (một lần) ----------
let workerReady = false;
async function getPdfjsLib() {
  const lib = await import("pdfjs-dist");
  if (!workerReady) {
    lib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    workerReady = true;
  }
  return lib;
}

// ---------- Cache PDFDocumentProxy (dùng chung cho cover + reader) ----------
type PdfDoc = Awaited<ReturnType<Awaited<ReturnType<typeof getPdfjsLib>>["getDocument"]>["promise"]>;
const docCache = new Map<string, Promise<PdfDoc>>();

export function getPdfDoc(url: string): Promise<PdfDoc> {
  if (!docCache.has(url)) {
    const p = getPdfjsLib().then((lib) =>
      lib.getDocument({ url, disableStream: false, rangeChunkSize: 65536 }).promise,
    );
    docCache.set(url, p);
  }
  return docCache.get(url)!;
}

// ---------- Ratio cache (width/height trang 1) ----------
export const ratioCache = new Map<string, number>();

export async function getPdfRatio(url: string): Promise<number> {
  if (ratioCache.has(url)) return ratioCache.get(url)!;
  const doc = await getPdfDoc(url);
  const page = await doc.getPage(1);
  const vp = page.getViewport({ scale: 1 });
  const r = vp.width / vp.height;
  ratioCache.set(url, r);
  return r;
}

// ---------- Render trang thành ảnh (dùng doc cache) ----------
const pageImgCache = new Map<string, string>(); // key: `${url}:${pageNum}:${width}`

export async function renderPdfPage(url: string, pageNum: number, width: number): Promise<string> {
  const key = `${url}:${pageNum}:${width}`;
  if (pageImgCache.has(key)) return pageImgCache.get(key)!;

  const doc = await getPdfDoc(url);
  const page = await doc.getPage(pageNum);
  const baseVp = page.getViewport({ scale: 1 });
  const scale = width / baseVp.width;
  const vp = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = vp.width; canvas.height = vp.height;
  await page.render({ canvasContext: canvas.getContext("2d")!, viewport: vp, canvas } as Parameters<typeof page.render>[0]).promise;
  const img = canvas.toDataURL("image/jpeg", pageNum === 1 ? 0.88 : 0.82);
  pageImgCache.set(key, img);
  return img;
}

// ---------- Cover hook (dùng renderPdfPage) ----------
export function usePdfCover(url: string | null | undefined, enabled = true): string | null {
  const [img, setImg] = useState<string | null>(null);
  useEffect(() => {
    if (!url || !enabled) return;
    const key = `${url}:1:520`;
    if (pageImgCache.has(key)) { setImg(pageImgCache.get(key)!); return; }
    let cancelled = false;
    renderPdfPage(url, 1, 520).then((i) => { if (!cancelled) setImg(i); }).catch(() => {});
    return () => { cancelled = true; };
  }, [url, enabled]);
  return img;
}

// ---------- Ratio hook (nhanh — không cần render) ----------
export function usePdfRatio(url: string | null | undefined, enabled = true): number {
  const [ratio, setRatio] = useState<number>(() => (url ? (ratioCache.get(url) ?? 0) : 0));
  useEffect(() => {
    if (!url || !enabled) return;
    if (ratioCache.has(url)) { setRatio(ratioCache.get(url)!); return; }
    let cancelled = false;
    getPdfRatio(url).then((r) => { if (!cancelled) setRatio(r); }).catch(() => {});
    return () => { cancelled = true; };
  }, [url, enabled]);
  return ratio;
}

// ---------- IntersectionObserver lazy trigger ----------
export function useIsInViewport(ref: React.RefObject<HTMLElement | null>): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { rootMargin: "200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return visible;
}

// ---------- Storage hooks ----------
export function useCoverFromStorage(
  fileStorageId: string | undefined,
  fileType: string | undefined,
  source: "books" | "gallery",
  enabled = true,
): string | null {
  const fileUrl = useQuery(
    source === "books" ? api.books.getFileUrl : api.gallery.getFileUrl,
    fileStorageId && enabled ? { storageId: fileStorageId } : "skip",
  );
  return usePdfCover(fileType === "pdf" && fileUrl && enabled ? fileUrl : null, enabled);
}

export function useAspectRatioFromStorage(
  fileStorageId: string | undefined,
  fileType: string | undefined,
  source: "books" | "gallery",
  enabled = true,
): number {
  const fileUrl = useQuery(
    source === "books" ? api.books.getFileUrl : api.gallery.getFileUrl,
    fileStorageId && enabled ? { storageId: fileStorageId } : "skip",
  );
  return usePdfRatio(fileType === "pdf" && fileUrl && enabled ? fileUrl : null, enabled);
}
