import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "MonthlyAlerts — Your Personal Health Coach",
  description:
    "Daily meal and exercise guidance from your AI health coach, with a clear monthly progress summary. Simple, professional, built for habits.",
  metadataBase: new URL("https://monthlyalerts.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
