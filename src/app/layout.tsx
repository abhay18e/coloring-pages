// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Image Gallery - Cloudflare R2",
  description:
    "A simple image gallery powered by Cloudflare R2 and Next.js static export.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased flex flex-col min-h-screen`}
      >
        {" "}
        {/* Add flex and min-h */}
        {/* Simple Header */}
        <header className="bg-white shadow-sm p-3 sticky top-0 z-10">
          <nav className="container mx-auto flex justify-between items-center">
            <Link
              href="/"
              className="text-xl font-semibold text-gray-800 tracking-tight"
            >
              R2 Gallery
            </Link>
            {/* Navigation links - keep simple for now */}
            <Link
              href="/"
              className="text-gray-600 hover:text-blue-600 text-sm"
            >
              Home
            </Link>
          </nav>
        </header>
        {/* Main content area - flex-grow to fill space */}
        <main className="container mx-auto p-4 flex-grow">{children}</main>
        {/* Simple Footer */}
        <footer className="text-center py-4 mt-auto text-xs text-gray-500 border-t bg-gray-100">
          {" "}
          {/* mt-auto pushes to bottom */}
          Powered by Cloudflare R2 & Next.js Static Export
        </footer>
      </body>
    </html>
  );
}
