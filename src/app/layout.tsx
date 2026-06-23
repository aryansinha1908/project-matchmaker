import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/providers/SessionProvider";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project MatchMaker",
  description: "Find teammates for hackathons, college projects, startup ideas, research, and open-source contributions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <header className="w-full h-16 border-b border-border bg-background flex items-center px-6">
            <span className="font-bold text-xl text-primary">Project MatchMaker</span>
          </header>
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Toaster richColors theme="dark" />
        </SessionProvider>
      </body>
    </html>
  );
}
