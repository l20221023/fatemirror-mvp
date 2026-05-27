import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FateMirror",
  description:
    "Reflective readings for love, timing, and personal energy, inspired by Eastern wisdom and reimagined for modern life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <div className="min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-foreground)]">
          {children}
        </div>
      </body>
    </html>
  );
}
