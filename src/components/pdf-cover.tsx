"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface CoverData { dataUrl: string; ratio: number; } // ratio = width/height

const coverCache = new Map<string, CoverData>();

async function renderFirstPage(url: string): Promise<CoverData> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const pdf = await pdfjsLib.getDocument({ url, disableStream: true }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d")!;
  await page.render({ canvasContext: ctx, viewport, canvas } as Parameters<typeof page.render>[0]).promise;
  return { dataUrl: canvas.toDataURL("image/jpeg", 0.85), ratio: viewport.width / viewport.height };
}

export function usePdfCover(url: string | null | undefined): string | null {
  const [dataUrl, setDataUrl] = useState<string | null>(() =>
    url ? (coverCache.get(url)?.dataUrl ?? null) : null
  );

  useEffect(() => {
    if (!url) return;
    const cached = coverCache.get(url);
    if (cached) { setDataUrl(cached.dataUrl); return; }
    let cancelled = false;
    renderFirstPage(url).then((data) => {
      if (cancelled) return;
      coverCache.set(url, data);
      setDataUrl(data.dataUrl);
    }).catch(() => { /* silent */ });
    return () => { cancelled = true; };
  }, [url]);

  return dataUrl;
}

// Trả aspect ratio (width/height) của trang 1 PDF, mặc định 0.68 (portrait chuẩn)
export function usePdfAspectRatio(url: string | null | undefined): number {
  const [ratio, setRatio] = useState<number>(() =>
    url ? (coverCache.get(url)?.ratio ?? 0) : 0
  );

  useEffect(() => {
    if (!url) return;
    const cached = coverCache.get(url);
    if (cached) { setRatio(cached.ratio); return; }
    let cancelled = false;
    renderFirstPage(url).then((data) => {
      if (cancelled) return;
      coverCache.set(url, data);
      setRatio(data.ratio);
    }).catch(() => { /* silent */ });
    return () => { cancelled = true; };
  }, [url]);

  return ratio; // 0 = chưa biết
}

export function useCoverFromStorage(
  fileStorageId: string | undefined,
  fileType: string | undefined,
  source: "books" | "gallery",
): string | null {
  const fileUrl = useQuery(
    source === "books" ? api.books.getFileUrl : api.gallery.getFileUrl,
    fileStorageId ? { storageId: fileStorageId } : "skip",
  );
  const isPdf = fileType === "pdf";
  return usePdfCover(isPdf && fileUrl ? fileUrl : null);
}

// Trả ratio từ storageId — dùng cho shelf/book-3d
export function useAspectRatioFromStorage(
  fileStorageId: string | undefined,
  fileType: string | undefined,
  source: "books" | "gallery",
): number {
  const fileUrl = useQuery(
    source === "books" ? api.books.getFileUrl : api.gallery.getFileUrl,
    fileStorageId ? { storageId: fileStorageId } : "skip",
  );
  const isPdf = fileType === "pdf";
  return usePdfAspectRatio(isPdf && fileUrl ? fileUrl : null);
}
