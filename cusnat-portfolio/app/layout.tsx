import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cusnat Sova | Data Science & ML Engineer",
  description: "Portfolio of Cusnat Sova - Data Science & Machine Learning Engineer. Python Developer, CGPA 9.0+, Pre-Final Year CSE.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
    <body
      className={`${outfit.className} ${jetbrainsMono.variable} antialiased`}
    >
      {children}
    </body>
  </html>
  );
}
