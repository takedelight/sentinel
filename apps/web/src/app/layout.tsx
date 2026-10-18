import type { Metadata } from "next";

import { Toaster } from "@sentinel/ui/components/toast";
import "@sentinel/ui/globals.css";
import { Geist, Geist_Mono } from "next/font/google";

import { AuthProvider } from "@/features/auth/model";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Sentinel — панель моніторингу",
  description: "Моніторинг серверних вузлів: статуси, телеметрія, процеси.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uk"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full font-sans antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
