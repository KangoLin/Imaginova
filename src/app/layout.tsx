import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Imaginova - AI Image & Video Generation",
  description: "Generate images and videos with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
