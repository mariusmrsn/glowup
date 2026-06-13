import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { SwRegister } from "@/components/sw-register";
import { PwaInstallBanner } from "@/components/pwa-install-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#111118",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "GlowUp — Level Up Your Life",
  description:
    "Mache das echte Leben zum RPG. Verbesser dich täglich und leve auf.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GlowUp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground" suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
          <SwRegister />
          <PwaInstallBanner />
        </Providers>
      </body>
    </html>
  );
}
