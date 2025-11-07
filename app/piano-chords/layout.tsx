import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Piano Chords - PhinAccords",
  description: "Maîtrisez chaque accord de piano avec des diagrammes interactifs, positions des notes et guides audio. Parfait pour les pianistes de tous niveaux.",
};

export default function PianoChordsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

