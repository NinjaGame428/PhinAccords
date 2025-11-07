"use client";

import { cn } from "@/lib/utils";

export const Logo = ({ className, ...props }: React.ComponentProps<"img">) => {
  return (
    <img
      src="/android-chrome-192x192.png"
      alt="PhinAccords Logo"
      className={cn("h-7 w-7", className)}
      {...props}
    />
  );
};
