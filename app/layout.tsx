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
  title: "Agniv Kashyap — A Product Career, Played",
  description:
    "An interactive, Mario-style portfolio walking through Agniv Kashyap's product career across Flipkart, Jupiter Money, Rozana, and Cars24.",
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
