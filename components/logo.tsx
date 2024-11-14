import { ComponentProps } from "react";

export default function Logo(props: ComponentProps<"div">) {
  return (
    <div 
      className="font-bold text-2xl tracking-tight"
      {...props}
    >
      QuickDraw
    </div>
  );
}