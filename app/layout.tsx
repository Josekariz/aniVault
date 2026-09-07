import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

import "./globals.css";

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const display = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Anime Vault",
  description: "Your favorite anime, all in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${display.variable} bg-black font-sans antialiased`}>
        <div className="mx-auto min-h-screen max-w-7xl bg-canvas text-ink">
          <Navbar />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
