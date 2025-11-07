import type { Metadata } from "next";
import "./globals.scss";
import { Providers } from "@/redux/provider";
import { AppProviders } from "@/providers/app-providers";


export const metadata: Metadata = {
  title: "PhinAccords - Gospel Music Chords & Worship Resources",
  description: "Learn to play and worship with your piano. Discover gospel songs, chord charts, and worship resources.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppProviders>{children}</AppProviders>
        </Providers>
      </body>
    </html>
  );
}
