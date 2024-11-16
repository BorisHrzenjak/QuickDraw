"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/utils";
import imagePlaceholder from "@/public/image-placeholder.png";
import { HeartIcon } from "./icons/heart-icon";

interface TopGeneration {
  id: string;
  prompt: string;
  imageData: string;
  likes: number;
  timestamp: string;
}

export default function CommunityShowcase() {
  const [topGenerations, setTopGenerations] = useState<TopGeneration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopGenerations = async () => {
      try {
        const q = query(
          collection(db, "likedImages"),
          orderBy("timestamp", "desc"),
          limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        // Create a Map to store unique images by their content
        const uniqueImages = new Map();
        
        querySnapshot.docs.forEach((doc) => {
          const imageData = doc.data().imageData;
          // Only keep the most recent instance of each unique image
          if (!uniqueImages.has(imageData) || doc.data().timestamp > uniqueImages.get(imageData).timestamp) {
            uniqueImages.set(imageData, {
              id: doc.id,
              prompt: doc.data().prompt,
              imageData: imageData,
              likes: 1,
              timestamp: doc.data().timestamp,
            });
          }
        });
        
        const generations = Array.from(uniqueImages.values());
        setTopGenerations(generations);
      } catch (error) {
        console.error("Error fetching top generations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopGenerations();
  }, []);

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
      <div className="space-y-4 h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
        {topGenerations.length === 0 ? (
          <div className="text-gray-400 text-sm">No generations yet</div>
        ) : (
          topGenerations.map((generation) => (
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
    </div>
  )
}