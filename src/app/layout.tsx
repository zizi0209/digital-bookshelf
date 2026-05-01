import type { Metadata } from "next";
import "./globals.css";
import { ConvexProvider } from "@/components/convex-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Tsukizoe — Digital Bookshelf",
  description: "Khám phá tác phẩm văn học digital của tác giả Tsukizoe & cộng đồng sáng tác.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,500;1,400;1,500&family=Inter:wght@400;500;600&display=swap&subset=vietnamese,latin" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Noto Serif', Georgia, serif" }}>
        <ConvexProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </ConvexProvider>
      </body>
    </html>
  );
}
