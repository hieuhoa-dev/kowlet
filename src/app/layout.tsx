import type { Metadata } from "next";
import { Geist, Geist_Mono,JetBrains_Mono } from "next/font/google";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import "./globals.css";

import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

const geist = JetBrains_Mono({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {

  title: "Kowlet - Collection of Useful Technologies",
  description: "Discover, save, and manage useful technologies, developer tools, websites, and GitHub repositories.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Kowlet - Collection of Useful Technologies",
    description: "Discover, save, and manage useful technologies, developer tools, websites, and GitHub repositories.",
    type: "website",
    images: [
      {
        url: "/kowlet.png",
        width: 1200,
        height: 630,
        alt: "Kowlet - TechStack Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kowlet - Collection of Useful Technologies",
    description: "Discover, save, and manage useful technologies, developer tools, websites, and GitHub repositories.",
    images: ["/kowlet.png"],
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
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body>
        <NuqsAdapter>
          <Providers>{children}</Providers>
        </NuqsAdapter>
      </body>
    </html>
  );
}
