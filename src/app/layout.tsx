import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ONDAY Catalog",
  description: "Demo interface skeleton for ONDAY Catalog"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#060808"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
