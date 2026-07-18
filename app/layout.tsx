import type { Metadata } from "next";
import { Lilita_One, Space_Grotesk } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import "@/styles/globals.css";

const display = Lilita_One({
  weight: "400",
  variable: "--font-lilita",
  subsets: ["latin"],
});

const sans = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
