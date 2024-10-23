"use client";

import GithubIcon from "@/components/icons/github-icon";
import XIcon from "@/components/icons/x-icon";
import { MicrophoneIcon } from "@/components/icons/microphone-icon";
import { HeartIcon } from "@/components/icons/heart-icon";
import Logo from "@/components/logo";
import Spinner from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import imagePlaceholder from "@/public/image-placeholder.png";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import Image from "next/image";
import { useEffect, useState } from "react";
import { SignInButton } from "@clerk/nextjs";

type ImageResponse = {
  b64_json: string;
  timings: { inference: number };
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [iterativeMode, setIterativeMode] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const debouncedPrompt = useDebounce(prompt, 300);
  const [generations, setGenerations] = useState<
    { prompt: string; image: ImageResponse }[]
  >([]);
  let [activeIndex, setActiveIndex] = useState<number>();
  const [likedImages, setLikedImages] = useState<Set<number>>(new Set());

  const toggleLike = (index: number) => {
    setLikedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const { data: image, isFetching } = useQuery({
    placeholderData: (previousData) => previousData,
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
        body: JSON.stringify({ prompt: finalPrompt, iterativeMode, refinePrompt }),
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
      <header className="flex justify-center pt-20 md:justify-end md:pt-3">
        <div className="absolute left-1/2 top-6 -translate-x-1/2">
          <a href="https://www.dub.sh/together-ai" target="_blank">
            <Logo />
          </a>
        </div>
      </header>

      <div className="flex justify-center">
        <form className="mt-[100px] w-full max-w-lg">
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
                className="text-gray-300 border-gray-300 hover:bg-gray-700"
              >
                Clear
              </Button>
            </div>

            <div className="mt-3 text-sm md:text-right">
              <label
                title="Use earlier images as references"
                className="inline-flex items-center gap-2"
              >
                Consistency mode
                <Switch
                  checked={iterativeMode}
                  onCheckedChange={setIterativeMode}
                />
              </label>
            </div>
            <div className="mt-2 text-sm md:text-right">
              <label
                title="Refine the prompt before sending to Flux model"
                className="inline-flex items-center gap-2"
              >
                Refine prompt
                <Switch
                  checked={refinePrompt}
                  onCheckedChange={setRefinePrompt}
                />
              </label>
            </div>
          </fieldset>
        </form>
      </div>

      <div className="flex w-full grow flex-col items-center justify-center pb-8 pt-4 text-center">
        {!activeImage || !prompt ? (
          <div className="max-w-xl md:max-w-4xl lg:max-w-3xl">
            <p className="text-xl font-semibold text-gray-200 md:text-3xl lg:text-4xl">
              Generate images in real-time
            </p>
            <p className="mt-4 text-balance text-sm text-gray-300 md:text-base lg:text-lg">
              Enter a prompt or use your voice to generate images in milliseconds.  
              Powered by Flux on Together AI.
            </p>
          </div>
        ) : (
          <div className="mt-4 flex w-full max-w-4xl flex-col justify-center">
            <div>
              <Image
                placeholder="blur"
                blurDataURL={imagePlaceholder.blurDataURL}
                width={1024}
                height={768}
                src={`data:image/png;base64,${activeImage.b64_json}`}
                alt=""
                className={`${isFetching ? "animate-pulse" : ""} max-w-full rounded-lg object-cover shadow-sm shadow-black`}
              />
            </div>

            <div className="mt-4 flex gap-4 overflow-x-scroll pb-4">
              {generations.map((generatedImage, i) => (
                <div key={i} className="relative w-32 shrink-0">
                  <button
                    className="w-full opacity-50 hover:opacity-100"
                    onClick={() => setActiveIndex(i)}
                  >
                    <Image
                      placeholder="blur"
                      blurDataURL={imagePlaceholder.blurDataURL}
                      width={1024}
                      height={768}
                      src={`data:image/png;base64,${generatedImage.image.b64_json}`}
                      alt=""
                      className="max-w-full rounded-lg object-cover shadow-sm shadow-black"
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(i);
                    }}
                    className="absolute bottom-2 right-2 p-1 bg-white bg-opacity-50 rounded-full"
                  >
                    <HeartIcon
                      className={`w-4 h-4 ${
                        likedImages.has(i) ? "text-red-500" : "text-gray-500"
                      }`}
                      fill={likedImages.has(i) ? "currentColor" : "none"}
                    />
                  </button>
                </div>
              ))}
            </div>
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

        <div className="mt-8 flex items-center justify-center md:mt-0 md:justify-between md:gap-6">
          <p className="hidden whitespace-nowrap md:block">
            100% free and{" "}
            <a
              href="https://github.com/Nutlope/blinkshot"
              target="_blank"
              className="underline underline-offset-4 transition hover:text-blue-500"
            >
              open source
            </a>
          </p>

          <div className="flex gap-6 md:gap-2">
            <a href="https://github.com/Nutlope/blinkshot" target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="inline-flex items-center gap-2"
              >
                <GithubIcon className="size-4" />
                GitHub
              </Button>
            </a>
            <a href="https://x.com/nutlope" target="_blank">
              <Button
                size="sm"
                variant="outline"
                className="inline-flex items-center gap-2"
              >
                <XIcon className="size-3" />
                Twitter
              </Button>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
