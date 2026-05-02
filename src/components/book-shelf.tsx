"use client";

import Image from "next/image";
import { useCoverFromStorage } from "./pdf-cover";

const COLORS = ["#6b5d50", "#5a5a40", "#7d5a5a", "#5c544d", "#8a7d6b", "#6b6b4e", "#7a6852"];

interface ShelfBookProps {
  title: string;
  author?: string;
  coverUrl?: string;
  fileStorageId?: string;
  fileType?: string;
  source?: "books" | "gallery";
  onClick?: () => void;
  delay?: number;
}

function ShelfBookInner({ title, author, coverUrl, fileStorageId, fileType, source = "books", onClick, delay = 0 }: ShelfBookProps) {
  const extractedCover = useCoverFromStorage(fileStorageId, fileType, source);
  const displayCover = coverUrl ?? extractedCover;
  const hash = title.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const fallbackColor = COLORS[hash % COLORS.length];

  return (
    <div className="shelf-book animate-fadeInUp" onClick={onClick} style={{ animationDelay: `${delay}ms` }}>
      <div className="shelf-book-cover" style={!displayCover ? { background: fallbackColor } : undefined}>
        {displayCover ? (
          <Image src={displayCover} alt={title} fill className="object-cover" referrerPolicy="no-referrer" sizes="130px" unoptimized={displayCover.startsWith("data:")} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <span className="font-serif font-bold text-sm leading-tight line-clamp-3 text-[#fdfaf6]">{title}</span>
            {author && <span className="text-[10px] mt-2 opacity-50 uppercase tracking-wide text-[#fdfaf6]/60" style={{ fontFamily: "'Inter',sans-serif" }}>{author}</span>}
          </div>
        )}
      </div>
      <div className="shelf-book-shadow" />
      <p className="shelf-book-title">{title}</p>
    </div>
  );
}

export function ShelfBook(props: ShelfBookProps) {
  return <ShelfBookInner {...props} />;
}

export function BookshelfGrid<T extends { _id: string }>({
  items,
  perRow = 7,
  renderBook,
}: {
  items: T[];
  perRow?: number;
  renderBook: (item: T, index: number) => React.ReactNode;
}) {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += perRow) {
    rows.push(items.slice(i, i + perRow));
  }

  return (
    <div className="shelf-wall flex-1">
      {rows.map((row, ri) => (
        <div key={ri} className="shelf-row">
          {row.map((item, ci) => renderBook(item, ri * perRow + ci))}
          <div className="shelf-plank" />
        </div>
      ))}
    </div>
  );
}
