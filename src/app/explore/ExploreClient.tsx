"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronDown, Search, User, Tag, Camera } from "lucide-react";

const DualRangeSlider = ({ min, max, val1, val2, onChange }: { min: number, max: number, val1: number, val2: number, onChange: (v1: number, v2: number) => void }) => {
  const getPercent = (value: number) => {
    if (max === min) return 0;
    return Math.round(((value - min) / (max - min)) * 100);
  };

  return (
    <div className="relative w-full h-8 flex items-center dual-range">
      <div className="absolute w-full h-1.5 bg-gray-200 rounded-full" />
      <div 
        className="absolute h-1.5 bg-[#2563eb] rounded-full pointer-events-none" 
        style={{ left: `${getPercent(val1)}%`, width: `${getPercent(val2) - getPercent(val1)}%` }}
      />
      <input 
        type="range" min={min} max={max} value={val1} 
        onChange={e => {
          const value = Math.min(Number(e.target.value), val2);
          onChange(value, val2);
        }}
        className="absolute w-full appearance-none bg-transparent pointer-events-none z-20"
      />
      <input 
        type="range" min={min} max={max} value={val2} 
        onChange={e => {
          const value = Math.max(Number(e.target.value), val1);
          onChange(val1, value);
        }}
        className="absolute w-full appearance-none bg-transparent pointer-events-none z-20"
      />
      <style dangerouslySetInnerHTML={{__html: `
        .dual-range input[type=range]::-webkit-slider-thumb {
          pointer-events: auto;
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: white;
          border: 3px solid #2563eb;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .dual-range input[type=range]::-moz-range-thumb {
          pointer-events: auto;
          width: 18px;
          height: 18px;
          background: white;
          border: 3px solid #2563eb;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
      `}} />
    </div>
  );
};

