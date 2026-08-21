import type { Metadata, Viewport } from "next";
import "../globals.css";
import NotificationInitializer from "../components/NotificationInitializer";

export const viewport: Viewport = {
  themeColor: "#15170D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "البنيان المرصوص",
    template: "%s | البنيان المرصوص",
  },
  description:
    "رؤية شرعية لقضايا الأمة المعاصرة وقراءة استقراء تاريخي بعين القرآن والسنة",
  applicationName: "البنيان المرصوص",
  keywords: ["إسلام", "شريعة", "قرآن", "سنة", "تاريخ", "أمة", "فقه"],
  authors: [{ name: "البنيان المرصوص" }],
  creator: "البنيان المرصوص",
  publisher: "البنيان المرصوص",
  manifest: "/manifest.json",

  // Apple PWA
  appleWebApp: {
    capable: true,
    title: "البنيان المرصوص",
    statusBarStyle: "black-translucent",
    startupImage: [
      {
        url: "/icons/icon-512.png",
        media: "(device-width: 430px) and (device-height: 932px)",
      },
    ],
  },

  // Open Graph
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: "البنيان المرصوص",
    title: "البنيان المرصوص",
    description:
      "رؤية شرعية لقضايا الأمة المعاصرة وقراءة استقراء تاريخي بعين القرآن والسنة",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "البنيان المرصوص",
      },
    ],
  },

  // Twitter / X
  twitter: {
    card: "summary",
    title: "البنيان المرصوص",
    description:
      "رؤية شرعية لقضايا الأمة المعاصرة وقراءة استقراء تاريخي بعين القرآن والسنة",
    images: ["/icons/icon-512.png"],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
  },

  // Misc
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#15170D",
    "msapplication-TileImage": "/icons/icon-192.png",
    "msapplication-config": "none",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* PWA essentials */}
        <link rel="manifest" href="/manifest.json" />

        {/* Apple touch icons */}
        <link
          rel="apple-touch-icon"
          sizes="192x192"
          href="/icons/icon-192.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="512x512"
          href="/icons/icon-512.png"
        />

        {/* Favicon */}
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icons/icon-192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/icons/icon-512.png"
        />
      </head>
      <body>
        <NotificationInitializer />
        {children}
      </body>
    </html>
  );
}
