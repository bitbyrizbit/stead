import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STEAD · The hand is human, the cursor doesn't have to shake",
  description:
    "STEAD hears the difference between what you reached for and what your hand actually did, then quietly chooses the first one. Sub-millisecond cursor stabilization, right in your browser.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  openGraph: {
    title: "STEAD",
    description: "Your intent, not your tremor.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
      </head>
      <body className="min-h-full bg-cream text-ink font-sans">
        {children}
      </body>
    </html>
  );
}
