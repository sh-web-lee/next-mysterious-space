import type { Metadata } from "next";
import "./globals.scss";
import "./components.scss";

export const metadata: Metadata = {
  title: "ZGOODorDIE - Mysterious Space",
  description: "Enter the mysterious space of ZGOODorDIE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favico.svg" />
        {/* Preconnect to Draco CDN for GLTF model decompression */}
        <link
          rel="preconnect"
          href="https://www.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Preload critical assets — start loading before JS boots */}
        <link
          rel="preload"
          href="/font/HarmonyOS_Sans_Bold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/font/HarmonyOS_Sans_Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/models/house.glb"
          as="fetch"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/hdr/scene.hdr"
          as="fetch"
          crossOrigin="anonymous"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="">{children}</body>
    </html>
  );
}
