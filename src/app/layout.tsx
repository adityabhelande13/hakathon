import type { Metadata } from "next";
import "./globals.css";

import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexus Pharmacy | AI Assistant",
  description: "Your Autonomous AI Pharmacist",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} font-sans antialiased`}
      >
        <div className="flex flex-col min-h-screen pb-16">
          {children}
        </div>
      </body>
    </html>
  );
}
