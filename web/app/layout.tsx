import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteChrome } from "@/components/site-chrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "MonthlyAlerts — Your Personal Health Coach",
  description:
    "Daily meal and exercise guidance from your AI health coach, with a clear monthly progress summary. Simple, professional, built for habits.",
  metadataBase: new URL("https://monthlyalerts.com"),
};

// App-like viewport: lock zoom so mobile browsers never auto-zoom on input
// focus and the fixed bottom toolbar always stays pinned to the bottom.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

// Applies the saved theme before first paint to avoid a light-mode flash.
const themeInitScript = `(function(){try{var t=localStorage.getItem("ma_theme");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen font-sans">
        <SiteChrome>
          <SiteHeader />
        </SiteChrome>
        {children}
      </body>
    </html>
  );
}
