import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Providers } from "@/components/providers/Providers";
import CookieBanner from "@/components/layout/CookieBanner";


const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Print with Muri - On-Demand 3D Printing",
  description: "Professional 3D printing services. Upload your models, configure settings, and get high-quality prints delivered.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 bg-[#EDEDED]">
              {children}
            </main>
            <Footer />
          </div>
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
