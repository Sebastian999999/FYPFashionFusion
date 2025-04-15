// src/app/layout.tsx
import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { ChatBot } from "@/components/ChatBot";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { Footer } from "@/components/ui/footer";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "FashionFusion",
  description: "Your one-stop platform for Pakistani fashion brands",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
         <Providers>
          <NavigationBar />
          <div className="pt-16"> {/* Add padding to account for fixed navbar */}
            {children}
          </div>
          <Footer />
          <ChatBot />
        </Providers>
      </body>
    </html>
  );
}