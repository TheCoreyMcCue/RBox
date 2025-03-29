import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "./components/Header";
import Footer from "./components/Footer";

import SessionWrapper from "./components/SessionWrapper";

export const metadata: Metadata = {
  title: "Recipe Nest",
  description: "We help you decide whats for dinner tonight!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionWrapper>
      <ClerkProvider>
        <html lang="en">
          <body className="min-h-screen flex flex-col bg-gray-100">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </body>
        </html>
      </ClerkProvider>
    </SessionWrapper>
  );
}
