// File: layout.tsx
// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Script from "next/script"; // Import Script component
import Image from "next/image"; // Import Next.js Image component

const inter = Inter({ subsets: ["latin"] });

const title = "FreeColoringPages - Printable Coloring Sheets for Everyone";
const description =
  "Browse our collection of free printable coloring pages for kids and adults. Download and print high-quality coloring sheets.";
const image = "/logo.png"; // replace with your actual OG image path
const url = "http://freecoloringpages.fun/"; // update to your actual domain

export const metadata: Metadata = {
  metadataBase: new URL("http://freecoloringpages.fun"),
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description,
    url: url,
    images: [{ url: image }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [image],
  },
  icons: {
    icon: "/icon.png", // change this to a separate icon.png when available
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Google Analytics Scripts placed conceptually in head */}
      <head>
        <Script
          strategy="lazyOnload"
          src="https://www.googletagmanager.com/gtag/js?id=G-X6FYLSH623"
        />
        <Script strategy="lazyOnload" id="google-analytics">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-X6FYLSH623');
        `}
        </Script>
      </head>
      <body
        className={`${inter.className} antialiased flex flex-col min-h-screen`}
      >
        {/* Clean, minimal Apple-inspired header */}
        <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-100">
          <nav className="container mx-auto flex justify-between items-center py-4 px-6">
            <Link
              href="/"
              className="text-2xl font-semibold text-gray-900 tracking-tight flex items-center"
            >
              <Image
                src="/icon.png"
                alt="FreeColoringPages Logo"
                width={28} // Corresponds to w-7 (1.75rem * 16px/rem)
                height={28} // Corresponds to h-7 (1.75rem * 16px/rem)
                unoptimized={true}
                className="w-7 h-7 mr-2"
              />
              <span>FreeColoringPages</span>
            </Link>
            {/* Navigation links with clean design */}
            <div className="flex space-x-6">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                Home
              </Link>
            </div>
          </nav>
        </header>

        {/* Main content area - flex-grow to fill space */}
        <main className="container mx-auto py-8 px-6 flex-grow">
          {children}
        </main>

        {/* Simple footer */}
        <footer className="bg-gray-50 border-t border-gray-100 py-6 px-6">
          <div className="container mx-auto text-center text-gray-500 text-sm">
            <p>
              &copy; {new Date().getFullYear()} FreeColoringPages. All rights
              reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
