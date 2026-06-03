import type { Metadata, Viewport } from "next";
import { Sarabun, Mali } from "next/font/google";
import "./globals.css";

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mali = Mali({
  variable: "--font-mali",
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ตระการตา · ตารางคอนเทนต์ทีม",
  description: "ตารางงานคอนเทนต์ของทีม ตระการตาผ้าไทย",
  applicationName: "ตระการตา Content",
};

export const viewport: Viewport = {
  themeColor: "#FAF4E8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${sarabun.variable} ${mali.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
