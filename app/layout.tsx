import type { Metadata } from "next";
import { JetBrains_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";

const jetMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jet-mono",
});

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press-start",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://agniv-portfolio.vercel.app"),
  title: "Agniv Kashyap — A Product Career, Played",
  description:
    "An interactive portfolio walking through Agniv Kashyap's product career across Flipkart, Jupiter Money, Rozana, and Cars24.",
  openGraph: {
    title: "Agniv Kashyap — A Product Career, Played",
    description:
      "An interactive portfolio walking through Agniv Kashyap's product career across Flipkart, Jupiter Money, Rozana, and Cars24.",
    url: "https://agniv-portfolio.vercel.app",
    siteName: "Agniv Kashyap Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Agniv Kashyap Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agniv Kashyap — A Product Career, Played",
    description:
      "An interactive portfolio walking through Agniv Kashyap's product career across Flipkart, Jupiter Money, Rozana, and Cars24.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetMono.variable} ${pressStart.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
