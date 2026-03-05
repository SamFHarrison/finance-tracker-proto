import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientSideProviders from "@/components/providers/ClientSideProviders";
import TabBar from "@/components/blocks/TabBar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "FinTrack Prototype",
  description: "Personal finance planning app.",
  applicationName: "FinTrack Prototype",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    startupImage: "/icons/icon-512.png",
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
          <ClientSideProviders>
            {children}
            <TabBar />
          </ClientSideProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
