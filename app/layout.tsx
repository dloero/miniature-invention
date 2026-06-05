import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "./register-sw";

export const metadata: Metadata = {
  title: "RS Q8 Price Tracker",
  description:
    "Tracks Audi RS Q8 used-car pricing, charts the history, and forecasts where it's headed.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RS Q8 Tracker",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
