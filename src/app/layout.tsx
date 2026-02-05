import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "VibePoster",
  description: "Trend-aware social posting powered by Bluesky intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-[family-name:var(--font-geist-sans)]`}
      >
        <div className="min-h-screen flex flex-col">
          <nav className="border-b border-zinc-800 px-6 py-3">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <Link href="/" className="text-lg font-semibold text-zinc-100">
                VibePoster
              </Link>
              <div className="flex items-center gap-6 text-sm">
                <Link
                  href="/trends"
                  className="text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  Trends
                </Link>
                <Link
                  href="/queue"
                  className="text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  Queue
                </Link>
              </div>
            </div>
          </nav>
          <main className="flex-1 px-6 py-8">
            <div className="max-w-5xl mx-auto">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
