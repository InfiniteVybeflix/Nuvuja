import type { Metadata } from "next";
import "./globals.css";
import ServiceWorker from "@/components/ServiceWorker";

export const metadata: Metadata = {
  title: "Nuvuja — Cloud-Born Code Editor",
  description: "The most powerful editor in the universe. AI-powered, lightning-fast, and infinitely extensible.",
  keywords: ["code editor", "AI", "IDE", "programming", "Nuvuja"],
  authors: [{ name: "Nuvuja Labs" }],
  openGraph: {
    title: "Nuvuja Editor",
    description: "Where code meets consciousness",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased">
        <ServiceWorker />
        {children}
      </body>
    </html>
  );
}
