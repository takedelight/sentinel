import type { Metadata } from "next";

import { Toaster } from "@sentinel/ui/components/toast";
import "@sentinel/ui/globals.css";
import { Inter, JetBrains_Mono, Lora } from "next/font/google";

import { AuthProvider } from "@/features/auth/model";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "cyrillic"],
});

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin", "cyrillic"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Sentinel — панель моніторингу",
  description: "Моніторинг серверних вузлів: статуси, телеметрія, процеси.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uk"
      className={`${inter.variable} ${jetbrainsMono.variable} ${lora.variable} h-full font-sans antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
