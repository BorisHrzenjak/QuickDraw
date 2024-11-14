import { ComponentProps } from "react";

export default function Logo(props: ComponentProps<"div">) {
  return (
    <div 
      className="font-bold text-3xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2"
      {...props}
    >
      <svg
        className="w-8 h-8"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21 7v10c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V7c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5Z"
          stroke="url(#paint0_linear)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 5h6M7 9h10M7 13h10M7 17h6"
          stroke="url(#paint1_linear)"
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
            y2="22"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#9333EA" />
            <stop offset="1" stopColor="#DB2777" />
          </linearGradient>
          <linearGradient
            id="paint1_linear"
            x1="7"
            y1="5"
            x2="17"
            y2="17"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#9333EA" />
            <stop offset="1" stopColor="#DB2777" />
          </linearGradient>
        </defs>
      </svg>
      QuickDraw
    </div>
  );
}