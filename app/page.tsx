"use client";

import { MicrophoneIcon } from "@/components/icons/microphone-icon";
import { HeartIcon } from "@/components/icons/heart-icon";
import Logo from "@/components/logo";
import Spinner from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import imagePlaceholder from "@/public/image-placeholder.png";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import Image from "next/image";
import { useEffect, useState } from "react";
import { db } from "@/lib/utils";
import { collection, addDoc, deleteDoc, getDocs, query, where } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "@clerk/nextjs";
import CommunityShowcase from "@/components/community-showcase";
import { useImageCache } from "@/hooks/useImageCache";

type ImageResponse = {
  b64_json: string;
  timings: { inference: number };
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [iterativeMode, setIterativeMode] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<"square" | "portrait" | "landscape">("square");
  const [stylePreset, setStylePreset] = useState<"anime" | "photorealistic" | "oil-painting">("photorealistic");
  const debouncedPrompt = useDebounce(prompt, 300);
  const [generations, setGenerations] = useState<
    { prompt: string; image: ImageResponse }[]
  >([]);
  let [activeIndex, setActiveIndex] = useState<number>();
  const [likedImages, setLikedImages] = useState<Set<number>>(new Set());
  const user = useUser();

  const toggleLike = async (index: number) => {
    if (!user.user) {
      // Handle unauthenticated user case
      toast.error("Please sign in to save images");
      return;
    }

    try {
      const newSet = new Set(likedImages);
      if (newSet.has(index)) {
        newSet.delete(index);
        // Find and remove from Firebase by querying for the specific image
        const q = query(
          collection(db, "likedImages"),
          where("userId", "==", user.user.id),
          where("imageData", "==", generations[index].image.b64_json)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          deleteDoc(doc.ref).catch((err: Error) => console.error(err));
        });
      } else {
        newSet.add(index);
        // Add to Firebase with auto-generated ID
        const imageDoc = {
          userId: user.user.id,
          prompt: generations[index].prompt,
          imageData: generations[index].image.b64_json,
          timestamp: new Date().toISOString(),
        };
        await addDoc(collection(db, "likedImages"), imageDoc);
      }
      setLikedImages(newSet);
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like status");
    }
  };

  const { data: image, isFetching } = useQuery({
    placeholderData: (previousData: ImageResponse | undefined) => previousData,
    queryKey: [debouncedPrompt, refinePrompt],
    queryFn: async () => {
      let finalPrompt = prompt;
      
      if (refinePrompt) {
        const refineResponse = await fetch("/api/refinePrompt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });

        if (!refineResponse.ok) {
          throw new Error(await refineResponse.text());
        }

        const refinedPromptData = await refineResponse.json();
        finalPrompt = refinedPromptData.refinedPrompt;
      }

      let res = await fetch("/api/generateImages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt: finalPrompt, 
          iterativeMode, 
          refinePrompt,
          aspectRatio,
          stylePreset
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      return (await res.json()) as ImageResponse;
    },
    enabled: !!debouncedPrompt.trim(),
    staleTime: Infinity,
    retry: false,
  });

  let isDebouncing = prompt !== debouncedPrompt;

  useEffect(() => {
    if (image && !generations.map((g) => g.image).includes(image)) {
      setGenerations((images) => [...images, { prompt, image }]);
      setActiveIndex(generations.length);
    }
  }, [generations, image, prompt]);

  let activeImage =
    activeIndex !== undefined ? generations[activeIndex].image : undefined;

  const handleVoiceInput = () => {
    setIsListening(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setPrompt((prevPrompt) => prevPrompt + ' ' + transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  const handleClearPrompt = () => {
    setPrompt("");
  };

  return (
    <div className="flex h-full flex-col px-5">
      <ToastContainer />
      <header className="flex justify-center pt-20 md:justify-end md:pt-3">
        <div className="absolute left-1/2 top-6 -translate-x-1/2">
          <a href="https://www.dub.sh/together-ai" target="_blank">
            <Logo />
          </a>
        </div>
      </header>

      <div className="flex justify-between gap-6">
        <CommunityShowcase />
        
        <div className="flex-1 flex flex-col items-center max-w-5xl">
          <form className="mt-[100px] w-full max-w-2xl">
            <fieldset>
              <div className="relative">
                <Textarea
                  rows={4}
                  spellCheck={false}
                  placeholder="Describe your image..."
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full resize-none border-gray-300 border-opacity-50 bg-gray-400 px-4 text-base placeholder-gray-300"
                />
                <div
                  className={`${isFetching || isDebouncing ? "flex" : "hidden"} absolute bottom-3 right-3 items-center justify-center`}
                >
                  <Spinner className="size-4" />
                </div>
                <Button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`absolute right-2 top-2 p-2 ${isListening ? 'bg-red-500' : 'bg-gray-500'} text-white rounded-full hover:bg-opacity-80 transition-colors`}
                  title={isListening ? "Listening..." : "Click to speak"}
                >
                  <MicrophoneIcon className="w-5 h-5" />
                </Button>
              </div>

              <div className="mt-2 flex justify-end">
                <Button
                  type="button"
                  onClick={handleClearPrompt}
                  variant="outline"
                  size="sm"
                  className="text-gray-300 border-gray-300 hover:border-transparent hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600"
                >
                  Clear
                </Button>
              </div>
            </fieldset>
          </form>

          <div className="w-full max-w-3xl mt-8 flex justify-center">
            {!activeImage || !prompt ? (
              <div className="flex items-center justify-center w-full aspect-square bg-gray-900 bg-opacity-50 rounded-lg">
                <p className="text-gray-400 text-sm">Your generated image will appear here</p>
              </div>
            ) : (
              <div className="relative group">
                <Image
                  src={`data:image/png;base64,${activeImage.b64_json}`}
                  alt={prompt}
                  width={768}
                  height={768}
                  className="rounded-lg shadow-lg"
                  placeholder="blur"
                  blurDataURL={imagePlaceholder.blurDataURL}
                />
                <button
                  onClick={() => toggleLike(activeIndex)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <HeartIcon
                    className={`w-5 h-5 ${
                      likedImages.has(activeIndex)
                        ? "text-pink-500 fill-current"
                        : "text-white"
                    }`}
                  />
                </button>
                {generations.length > 1 && (
                  <div className="absolute left-2 right-2 bottom-2 bg-black bg-opacity-50 rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar-horizontal">
                      {generations.map((generation, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveIndex(i)}
                          className={`relative shrink-0 rounded-md overflow-hidden ${
                            activeIndex === i
                              ? "ring-2 ring-purple-500"
                              : "opacity-50 hover:opacity-100"
                          }`}
                        >
                          <Image
                            src={`data:image/png;base64,${generation.image.b64_json}`}
                            alt={generation.prompt}
                            width={48}
                            height={48}
                            className="size-12 object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-64 mt-[100px] space-y-6 bg-gray-900 bg-opacity-50 p-6 rounded-lg h-fit">
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300">
                Aspect Ratio
              </label>
              <Select value={aspectRatio} onValueChange={(value: any) => setAspectRatio(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select aspect ratio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square (1:1)</SelectItem>
                  <SelectItem value="portrait">Portrait (3:4)</SelectItem>
                  <SelectItem value="landscape">Landscape (4:3)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300">
                Style Preset
              </label>
              <Select value={stylePreset} onValueChange={(value: any) => setStylePreset(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photorealistic">Photorealistic</SelectItem>
                  <SelectItem value="anime">Anime</SelectItem>
                  <SelectItem value="oil-painting">Oil Painting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <label
                className="text-sm text-gray-300"
                title="Use earlier images as references"
              >
                Iterative Mode
              </label>
              <Switch
                checked={iterativeMode}
                onCheckedChange={setIterativeMode}
              />
            </div>

            <div className="flex items-center justify-between">
              <label
                className="text-sm text-gray-300"
                title="Refine prompt before generating"
              >
                Refine Prompt
              </label>
              <Switch
                checked={refinePrompt}
                onCheckedChange={setRefinePrompt}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full grow flex-col items-center justify-center pb-8 pt-4 text-center">
        {generations.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {generations.map((generation, i) => (
              <div key={i} className="relative">
                <button
                  onClick={() => setActiveIndex(i)}
                  className={`relative rounded-lg overflow-hidden transition-all ${
                    activeIndex === i
                      ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-black"
                      : "opacity-50 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={`data:image/png;base64,${generation.image.b64_json}`}
                    alt={generation.prompt}
                    width={96}
                    height={96}
                    className="size-24 object-cover"
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(i);
                  }}
                  className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-all"
                >
                  <HeartIcon
                    className={`w-4 h-4 ${
                      likedImages.has(i)
                        ? "text-pink-500 fill-current"
                        : "text-white"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="mt-16 w-full items-center pb-10 text-center text-gray-300 md:mt-4 md:flex md:justify-between md:pb-5 md:text-xs lg:text-sm">
        <p>
          Powered by{" "}
          <a
            href="https://www.dub.sh/together-ai"
            target="_blank"
            className="underline underline-offset-4 transition hover:text-blue-500"
          >
            Together.ai
          </a>{" "}
          &{" "}
          <a
            href="https://dub.sh/together-flux"
            target="_blank"
            className="underline underline-offset-4 transition hover:text-blue-500"
          >
            Flux
          </a>
        </p>

        <div className="mt-8 flex items-center justify-center md:mt-0 md:justify-between">
          <p className="whitespace-nowrap">
            QuickDraw is a fork of{" "}
            <a
              href="https://github.com/Nutlope/blinkshot"
              target="_blank"
              className="underline underline-offset-4 transition hover:text-blue-500"
            >
              blinkshot
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
