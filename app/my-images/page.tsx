"use client";

import { HeartIcon } from "@/components/icons/heart-icon";
import Logo from "@/components/logo";
import ImageWithCache from "@/components/image-with-cache";
import { useEffect, useState } from "react";
import { SignedIn, useUser } from "@clerk/nextjs";
import { db } from "@/lib/utils";
import { collection, getDocs, query, where, orderBy, deleteDoc, doc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ShareButtons from "@/components/share-buttons";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";

type SavedImage = {
  id: string;
  prompt: string;
  imageData: string;
  timestamp: string;
};

export default function MyImages() {
  const { isLoaded, user } = useUser();
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLikedImages = async () => {
    if (!isLoaded || !user) return;
    
    const q = query(
      collection(db, "likedImages"), 
      where("userId", "==", user.id),
      orderBy("timestamp", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const images = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      prompt: doc.data().prompt,
      imageData: doc.data().imageData,
      timestamp: doc.data().timestamp,
    }));
    setSavedImages(images);
    setLoading(false);
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteDoc(doc(db, "likedImages", imageId));
      setSavedImages((prevImages) => prevImages.filter((img) => img.id !== imageId));
      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  const handleDownloadImage = (imageData: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imageData}`;
    link.download = `${prompt.slice(0, 30)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchLikedImages();
  }, [isLoaded, user, fetchLikedImages]);

  return (
    <SignedIn>
      <div className="flex h-full flex-col px-5">
        <header className="flex justify-between items-center pt-20 md:pt-3">
          <a 
            href="/" 
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </a>
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="cursor-pointer">
                        <ImageWithCache
                          imageData={image.imageData}
                          alt={image.prompt}
                          width={400}
                          height={400}
                          className="rounded-lg shadow-sm shadow-black"
                          priority={true}
                        />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
                      <div className="relative">
                        <ImageWithCache
                          imageData={image.imageData}
                          alt={image.prompt}
                          width={1024}
                          height={1024}
                          className="rounded-lg w-auto h-auto max-w-full max-h-[90vh] object-contain"
                          priority={true}
                        />
                        <div className="absolute bottom-4 left-4 right-4 bg-black/50 p-4 rounded-md backdrop-blur-sm">
                          <p className="text-sm text-gray-200">{image.prompt}</p>
                          <div className="flex justify-between items-center mt-2">
                            <ShareButtons imageData={image.imageData} prompt={image.prompt} />
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadImage(image.imageData, image.prompt);
                                }}
                                className="text-blue-500 hover:text-blue-400"
                                title="Download image"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteImage(image.id)}
                                className="text-red-500 hover:text-red-400"
                              >
                                <HeartIcon className="w-5 h-5 fill-current" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-center">
                      <ShareButtons imageData={image.imageData} prompt={image.prompt} />
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadImage(image.imageData, image.prompt);
                          }}
                          className="text-blue-500 hover:text-blue-400"
                          title="Download image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteImage(image.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <HeartIcon className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <ToastContainer 
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
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
