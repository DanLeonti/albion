import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Albion Crafting Profit Calculator",
  description: "Find the most profitable crafting opportunities in Albion Online",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Suspense>
          <Navbar />
        </Suspense>
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
