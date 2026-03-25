import type { Metadata } from "next";
import "./globals.css";
import SocketListener from "./components/SocketListener";

export const metadata: Metadata = {
  title: "Socioverse",
  description: "A beautiful social media experience",
  icons: {
    icon: "/socio.svg.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SocketListener />
        {children}</body>
    </html>
  );
}