import type { Metadata } from "next";
import { Providers } from "./Providers";

import "./globals.css";

const APP_URL = "https://bluestake.vercel.app";

export const metadata: Metadata = {
  title: "Bluestake",
  description: "Earn safe, blue-chip yield in one click",
  metadataBase: new URL(APP_URL),
  keywords: ["staking", "yield", "ethereum", "defi", "investing", "passive income", "farcaster", "finance", "aave", "USDC"],
  authors: [{ name: "Daimo team" }],
  creator: "Daimo team",
  publisher: "Daimo team",

  
  // Favicons
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
    ]
  },
  manifest: "/site.webmanifest",
  
  // Open Graph
  openGraph: {
    type: "website",
    url: APP_URL,
    title: "Bluestake",
    description: "Earn safe, blue-chip yield in one click",
    siteName: "Bluestake",
    images: [
      {
        url: `${APP_URL}/bluestake-og.png`,
        width: 1200,
        height: 630,
        alt: "Bluestake - Earn safe, blue-chip yield in one click"
      }
    ]
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "Bluestake",
    description: "Earn safe, blue-chip yield in one click",
    images: [`${APP_URL}/bluestake-og.png`]
  },
  
  // Verification for search engines
  verification: {
    google: "google-site-verification",
    other: {
      me: ["https://warpcast.com/"]
    }
  },
  
  // Category
  category: "finance"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={`${APP_URL}/bluestake-og.png`} />
        <meta property="fc:frame:button:1" content="🔹 Earn Now 🔹" />
        <meta property="fc:frame:post_url" content={`${APP_URL}/api/frame`} />
        <meta property="fc:frame:embed" content="true" />
        <meta property="fc:frame:embed:url" content={APP_URL} />
        <meta property="fc:frame:embed:allowed_hosts" content="bluestake.vercel.app" />
        <meta property="fc:frame:embed:aspect_ratio" content="1.91:1" />
        <meta property="og:image" content={`${APP_URL}/bluestake-og.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:title" content="Bluestake" />
        <meta property="og:description" content="Earn safe, blue-chip yield in one click" />
        <meta property="og:url" content={APP_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Bluestake" />
        <meta name="application-name" content="Bluestake" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
