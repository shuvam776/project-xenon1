"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { User, Menu, X, LayoutDashboard, ShoppingCart } from "lucide-react";
import AuthModal from "./AuthModal";
import { checkAuth, logout } from "@/lib/fetchWithAuth";

export default function Navbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isDashboardPage = pathname?.startsWith("/buyer") || pathname?.startsWith("/vendor");
  const isProfilePage = pathname === "/profile";
  const isHomePage = pathname === "/";
  const showGradient = !isHomePage && !isProfilePage;
  useEffect(() => {
    setIsMenuOpen(false);
    setIsDesktopMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Check for authentication via cookie (with auto-refresh)
    const loadUser = async () => {
      const { authenticated, user: userData } = await checkAuth();
      if (authenticated && userData) {
        setUser(userData);
      }
    };
    loadUser();
  }, [isAuthOpen]);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    window.location.reload();
  };



  return (
    <>
      <div className={`${isHomePage ? 'absolute top-0 bg-transparent' : showGradient ? 'relative bg-gradient-to-r from-blue-100 to-indigo-50' : 'relative bg-white'} w-full z-50`}>
        <nav className={`${isHomePage ? 'bg-transparent border-transparent' : showGradient ? 'bg-transparent border-blue-100' : 'bg-white border-slate-100'} text-slate-800 border-b transition-all duration-300`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between gap-4 md:h-20 relative">
              
              {/* Left: Logo */}
              <div className="flex items-center lg:flex-1 shrink-0 h-full">
                <Link href="/" className="flex items-center gap-2 group h-full">
                  <Image
                    src="/companyLogo/Screenshot 2026-03-02 at 02.10.29.png"
                    alt="HoardSpace Logo"
                    width={180}
                    height={50}
                    className="h-10 w-auto object-contain mix-blend-multiply flex-shrink-0"
                    priority
                  />
                </Link>
              </div>

              {/* Center: Global Navigation Links */}
              <div className="hidden lg:flex flex-1 justify-center items-center gap-2 xl:gap-4 font-sans h-full">
                {user ? (
                  <>
                    <Link href="/" className="flex items-center text-xs uppercase tracking-widest font-black text-slate-700 hover:text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-full transition-all whitespace-nowrap">
                      Home
                    </Link>
                    <Link
                      href={`/${user.role}/dashboard`}
                      className="flex items-center text-xs uppercase tracking-widest font-black text-slate-700 hover:text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-full transition-all whitespace-nowrap"
                    >
                      Dashboard
                    </Link>
                    
                    {/* Explore Superbutton */}
                    <div className="relative group h-full flex items-center">
                      <Link href="/explore" className="flex items-center text-xs uppercase tracking-widest font-black text-slate-700 hover:text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-full transition-all whitespace-nowrap">
                        Explore
                      </Link>
                      <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-gray-100 shadow-xl rounded-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left -translate-y-2 group-hover:translate-y-0 z-[60]">
                        <Link href="/buyer/dashboard?tab=wishlist" className="block px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                          Wishlist
                        </Link>
                      </div>
                    </div>

                    {/* More Superbutton */}
                    <div className="relative group h-full flex items-center">
                      <button className="flex items-center text-xs uppercase tracking-widest font-black text-slate-700 hover:text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-full transition-all whitespace-nowrap">
                        More
                      </button>
                      <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-gray-100 shadow-xl rounded-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left -translate-y-2 group-hover:translate-y-0 z-[60]">
                        <Link href="/about" className="block px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                          About Us
                        </Link>
                        <Link href="/#how-it-works" className="block px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                          How It Works
                        </Link>
                        <Link href="/contact" className="block px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                          Contact Us
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/#home" className="flex items-center text-xs uppercase tracking-widest font-black text-slate-700 hover:text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-full transition-all whitespace-nowrap">
                      Home
                    </Link>
                    <Link href="/explore" className="flex items-center text-xs uppercase tracking-widest font-black text-slate-700 hover:text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-full transition-all whitespace-nowrap">
                      Explore
                    </Link>
                    <Link href="/#how-it-works" className="flex items-center text-xs uppercase tracking-widest font-black text-slate-700 hover:text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-full transition-all whitespace-nowrap">
                      How It Works
                    </Link>
                    <Link href="/about" className="flex items-center text-xs uppercase tracking-widest font-black text-slate-700 hover:text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-full transition-all whitespace-nowrap">
                      About Us
                    </Link>
                    <Link href="/contact" className="flex items-center text-xs uppercase tracking-widest font-black text-slate-700 hover:text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-full transition-all whitespace-nowrap">
                      Contact
                    </Link>
                  </>
                )}
              </div>

              {/* Right: CTA Actions & Mobile Toggle */}
              <div className="flex items-center lg:flex-1 justify-end shrink-0 gap-2 h-full">
                {/* Desktop Auth Buttons */}
                <div className="hidden lg:flex items-center gap-2 h-full">
                  {user ? (
                    <div className="flex items-center gap-4 h-full">
                      <button 
                        onClick={handleLogout} 
                        className="flex items-center gap-2 rounded-[2rem] py-2 px-6 bg-slate-800 text-white hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-100 transition-all cursor-pointer duration-300 transform active:scale-95"
                      >
                         <span className="text-[10px] uppercase tracking-[0.2em] font-black">
                          Logout
                        </span>
                      </button>
                      <div className="absolute top-full right-0 w-56 bg-white/90 backdrop-blur-xl border border-slate-100 shadow-2xl rounded-xl py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50">
                        <div className="px-4 pb-3 mb-2 border-b border-slate-50">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Signed in as</p>
                          <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
                        </div>
                        {user.role === "buyer" && (
                          <Link href="/buyer/dashboard?tab=wishlist" className="flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                            <ShoppingCart size={16} className="text-slate-400" /> Wishlist
                          </Link>
                        )}
                        <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <User size={16} className="text-slate-400" /> Profile
                        </Link>
                        <div className="mt-2 pt-2 border-t border-slate-50">
                          <button 
                            onClick={handleLogout} 
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <X size={16} /> Logout
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAuthOpen(true)}
                      className="group flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-5 bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer active:scale-95"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <User size={18} strokeWidth={2.5} />
                      </div>
                      <span className="hidden sm:inline text-xs uppercase tracking-widest font-black text-slate-700">
                        REGISTER
                      </span>
                    </button>
                  )}
                </div>

                {/* Mobile Hamburger Button (Only visible < lg) */}
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="lg:hidden p-2 text-slate-700 hover:text-blue-600 transition-colors"
                >
                  {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Overlay Menu */}
          {isMenuOpen && (
            <div className="lg:hidden bg-white border-t border-slate-100 shadow-2xl animate-in slide-in-from-top duration-300 relative z-[100]">
              <div className="flex flex-col p-4 gap-2">
                <Link 
                  href="/#home" 
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-700 hover:bg-blue-100 rounded-lg transition-all block w-full text-left"
                >
                  Home
                </Link>
                {user ? (
                   <>
                    <Link 
                      href={`/${user.role}/dashboard`}
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-700 hover:bg-blue-100 rounded-lg transition-all block w-full text-left"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/explore" 
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-700 hover:bg-blue-100 rounded-lg transition-all block w-full text-left"
                    >
                      Explore
                    </Link>
                   </>
                ) : (
                  <Link 
                    href="/explore" 
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-700 hover:bg-blue-100 rounded-lg transition-all block w-full text-left"
                  >
                    Explore
                  </Link>
                )}
                
                <Link 
                  href="/#how-it-works" 
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-700 hover:bg-blue-100 rounded-lg transition-all block w-full text-left"
                >
                  How it Works
                </Link>
                <Link 
                  href="/about" 
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-700 hover:bg-blue-100 rounded-lg transition-all block w-full text-left"
                >
                  About Us
                </Link>
                <Link 
                  href="/contact" 
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-700 hover:bg-blue-100 rounded-lg transition-all block w-full text-left"
                >
                  Contact Us
                </Link>

                {/* Mobile Auth Actions (Register/Profile/Logout) */}
                <div className="mt-4 pt-4 border-t border-blue-100 space-y-2">
                  {user ? (
                    <>
                      {user.role === "buyer" && (
                        <Link
                          href="/buyer/dashboard?tab=wishlist"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-4 px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-700 hover:bg-blue-100 rounded-lg transition-all w-full text-left"
                        >
                          <ShoppingCart size={18} className="text-orange-500 shrink-0" />
                          Wishlist
                        </Link>
                      )}
                      <button 
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-4 px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-red-600 hover:bg-red-50 rounded-lg transition-all text-left"
                      >
                         <X size={18} className="shrink-0" />
                         Logout
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsAuthOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-4 px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-[#2563eb] hover:bg-blue-100 rounded-lg transition-all"
                    >
                      <User size={18} />
                      Register / Login
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