export default function ExploreClient({ initialHoardings, initialCity = "" }: { initialHoardings: any[], initialCity?: string }) {
  const [hoardings, setHoardings] = useState(initialHoardings);
  const [searchQuery, setSearchQuery] = useState(initialCity);
  const [sortBy, setSortBy] = useState("default");
  
  // Filtering state
  const [locationOpen, setLocationOpen] = useState(true);
  const [adOptionsOpen, setAdOptionsOpen] = useState(true);
  const [litOpen, setLitOpen] = useState(true);
  const [sizeOpen, setSizeOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);

  // Pre-process hoardings for pricing consistency (Show face value)
  const processedHoardings = hoardings.map(h => {
    // Show face value (basePricePerMonth) if available, otherwise fallback to pricePerMonth
    const faceValue = h.basePricePerMonth || h.pricePerMonth || 0;
    return { ...h, effectiveMinSpend: faceValue };
  });

  const lowestPrice = processedHoardings.length > 0 ? Math.min(...processedHoardings.map(h => h.effectiveMinSpend)) : 0;
  const highestPrice = processedHoardings.length > 0 ? Math.max(...processedHoardings.map(h => h.effectiveMinSpend)) : 100000;
  const maxAvailableWidth = processedHoardings.length > 0 ? Math.max(...processedHoardings.map(h => h.dimensions?.width || 0)) : 100;
  const maxAvailableHeight = processedHoardings.length > 0 ? Math.max(...processedHoardings.map(h => h.dimensions?.height || 0)) : 100;

  const [minPrice, setMinPrice] = useState<number>(lowestPrice);
  const [maxPrice, setMaxPrice] = useState<number>(highestPrice);
  const [minWidth, setMinWidth] = useState<number>(0);
  const [maxWidth, setMaxWidth] = useState<number>(maxAvailableWidth);
  const [minHeight, setMinHeight] = useState<number>(0);
  const [maxHeight, setMaxHeight] = useState<number>(maxAvailableHeight);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLitTypes, setSelectedLitTypes] = useState<string[]>([]);

  const [appliedFilters, setAppliedFilters] = useState({
    types: [] as string[],
    litTypes: [] as string[],
    minWidth: 0,
    maxWidth: maxAvailableWidth,
    minHeight: 0,
    maxHeight: maxAvailableHeight,
    minPrice: lowestPrice,
    maxPrice: highestPrice,
  });

  const typeOptions = ["Hoarding", "Unipole", "Gantry", "Bus Shelter", "Kiosk", "DOOH", "Other"];
  const litOptions = ["Lit", "Non-Lit", "Front Lit", "Back Lit"];

  const toggleType = (type: string) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };
  
  const toggleLitType = (lit: string) => {
    setSelectedLitTypes(prev => prev.includes(lit) ? prev.filter(l => l !== lit) : [...prev, lit]);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({
      types: selectedTypes,
      litTypes: selectedLitTypes,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
      minPrice,
      maxPrice,
    });
  };

  const normalize = (value: string = "") =>
    value
      .toLowerCase()
      .split(",")[0]
      .replace(/\s+/g, " ")
      .trim();

  const normalizedSearchQuery = normalize(searchQuery);

  const availableCities = Array.from(
    new Set(
      processedHoardings
        .map((h) => h?.location?.city)
        .filter((city): city is string => Boolean(city && city.trim())),
    ),
  ).sort((a, b) => a.localeCompare(b, "en-IN"));

  // Filter hoardings
  const filteredHoardings = processedHoardings.filter((h) => {
    // Location Filter
    if (normalizedSearchQuery) {
      const query = normalizedSearchQuery;
      const city = normalize(h.location?.city || "");
      const state = (h.location?.state || "").toLowerCase();
      const name = (h.name || "").toLowerCase();
      const area = (h.location?.area || "").toLowerCase();
      const address = (h.location?.address || "").toLowerCase();
      const matchesSearch = city.includes(query) || state.includes(query) || name.includes(query) || area.includes(query) || address.includes(query);
      if (!matchesSearch) return false;
    }

    // Type Filter
    if (appliedFilters.types.length > 0) {
      if (!appliedFilters.types.includes(h.type)) return false;
    }

    // Lit Type Filter
    if (appliedFilters.litTypes.length > 0) {
      if (!appliedFilters.litTypes.includes(h.lightingType)) return false;
    }

    // Size Filter
    const w = h.dimensions?.width || 0;
    const hDim = h.dimensions?.height || 0;
    if (w < appliedFilters.minWidth || w > appliedFilters.maxWidth) return false;
    if (hDim < appliedFilters.minHeight || hDim > appliedFilters.maxHeight) return false;

    // Price Filter
    if (h.effectiveMinSpend < appliedFilters.minPrice || h.effectiveMinSpend > appliedFilters.maxPrice) return false;

    return true;
  });

  // Sort hoardings
  const sortedHoardings = [...filteredHoardings].sort((a, b) => {
    if (sortBy === "price-asc") return a.effectiveMinSpend - b.effectiveMinSpend;
    if (sortBy === "price-desc") return b.effectiveMinSpend - a.effectiveMinSpend;
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return 0; // Default/Top Searched (no change)
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#2563eb] transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-[#2563eb] font-medium">Outdoor</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar Filters */}
        <aside className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-32 lg:h-[calc(100vh-160px)]">
          <div className="bg-white border text-gray-800 rounded-3xl p-6 h-full shadow-sm border-gray-100 overflow-y-auto custom-scrollbar">
            <h2 className="text-xl font-bold text-gray-900 mb-6 font-sans">Filters</h2>

            {/* LOCATION Filter */}
            <div className="mb-6 border-b border-gray-100 pb-6">
              <button 
                onClick={() => setLocationOpen(!locationOpen)}
                className="flex items-center justify-between w-full text-left font-bold text-slate-700 uppercase tracking-widest text-xs mb-4"
              >
                LOCATION
                <ChevronDown className={`w-4 h-4 transition-transform ${locationOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {locationOpen && (
                <div className="space-y-3">
                  <div className="relative">
                    <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] text-gray-400 uppercase font-bold tracking-wider">Type to search</span>
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      list="explore-city-suggestions"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="All Cities, Pan India..."
                      className="w-full pl-10 pr-9 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                    />
                    <datalist id="explore-city-suggestions">
                      {availableCities.map((city) => (
                        <option key={city} value={city} />
                      ))}
                    </datalist>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 hover:text-blue-700"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* AD OPTIONS Filter (Type) */}
            <div className="mb-6 border-b border-gray-100 pb-6">
              <button 
                onClick={() => setAdOptionsOpen(!adOptionsOpen)}
                className="flex items-center justify-between w-full text-left font-bold text-slate-700 uppercase tracking-widest text-xs mb-4"
              >
                TYPE
                <ChevronDown className={`w-4 h-4 transition-transform ${adOptionsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {adOptionsOpen && (
                <div className="space-y-3">
                  {typeOptions.map(type => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleType(type)}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedTypes.includes(type) ? 'border-blue-500 bg-blue-500' : 'border-gray-300 group-hover:border-blue-500'}`}>
                        {selectedTypes.includes(type) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className={`text-sm ${selectedTypes.includes(type) ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>{type}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* LIT/NONLIT Filter */}
            <div className="mb-6 border-b border-gray-100 pb-6">
              <button 
                onClick={() => setLitOpen(!litOpen)}
                className="flex items-center justify-between w-full text-left font-bold text-slate-700 uppercase tracking-widest text-xs mb-4"
              >
                LIT / NON-LIT
                <ChevronDown className={`w-4 h-4 transition-transform ${litOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {litOpen && (
                <div className="space-y-3">
                  {litOptions.map(lit => (
                    <label key={lit} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleLitType(lit)}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedLitTypes.includes(lit) ? 'border-blue-500 bg-blue-500' : 'border-gray-300 group-hover:border-blue-500'}`}>
                        {selectedLitTypes.includes(lit) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className={`text-sm ${selectedLitTypes.includes(lit) ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>{lit}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* SIZE Filter */}
            <div className="mb-6 border-b border-gray-100 pb-6">
              <button 
                onClick={() => setSizeOpen(!sizeOpen)}
                className="flex items-center justify-between w-full text-left font-bold text-slate-700 uppercase tracking-widest text-xs mb-4"
              >
                SIZE (WIDTH X HEIGHT)
                <ChevronDown className={`w-4 h-4 transition-transform ${sizeOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {sizeOpen && (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Width (ft)</span>
                      <span className="font-bold text-gray-900">{minWidth} - {maxWidth}</span>
                    </div>
                    <DualRangeSlider 
                      min={0} max={maxAvailableWidth} 
                      val1={minWidth} val2={maxWidth} 
                      onChange={(v1, v2) => { setMinWidth(v1); setMaxWidth(v2); }} 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Height (ft)</span>
                      <span className="font-bold text-gray-900">{minHeight} - {maxHeight}</span>
                    </div>
                    <DualRangeSlider 
                      min={0} max={maxAvailableHeight} 
                      val1={minHeight} val2={maxHeight} 
                      onChange={(v1, v2) => { setMinHeight(v1); setMaxHeight(v2); }} 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* PRICE Filter */}
            <div className="mb-6">
              <button 
                onClick={() => setPriceOpen(!priceOpen)}
                className="flex items-center justify-between w-full text-left font-bold text-slate-700 uppercase tracking-widest text-xs mb-4"
              >
                PRICE
                <ChevronDown className={`w-4 h-4 transition-transform ${priceOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {priceOpen && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
                      <input 
                        type="number" 
                        value={minPrice} 
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setMinPrice(val);
                          if (val > maxPrice) setMaxPrice(val);
                        }} 
                        className="w-full border border-gray-200 rounded-md pl-6 pr-2 py-1.5 text-sm outline-none focus:border-blue-400"
                      />
                    </div>
                    <span className="text-gray-400 text-xs">to</span>
                    <div className="flex-1 relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
                      <input 
                        type="number" 
                        value={maxPrice} 
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setMaxPrice(val);
                          if (val < minPrice) setMinPrice(val);
                        }} 
                        className="w-full border border-gray-200 rounded-md pl-6 pr-2 py-1.5 text-sm outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                  
                  <div className="px-1">
                    <DualRangeSlider 
                      min={lowestPrice} max={highestPrice} 
                      val1={minPrice} val2={maxPrice} 
                      onChange={(v1, v2) => { setMinPrice(v1); setMaxPrice(v2); }} 
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase mt-1">
                    <span>₹{lowestPrice.toLocaleString("en-IN")}</span>
                    <span>₹{highestPrice.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-8 border-t border-gray-100 pt-6">
              <button 
                onClick={handleApplyFilters}
                className="w-full bg-[#2563eb] text-white font-bold text-sm py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-100"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Right Content */}
        <main className="flex-1">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-gray-100">
            <h1 className="text-3xl md:text-5xl font-sans font-black text-slate-900 tracking-tighter antialiased">
              {normalizedSearchQuery ? (
                <span className="capitalize">{searchQuery}</span>
              ) : (
                <>Top <span className="text-[#2563eb]">Cities</span></>

              )}
            </h1>
            
            <div className="flex items-center justify-between sm:justify-end gap-4 w-full md:w-auto mt-4 md:mt-0">
              {/* <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider border-r border-gray-200 hover:bg-gray-100 transition-colors shadow-inner">
                  <List size={14} /> List
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-500 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors">
                  <MapIcon size={14} /> Map
                </button>
              </div> */}

              <div className="relative">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer min-w-[200px]"
                >
                  <option value="default">Sort by : Top Searched</option>
                  <option value="price-asc">Sort by : Price Low to High</option>
                  <option value="price-desc">Sort by : Price High to Low</option>
                  <option value="newest">Sort by : Newest First</option>
                  <option value="oldest">Sort by : Oldest First</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedHoardings.map((hoarding, idx) => {
              const sampleImages = [
                'https://res.cloudinary.com/dpju1wia5/image/upload/v1774848145/v4malipjjxwiovgncshj.png',
                'https://res.cloudinary.com/dpju1wia5/image/upload/v1774848146/rcmhjqgezin7s7hbsiii.png',
              ];
              const placeholderImage = sampleImages[idx % sampleImages.length];

              return (
              <Link href={`/hoardings/${hoarding._id}`} key={hoarding._id}>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer h-full flex flex-col">
                  {/* Image */}
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
                    <Image
                      src={hoarding.images?.[0] || placeholderImage}
                      alt={hoarding.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Image Count Badge */}
                    {hoarding.images && hoarding.images.length > 1 && (
                      <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-xl text-[10px] font-black flex items-center gap-1.5 shadow-lg">
                        <Camera size={12} />
                        {hoarding.images.length}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-[15px] font-bold text-slate-900 mb-2 leading-tight line-clamp-1">
                      {hoarding.name}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                      {hoarding.location.address}, {hoarding.location.city}
                    </p>

                    <div className="mt-auto space-y-2 pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-3 text-slate-600">
                        <Tag className="w-4 h-4 text-[#2563eb]" />
                        <span className="text-sm font-medium">
                          ₹ {hoarding.effectiveMinSpend ? hoarding.effectiveMinSpend.toLocaleString('en-IN') : '23,800'}/month
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <User className="w-4 h-4 text-[#2563eb]" />
                        <span className="text-sm font-medium">
                          {typeof hoarding.uniqueReach === "number" &&
                          hoarding.uniqueReach > 0
                            ? `${hoarding.uniqueReach.toLocaleString("en-IN")} Unique Reach`
                              : "Reach / Week not added yet"}
                        </span>
                      </div>
                      
                    </div>
                  </div>
                </div>
              </Link>
              );
            })}

            {sortedHoardings.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl">
                <p className="font-bold mb-2">No hoardings match your search criteria.</p>
                <p className="text-sm">Try widening your search inputs.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
