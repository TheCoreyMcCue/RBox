import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SessionWrapper from "./components/SessionWrapper";

export const metadata: Metadata = {
  title: "Nana's Cookbook",
  description: `A cozy digital recipe box that feels like home. Keep your family favorites safe, organized and ready to share — just like the one Grandma used to open on Sunday mornings.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionWrapper>
      <html lang="en" className="h-full" suppressHydrationWarning>
        <body className="flex flex-col min-h-dvh bg-gradient-to-b from-amber-50 via-amber-100 to-amber-50 text-amber-900 antialiased bg-[url('/textures/notebook-paper.jpg')] bg-cover bg-center">
          <Header />
          <main className="flex-grow flex flex-col">{children}</main>
          <Footer />
        </body>
      </html>
    </SessionWrapper>
  );
}
