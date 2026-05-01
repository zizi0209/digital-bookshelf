import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Tsukizoe Bookshelf",
  description: "Trang quản trị nội bộ.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {children}
    </div>
  );
}
