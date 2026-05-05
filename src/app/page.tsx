import SearchBar from "@/components/SearchBar";
import "@fontsource/chiron-goround-tc";

export default function Home() {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Left-Aligned Hero Section */}
      <section id="home" className="relative w-full min-h-[70vh] flex flex-col pt-16 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat overflow-hidden" style={{ backgroundImage: "url('/background.png')", clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)" }}>
        {/* Subtle Decorative Gradients */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-blue-100/60 rounded-full blur-3xl opacity-70 pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 translate-y-1/4 w-[400px] h-[400px] bg-orange-100/50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

        {/* Artistic Blended Billboard Imagery */}
        
        

        <div className="max-w-7xl mx-auto w-full pt-4 pb-32 md:pb-40 relative z-20 flex flex-col items-center justify-center">
          
          {/* Main Heading */}
          <div className="text-center w-full space-y-6 mb-12 flex flex-col items-center">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-sans font-black text-slate-900 tracking-tight leading-tight antialiased whitespace-nowrap w-full text-center">
                Find the <span className="relative inline-block italic text-blue-600 mx-2 font-black">
                  Perfect
                  <svg className="absolute w-[110%] h-4 -bottom-2 -left-[5%] text-blue-400 opacity-80" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0 15 Q 50 0 100 15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span> Hoarding Space
              </h1>
            </div>
            
            {/* Subheading */}
            <p className="text-center text-slate-700 font-medium text-lg md:text-xl max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-150">
              Discover premium hoarding spaces in prime locations to maximize your brand's visibility and impact.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Featured Locations Section */}
      <section className="py-8 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center mb-10 text-center">
            <h2 className="text-4xl md:text-5xl font-sans font-black text-slate-900 tracking-tight leading-tight antialiased mb-4">
              Featured locations
            </h2>
            <div className="w-20 h-1.5 bg-blue-600 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { city: "Bhubaneswar", visits: "2.4k+ Monthly Views", color: "bg-blue-50" },
              { city: "Mumbai", visits: "5.1k+ Monthly Views", color: "bg-orange-50" },
              { city: "Cuttack", visits: "1.2k+ Monthly Views", color: "bg-indigo-50" },
              { city: "Kolkata", visits: "3.8k+ Monthly Views", color: "bg-emerald-50" },
              { city: "Delhi", visits: "4.5k+ Monthly Views", color: "bg-rose-50" },
              { city: "Bangalore", visits: "3.2k+ Monthly Views", color: "bg-amber-50" },
            ].map((loc, idx) => (
              <div 
                key={idx}
                className="group relative overflow-hidden rounded-3xl border border-slate-100 hover:border-blue-200 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-2 cursor-pointer"
              >
                <div className={`h-48 ${loc.color} flex items-center justify-center overflow-hidden relative`}>
                   <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <h3 className="text-3xl font-black text-slate-900/10 group-hover:text-slate-900/20 transition-colors uppercase tracking-widest scale-150">
                     {loc.city}
                   </h3>
                </div>
                <div className="p-8 bg-white border-t border-slate-50">
                  <h4 className="text-xl font-black text-slate-900 mb-1">{loc.city}</h4>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                    {loc.visits}
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-widest text-blue-600">View Spaces</span>
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white group-hover:bg-blue-600 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
