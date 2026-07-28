import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToasteProvider } from "@/components/providers/toaster-provider";
import { ConfettiProvider } from "@/components/providers/confetti-provide";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Online Videos",
  description: "For Students",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ConfettiProvider />
          <ToasteProvider />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
