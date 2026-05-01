import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "./components/Toast";
import Navbar from "./components/Navbar";
import { getCurrentStaff } from "./actions/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NECT Election Portal",
  description: "Official voting portal for NECT Elections",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const staff = await getCurrentStaff();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ToastProvider>
          <Navbar staff={staff} />
          <div className="flex-1">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
