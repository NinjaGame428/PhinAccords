import Footer from "@/components/footer";
import Hero from "@/components/hero";
import { Navbar } from "@/components/navbar";
import SongList from "@/components/song-list";
import TipsSection from "@/components/tips-section";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 xs:pt-20 sm:pt-24">
        <Hero />
        <SongList />
        <TipsSection />
      </main>
      <Footer />
    </>
  );
}
