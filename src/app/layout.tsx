import type { Metadata } from "next";
import { Silkscreen, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScanlineOverlay from "@/components/ScanlineOverlay";
import PageTransition from "@/components/PageTransition";

const silkscreen = Silkscreen({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
      "http://localhost:3000"
  ),
  title: "Kyle Bartz - Portfolio",
  description: "Music, video, and resume of Kyle Bartz.",
  openGraph: {
    title: "Kyle Bartz",
    description: "Music, video, and resume of Kyle Bartz.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kyle Bartz",
    description: "Music, video, and resume of Kyle Bartz.",
  },
};

const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.classList.add(stored);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${silkscreen.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ScanlineOverlay />
        <PageTransition />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
