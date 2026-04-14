import HeroSlider from "@/components/sections/HeroSlider";
import QuickLinks from "@/components/sections/QuickLinks";
import Banner from "@/components/sections/Banner";
import MediaGrid from "@/components/sections/MediaGrid";
import WorshipInfo from "@/components/sections/WorshipInfo";
import Departments from "@/components/sections/Departments";
import Staff from "@/components/sections/Staff";
import CommunityCTA from "@/components/sections/CommunityCTA";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main>
      <HeroSlider />
      <QuickLinks />
      <Banner />
      <MediaGrid />
      <WorshipInfo />
      <Departments />
      <Staff />
      <CommunityCTA />
      <Footer />
    </main>
  );
}
