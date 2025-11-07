'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, RefreshCw, AlertTriangle, Music } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <main className="min-h-screen flex items-center justify-center bg-background">
          <div className="container mx-auto px-4 py-8">
            <Card className="max-w-2xl mx-auto text-center">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <AlertTriangle className="h-16 w-16 text-destructive" />
                </div>
                <CardTitle className="text-4xl font-bold">Critical Error</CardTitle>
                <CardDescription className="text-xl">
                  A critical error occurred that prevented the application from loading properly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">
                    <strong>Error:</strong> {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
                
                <p className="text-muted-foreground">
                  This is a critical error that affects the entire application. 
                  Please try refreshing the page or contact support if the problem persists.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={reset} className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reload Application
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/">
                      <Home className="h-4 w-4 mr-2" />
                      Go Home
                    </Link>
                  </Button>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="font-semibold mb-3">Troubleshooting Steps</h3>
                  <div className="text-left space-y-2 text-sm text-muted-foreground">
                    <p>1. Try refreshing the page</p>
                    <p>2. Clear your browser cache and cookies</p>
                    <p>3. Check your internet connection</p>
                    <p>4. Try using a different browser</p>
                    <p>5. Contact support if the issue persists</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </body>
    </html>
  );
}
