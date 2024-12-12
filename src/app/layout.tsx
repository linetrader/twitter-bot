import type { Metadata } from "next";
import "../../styles/globals.css";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Twitter Bot App",
  description: "twitter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <header>
          <Navbar />
        </header>
        <main className="max-w-screen-sm mx-auto p-5">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </main>
      </body>
    </html>
  );
}
