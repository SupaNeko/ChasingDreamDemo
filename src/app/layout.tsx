import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "巡梦 — 温柔拼合你的梦境",
  description: "把梦境碎片记录下来，由巡梦员温柔拼合成可回看的梦境故事。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
