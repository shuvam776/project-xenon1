import SearchBar from "@/components/SearchBar";
import HowItWorks from "@/components/HowItWorks";
import FeaturedLocations from "@/components/FeaturedLocations";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Left-Aligned Hero Section */}
      <section id="home" className="relative w-full min-h-[65vh] flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-orange-50 overflow-hidden">
        {/* Subtle Decorative Gradients */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-blue-100/60 rounded-full blur-3xl opacity-70 pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 translate-y-1/4 w-[400px] h-[400px] bg-orange-100/50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

        {/* Artistic Blended Billboard Imagery */}
        {/*body */}
        
        <div className="max-w-7xl mx-auto w-full relative z-20 flex flex-col items-center justify-center space-y-8">
          
          <div className="max-w-4xl text-center flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-black text-[#0f172a] tracking-tight leading-[1.05] antialiased">
              Find the <span className="italic underline underline-offset-8 decoration-blue-950">Perfect</span> <br /> Hoarding Space
            </h1>
          </div>

          <div className="w-full max-w-4xl mx-auto px-4 sm:px-0 pointer-events-auto mt-2">
            <SearchBar />
          </div>

        </div>
      </section>

      <FeaturedLocations />

      <HowItWorks />

    </div>
  );
}
