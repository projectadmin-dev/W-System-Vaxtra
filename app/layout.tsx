import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "W System v2",
  description: "Multi-tenant project management with Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
