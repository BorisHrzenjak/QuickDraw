import Providers from "@/app/providers";
import bgPattern from "@/public/bg-pattern-transparent.png";
import type { Metadata } from "next";
import PlausibleProvider from "next-plausible";
import localFont from "next/font/local";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import { Button } from "@/components/ui/button";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

let title = "BlinkShot – Real-Time AI Image Generator";
let description = "Generate images with AI in a milliseconds";
let url = "https://www.blinkshot.io/";
let ogimage = "https://www.blinkshot.io/og-image.png";
let sitename = "blinkshot.io";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <head>
          <meta name="color-scheme" content="dark" />
          <PlausibleProvider domain="blinkshot.io" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} dark h-full min-h-full bg-[length:6px] font-mono text-gray-100 antialiased`}
          style={{ backgroundImage: `url(${bgPattern.src}` }}
        >
          <header className="fixed w-full">
            <div className="flex items-center justify-end p-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-gray-300 text-gray-100 hover:bg-gray-700 hover:text-gray-100"
                  >
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 rounded-full ring-2 ring-gray-300 hover:ring-gray-100 transition-all",
                      userButtonPopoverCard: "bg-gray-800 border border-gray-700",
                    }
                  }}
                />
              </SignedIn>
            </div>
          </header>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
