
import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BackButton from "../src/components/BackButton";
import { Providers } from "./providers";
import HelpCenterButton from "../src/components/HelpCenterButton.client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zeniva Travel AI",
  description: "Plan your perfect trip with Lina AI, your personal travel concierge.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <BackButton />
          <HelpCenterButton />
          {children}
        </Providers>
      </body>
    </html>
  );
}
