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

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

let title = "QuickDraw – Real-Time AI Image Generator";
let description = "Generate images with AI in milliseconds";
let url = "https://www.quickdraw.io/";
let ogimage = "https://www.quickdraw.io/og-image.png";
let sitename = "quickdraw.io";

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
          <PlausibleProvider domain="quickdraw.io" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} dark h-full min-h-full bg-[length:6px] font-mono text-gray-100 antialiased`}
          style={{ backgroundImage: `url(${bgPattern.src}` }}
        >
          <header>
            <div className="flex items-center justify-end gap-4 p-4">
              <SignedIn>
                <a 
                  href="/my-images" 
                  className="inline-flex h-9 items-center justify-center rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-300 transition-all hover:border-transparent hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 focus-visible:outline-none"
                >
                  My Images
                </a>
                <UserButton 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8",
                      userButtonTrigger: "focus:shadow-none"
                    }
                  }}
                />
              </SignedIn>
              <SignedOut>
                <SignInButton>
                  <button className="inline-flex h-9 items-center justify-center rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-gray-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">
                    Sign in
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </header>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
