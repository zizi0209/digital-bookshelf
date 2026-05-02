"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// Lấy dataURL của trang 1 PDF từ một URL
async function renderFirstPage(url: string): Promise<string> {
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
  return canvas.toDataURL("image/jpeg", 0.85);
}

// Cache để tránh render lại cùng một PDF nhiều lần
const coverCache = new Map<string, string>();

export function usePdfCover(url: string | null | undefined): string | null {
  const [dataUrl, setDataUrl] = useState<string | null>(() =>
    url ? (coverCache.get(url) ?? null) : null
  );

  useEffect(() => {
    if (!url) return;
    if (coverCache.has(url)) { setDataUrl(coverCache.get(url)!); return; }
    let cancelled = false;
    renderFirstPage(url).then((img) => {
      if (cancelled) return;
      coverCache.set(url, img);
      setDataUrl(img);
    }).catch(() => { /* silent — fallback sẽ hiển thị */ });
    return () => { cancelled = true; };
  }, [url]);

  return dataUrl;
}

// Component lấy file URL từ Convex rồi trích xuất bìa PDF
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
  const cover = usePdfCover(isPdf && fileUrl ? fileUrl : null);
  return cover;
}
