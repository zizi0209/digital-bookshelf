"use client";

import Image from "next/image";

const COLORS = ["#e8d5b0", "#d4c4a8", "#c9b896", "#ddd0b8", "#e0d4be", "#d8c8a4", "#ede2cc"];

interface ShelfBookProps {
  title: string;
  author?: string;
  coverUrl?: string;
  onClick?: () => void;
  delay?: number;
}

export function ShelfBook({ title, author, coverUrl, onClick, delay = 0 }: ShelfBookProps) {
  const hash = title.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const fallbackColor = COLORS[hash % COLORS.length];

  return (
    <div className="shelf-book animate-fadeInUp" onClick={onClick} style={{ animationDelay: `${delay}ms` }}>
      <div className="shelf-book-cover" style={!coverUrl ? { background: fallbackColor } : undefined}>
        {coverUrl ? (
          <Image src={coverUrl} alt={title} fill className="object-cover" referrerPolicy="no-referrer" sizes="120px" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-3 text-center">
            <span className="font-serif font-bold text-sm leading-tight line-clamp-3 text-[#4a3520]">{title}</span>
            {author && <span className="text-[10px] mt-2 opacity-60 uppercase tracking-wide text-[#6b5a48]" style={{ fontFamily: "'Inter',sans-serif" }}>{author}</span>}
          </div>
        )}
      </div>
      <div className="shelf-book-shadow" />
      <p className="shelf-book-title">{title}</p>
    </div>
  );
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
    <div className="shelf-wall">
      {rows.map((row, ri) => (
        <div key={ri} className="shelf-row">
          {row.map((item, ci) => renderBook(item, ri * perRow + ci))}
          <div className="shelf-plank" />
        </div>
      ))}
    </div>
  );
}
