import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientSideProviders from "@/components/providers/ClientSideProviders";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "FinTrack Prototype",
  description: "Personal finance planning app.",
  applicationName: "FinTrack Prototype",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FinTrack Prototype",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="flex h-dvh flex-col gap-8 overflow-y-scroll pt-4">
        <ThemeProvider>
          <ClientSideProviders>{children}</ClientSideProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
