import type { Metadata } from "next";
import { Providers } from "./Providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Bluestake",
  description: "Earn safe, blue-chip yield in one click",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
