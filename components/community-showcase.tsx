"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/utils";
import imagePlaceholder from "@/public/image-placeholder.png";
import { HeartIcon } from "./icons/heart-icon";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";

interface Generation {
  id: string;
  prompt: string;
  imageData: string;
  likes: number;
  timestamp: string;
}

export default function CommunityShowcase() {
  const [latestGenerations, setLatestGenerations] = useState<Generation[]>([]);
  const [topGenerations, setTopGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenerations = async () => {
      try {
        // Fetch latest generations
        const latestQuery = query(
          collection(db, "likedImages"),
          orderBy("timestamp", "desc"),
          limit(10)
        );
        
        // Fetch top-rated generations
        const topQuery = query(
          collection(db, "likedImages"),
          orderBy("likes", "desc"),
          limit(10)
        );

        const [latestSnapshot, topSnapshot] = await Promise.all([
          getDocs(latestQuery),
          getDocs(topQuery)
        ]);

        // Process latest generations
        const uniqueLatestImages = new Map();
        latestSnapshot.docs.forEach((doc) => {
          const imageData = doc.data().imageData;
          if (!uniqueLatestImages.has(imageData) || doc.data().timestamp > uniqueLatestImages.get(imageData).timestamp) {
            uniqueLatestImages.set(imageData, {
              id: doc.id,
              prompt: doc.data().prompt,
              imageData: imageData,
              likes: doc.data().likes || 0,
              timestamp: doc.data().timestamp,
            });
          }
        });

        // Process top-rated generations
        const uniqueTopImages = new Map();
        topSnapshot.docs.forEach((doc) => {
          const imageData = doc.data().imageData;
          if (!uniqueTopImages.has(imageData) || doc.data().likes > uniqueTopImages.get(imageData).likes) {
            uniqueTopImages.set(imageData, {
              id: doc.id,
              prompt: doc.data().prompt,
              imageData: imageData,
              likes: doc.data().likes || 0,
              timestamp: doc.data().timestamp,
            });
          }
        });

        setLatestGenerations(Array.from(uniqueLatestImages.values()));
        setTopGenerations(Array.from(uniqueTopImages.values()));
      } catch (error) {
        console.error("Error fetching generations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenerations();
  }, []);

  const GenerationGrid = ({ generations }: { generations: Generation[] }) => (
    <div className="space-y-4 h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
      {generations.length === 0 ? (
        <div className="text-gray-400 text-sm">No generations yet</div>
      ) : (
        generations.map((generation) => (
          <div key={generation.id} className="relative group">
            <Image
              src={`data:image/png;base64,${generation.imageData}`}
              alt={generation.prompt}
              width={200}
              height={200}
              className="rounded-lg w-full h-auto"
              placeholder="blur"
              blurDataURL={imagePlaceholder.blurDataURL}
            />
            <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs text-gray-200 line-clamp-2">{generation.prompt}</p>
              <div className="flex items-center mt-1">
                <HeartIcon className="w-4 h-4 text-pink-500 fill-current" />
                <span className="text-xs text-gray-200 ml-1">{generation.likes}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="w-64 min-w-[250px] h-full bg-gray-900 bg-opacity-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 text-gray-200">Community Showcase</h2>
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-64 min-w-[250px] h-full bg-gray-900 bg-opacity-50 p-4 rounded-lg">
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