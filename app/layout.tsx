import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STEAD // the hand is human, the cursor is absolute.",
  description:
    "An invisible mathematical substrate that filters biological oscillation. Experience sub-millisecond cursor stabilization directly in the browser.",
  openGraph: {
    title: "STEAD",
    description: "The hand is human, the cursor is absolute.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full overflow-x-hidden cursor-none">
        {children}
      </body>
    </html>
  );
}
