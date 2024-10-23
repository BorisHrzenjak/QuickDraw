"use client";

import { HeartIcon } from "@/components/icons/heart-icon";
import Logo from "@/components/logo";
import Image from "next/image";
import { useEffect, useState } from "react";
import { SignedIn, useUser } from "@clerk/nextjs";
import imagePlaceholder from "@/public/image-placeholder.png";

type SavedImage = {
  id: number;
  prompt: string;
  imageData: string;
  timestamp: string;
};

export default function MyImages() {
  const { user } = useUser();
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [loading, setLoading] = useState(true);

  // This is a placeholder - you'll need to implement the actual data fetching
  useEffect(() => {
    // TODO: Fetch saved images from your database
    setLoading(false);
  }, []);

  return (
    <SignedIn>
      <div className="flex h-full flex-col px-5">
        <header className="flex justify-center pt-20 md:justify-end md:pt-3">
          <div className="absolute left-1/2 top-6 -translate-x-1/2">
            <a href="/" className="hover:opacity-80 transition-opacity">
              <Logo />
            </a>
          </div>
        </header>

        <main className="mt-[100px] flex flex-col items-center">
          <h1 className="text-xl font-semibold text-gray-200 md:text-3xl lg:text-4xl mb-8">
            My Saved Images
          </h1>

          {loading ? (
            <div className="text-gray-300">Loading your images...</div>
          ) : savedImages.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-300 mb-4">No saved images yet</p>
              <a 
                href="/"
                className="inline-flex h-9 items-center justify-center rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-gray-300 focus-visible:outline-none"
              >
                Generate Some Images
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
              {savedImages.map((image) => (
                <div key={image.id} className="relative group">
                  <Image
                    src={image.imageData}
                    alt={image.prompt}
                    width={400}
                    height={400}
                    placeholder="blur"
                    blurDataURL={imagePlaceholder.blurDataURL}
                    className="rounded-lg shadow-sm shadow-black"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-sm text-gray-200 truncate">
                      {image.prompt}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(image.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    className="absolute top-2 right-2 p-2 bg-white bg-opacity-50 rounded-full"
                    title="Remove from saved"
                  >
                    <HeartIcon className="w-4 h-4 text-red-500" fill="currentColor" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>

        <footer className="mt-auto py-8 text-center text-gray-300">
          <p className="text-sm">
            Return to{" "}
            <a href="/" className="underline underline-offset-4 hover:text-blue-500 transition-colors">
              image generation
            </a>
          </p>
        </footer>
      </div>
    </SignedIn>
  );
}
