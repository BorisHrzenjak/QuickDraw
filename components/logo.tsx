import { ComponentProps } from "react";

export default function Logo(props: ComponentProps<"div">) {
  return (
    <div {...props} className="flex flex-col items-center gap-2">
      <div 
        className="font-bold text-3xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2"
      >
        <svg
          className="w-8 h-8"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21.121 2.879a3 3 0 00-4.242 0l-1.172 1.172 4.242 4.242 1.172-1.172a3 3 0 000-4.242zM14.293 5.465L3 16.757V21h4.242l11.293-11.293-4.242-4.242z"
            stroke="url(#paint0_linear)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient
              id="paint0_linear"
              x1="3"
              y1="2"
              x2="21"
              y2="21"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#9333EA" />
              <stop offset="1" stopColor="#DB2777" />
            </linearGradient>
          </defs>
        </svg>
        QuickDraw
      </div>
      <p className="text-base text-gray-100 text-center max-w-md font-medium">
        Generate stunning images in real-time with just your voice or text. Imagine, speak, create.
      </p>
    </div>
  );
}