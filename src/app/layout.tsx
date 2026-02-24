import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "COLES CONTROL - Modern Hosting Panel",
  description: "Modern Cyber-Admin Hosting Panel with AI-powered server management. Private Cloud & Custom Hosting for students and enterprises.",
  keywords: ["Coles Control", "Hosting Panel", "Server Management", "Nginx", "PHP-FPM", "MySQL", "AI Assistant", "Cloud Hosting"],
  authors: [{ name: "COLES Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "COLES CONTROL - Modern Hosting Panel",
    description: "Modern Cyber-Admin Hosting Panel with AI-powered server management",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
