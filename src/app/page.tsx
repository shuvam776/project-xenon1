import SearchBar from "@/components/SearchBar";
import "@fontsource/chiron-goround-tc";
import connectDB from "@/lib/dbConnect";
import Hoarding from "@/models/Hoarding";
import Link from "next/link";

export default async function Home() {
  await connectDB();
  const fallbackThumbnail = "/hoarding.jpg";
  
  // Fetch top 6 cities with the most approved hoardings
  const cityAgg = await Hoarding.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: "$location.city", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 }
  ]);

  const colors = ["bg-blue-50", "bg-orange-50", "bg-indigo-50", "bg-emerald-50", "bg-rose-50", "bg-amber-50"];

  let featuredLocations = await Promise.all(
    cityAgg.map(async (item, idx) => {
      const sampleHoarding = await Hoarding.findOne({
        status: "approved",
        "location.city": item._id,
        images: { $exists: true, $ne: [] },
      })
        .sort({ createdAt: -1 })
        .select("images")
        .lean();

      return {
        city: item._id,
        count: item.count,
        color: colors[idx % colors.length],
        thumbnail: sampleHoarding?.images?.[0] || fallbackThumbnail,
      };
    }),
  );

  // Fallback if no hoardings in DB yet
  if (featuredLocations.length === 0) {
    featuredLocations = [
      { city: "Bhubaneswar", count: 0, color: "bg-blue-50", thumbnail: fallbackThumbnail },
      { city: "Mumbai", count: 0, color: "bg-orange-50", thumbnail: fallbackThumbnail },
      { city: "Cuttack", count: 0, color: "bg-indigo-50", thumbnail: fallbackThumbnail },
      { city: "Kolkata", count: 0, color: "bg-emerald-50", thumbnail: fallbackThumbnail },
      { city: "Delhi", count: 0, color: "bg-rose-50", thumbnail: fallbackThumbnail },
      { city: "Bangalore", count: 0, color: "bg-amber-50", thumbnail: fallbackThumbnail },
    ];
  }

  return (
    <div className="min-h-screen bg-gray-50 font-outfit">
      {/* Modern Left-Aligned Hero Section */}
      <section id="home" className="relative z-30 w-full min-h-[70vh] flex flex-col pt-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/background.png')", clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)" }}>
        {/* Subtle Decorative Gradients */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-blue-100/60 rounded-full blur-3xl opacity-70 pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 translate-y-1/4 w-[400px] h-[400px] bg-orange-100/50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

        {/* Artistic Blended Billboard Imagery */}
        {/*body */}
        {/*good*/}
        <div className="max-w-7xl mx-auto w-full pt-6 pb-32 md:pb-40 relative z-20 flex flex-col items-center justify-center">
          
          {/* Main Heading */}
          <div className="text-center w-full space-y-6 mb-12 flex flex-col items-center">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 tracking-tighter leading-[1.15] md:leading-tight antialiased whitespace-normal break-words w-full max-w-[22ch] sm:max-w-none mx-auto text-center">
                Book <span className="relative inline-block text-blue-600 mx-1">
                  hoardings
                  <svg className="absolute w-[110%] h-4 -bottom-2 -left-[5%] text-blue-600 opacity-90" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0 15 Q 50 0 100 15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span> online all across India
              </h1>
            </div>
            
            {/* Subheading */}
            <p className="text-center text-slate-700 font-medium text-lg md:text-xl max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-150">
              An online marketplace for listing and booking hoardings online by connecting hoarding vendors and advertisers in one place
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto relative z-[100] animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Featured Locations Section */}
      <section className="py-8 md:py-12 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center mb-10 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight antialiased mb-4">
              Featured locations
            </h2>
            <div className="w-20 h-1.5 bg-blue-600 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredLocations.map((loc, idx) => (
              <Link 
                href={`/explore?city=${encodeURIComponent(loc.city)}`}
                key={idx}
                className="group relative overflow-hidden rounded-3xl border border-slate-100 hover:border-blue-200 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-2 cursor-pointer block"
              >
                <div className={`h-48 ${loc.color} flex items-center justify-center overflow-hidden relative`}>
                   <img
                     src={loc.thumbnail}
                     alt={`${loc.city} featured hoarding`}
                     className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-slate-900/10 to-transparent"></div>
                   <h3 className="relative text-3xl font-black text-white/80 group-hover:text-white transition-colors uppercase tracking-widest scale-110 whitespace-nowrap px-4 text-center">
                     {loc.city}
                   </h3>
                </div>
                <div className="p-8 bg-white border-t border-slate-50">
                  <h4 className="text-xl font-black text-slate-900 mb-1">{loc.city}</h4>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                    {loc.count > 0 ? `${loc.count} Hoarding${loc.count > 1 ? 's' : ''} Available` : 'Explore Spaces'}
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-widest text-blue-600">View Spaces</span>
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white group-hover:bg-blue-600 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
