"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, query, orderBy, limit, getDocs, doc, updateDoc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/utils";
import imagePlaceholder from "@/public/image-placeholder.png";
import { HeartIcon } from "./icons/heart-icon";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { useUser } from "@clerk/nextjs";
import toast from "@/lib/toast";

interface Generation {
  id: string;
  prompt: string;
  imageData: string;
  likes: number;
  timestamp: string;
  likedBy?: string[];
}

export default function CommunityShowcase() {
  const [latestGenerations, setLatestGenerations] = useState<Generation[]>([]);
  const [topGenerations, setTopGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    // Fetch latest generations with real-time updates
    const latestQuery = query(
      collection(db, "likedImages"),
      orderBy("timestamp", "desc"),
      limit(10)
    );
    
    // Fetch top-rated generations with real-time updates
    const topQuery = query(
      collection(db, "likedImages"),
      orderBy("likes", "desc"),
      limit(10)
    );

    // Set up real-time listeners
    const unsubscribeLatest = onSnapshot(latestQuery, (snapshot) => {
      const uniqueLatestImages = new Map();
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const imageData = data.imageData;
        if (!uniqueLatestImages.has(imageData) || data.timestamp > uniqueLatestImages.get(imageData).timestamp) {
          uniqueLatestImages.set(imageData, {
            id: doc.id,
            prompt: data.prompt,
            imageData: imageData,
            likes: data.likes || 0,
            timestamp: data.timestamp,
            likedBy: data.likedBy || [],
          });
        }
      });
      setLatestGenerations(Array.from(uniqueLatestImages.values()));
      setLoading(false);
    });

    const unsubscribeTop = onSnapshot(topQuery, (snapshot) => {
      const uniqueTopImages = new Map();
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const imageData = data.imageData;
        if (!uniqueTopImages.has(imageData) || data.likes > uniqueTopImages.get(imageData).likes) {
          uniqueTopImages.set(imageData, {
            id: doc.id,
            prompt: data.prompt,
            imageData: imageData,
            likes: data.likes || 0,
            timestamp: data.timestamp,
            likedBy: data.likedBy || [],
          });
        }
      });
      setTopGenerations(Array.from(uniqueTopImages.values()));
    });

    // Cleanup listeners when component unmounts
    return () => {
      unsubscribeLatest();
      unsubscribeTop();
    };
  }, []);

  const handleLike = async (generation: Generation) => {
    if (!isLoaded || !user) {
      toast.error("Please sign in to like images");
      return;
    }

    try {
      const docRef = doc(db, "likedImages", generation.id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        toast.error("Image not found");
        return;
      }

      const data = docSnap.data();
      const likedBy = data.likedBy || [];
      const userId = user.id;
      const isLiked = likedBy.includes(userId);

      // Toggle like
      if (isLiked) {
        await updateDoc(docRef, {
          likes: (data.likes || 0) - 1,
          likedBy: likedBy.filter((id: string) => id !== userId),
        });
      } else {
        await updateDoc(docRef, {
          likes: (data.likes || 0) + 1,
          likedBy: [...likedBy, userId],
        });
      }

      // Update local state
      const updateGenerations = (generations: Generation[]) =>
        generations.map((g) => {
          if (g.id === generation.id) {
            return {
              ...g,
              likes: isLiked ? g.likes - 1 : g.likes + 1,
              likedBy: isLiked
                ? g.likedBy?.filter((id) => id !== userId)
                : [...(g.likedBy || []), userId],
            };
          }
          return g;
        });

      setLatestGenerations(updateGenerations(latestGenerations));
      setTopGenerations(updateGenerations(topGenerations));

      toast.success(isLiked ? "Like removed" : "Image liked!");
    } catch (error) {
      console.error("Error updating like:", error);
      toast.error("Failed to update like");
    }
  };

  const GenerationGrid = ({ generations }: { generations: Generation[] }) => (
    <div className="space-y-4 h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
      {generations.length === 0 ? (
        <div className="text-gray-400 text-sm">No generations yet</div>
      ) : (
        generations.map((generation) => (
          <div key={generation.id} className="relative group">
            <Dialog>
              <DialogTrigger asChild>
                <div className="cursor-pointer">
                  <Image
                    src={`data:image/png;base64,${generation.imageData}`}
                    alt={generation.prompt}
                    width={300}
                    height={300}
                    className="rounded-lg w-full h-auto"
                    placeholder="blur"
                    blurDataURL={imagePlaceholder.blurDataURL}
                    priority={true}
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
                <div className="relative">
                  <Image
                    src={`data:image/png;base64,${generation.imageData}`}
                    alt={generation.prompt}
                    width={1024}
                    height={1024}
                    className="rounded-lg w-auto h-auto max-w-full max-h-[90vh] object-contain"
                    placeholder="blur"
                    blurDataURL={imagePlaceholder.blurDataURL}
                    priority={true}
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-black/50 p-4 rounded-md backdrop-blur-sm">
                    <p className="text-sm text-gray-200">{generation.prompt}</p>
                    <div className="flex items-center mt-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleLike(generation);
                        }}
                        className="flex items-center focus:outline-none"
                      >
                        <HeartIcon 
                          className={`w-5 h-5 ${
                            user && generation.likedBy?.includes(user.id)
                              ? "text-pink-500 fill-current"
                              : "text-gray-400 hover:text-pink-500"
                          } transition-colors`}
                        />
                        <span className="text-sm text-gray-200 ml-1">{generation.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs text-gray-200 line-clamp-2">{generation.prompt}</p>
              <div className="flex items-center mt-1">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleLike(generation);
                  }}
                  className="flex items-center focus:outline-none"
                >
                  <HeartIcon 
                    className={`w-4 h-4 ${
                      user && generation.likedBy?.includes(user.id)
                        ? "text-pink-500 fill-current"
                        : "text-gray-400 hover:text-pink-500"
                    } transition-colors`}
                  />
                  <span className="text-xs text-gray-200 ml-1">{generation.likes}</span>
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="w-[364px] min-w-[350px] h-full bg-gray-900 bg-opacity-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 text-gray-200">Community Showcase</h2>
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-[364px] min-w-[350px] h-full bg-gray-900 bg-opacity-50 p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-4 text-gray-200">Community Showcase</h2>
      <Tabs defaultValue="latest" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="latest" className="flex-1">Latest</TabsTrigger>
          <TabsTrigger value="top" className="flex-1">Top Rated</TabsTrigger>
        </TabsList>
        <TabsContent value="latest">
          <GenerationGrid generations={latestGenerations} />
        </TabsContent>
        <TabsContent value="top">
          <GenerationGrid generations={topGenerations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}