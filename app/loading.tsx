import { Music, Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <Music className="h-12 w-12 text-primary animate-pulse" />
        </div>
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground">Loading your music...</p>
      </div>
    </div>
  );
}
