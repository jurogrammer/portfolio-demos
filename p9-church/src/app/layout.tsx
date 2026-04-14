import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "밀알교회 | Milal Church",
  description: "밀알교회 홈페이지 - Toronto, ON Canada",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
