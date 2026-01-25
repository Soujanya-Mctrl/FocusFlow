import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { StoreSync } from "@/components/auth/StoreSync";
import { DevTools } from "@/components/debug/DevTools";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "FocusFlow | Elevate Your Productivity",
  description: "A premium minimalist focus timer designed for high-performance deep work.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FocusFlow",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <body className={`${outfit.variable} font-sans antialiased bg-black text-white`}>
          <StoreSync />
          <DevTools />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
