import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-space-grotesk"
});

export const metadata: Metadata = {
  title: "High How Are Ya - Anonymous Thought Sharing",
  description: "Share your wildest thoughts anonymously. Get random thoughts from others. Pure chaos, pure connection.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${spaceGrotesk.variable} bg-black text-white`} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
