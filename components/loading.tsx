"use client";

import { Music } from "lucide-react";

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export const Loading = ({ message = "Loading...", size = "md" }: LoadingProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-primary/20`}>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"></div>
        </div>
        <Music className="absolute inset-0 m-auto h-4 w-4 text-primary animate-pulse" />
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
};

export const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
    <Loading message="Loading Chords Finder..." size="lg" />
  </div>
);

export const CardLoading = () => (
  <div className="p-6">
    <Loading message="Loading content..." size="md" />
  </div>
);
