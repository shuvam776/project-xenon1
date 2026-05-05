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

  // Close menus when path changes
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

  const isHomePage = pathname === "/";

  return (
    <>
      <div className={`${isHomePage ? 'absolute top-0 bg-transparent' : 'relative bg-white'} w-full z-50`}>
        <nav className={`${isHomePage ? 'bg-transparent border-transparent' : 'bg-white border-slate-100'} text-slate-800 border-b transition-all duration-300`}>
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
              <div className="hidden lg:flex justify-center items-center gap-6 xl:gap-8 font-sans h-full">
                <Link href="/#home" className="flex items-center text-xs uppercase tracking-widest font-black text-slate-700 hover:text-blue-600 transition-colors whitespace-nowrap h-full group">
                  <span className="relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-blue-800 after:scale-x-0 group-hover:after:scale-x-100 after:origin-center after:transition-transform after:duration-300">Home</span>
                </Link>
                {user && (
                  <Link
                    href={`/${user.role}/dashboard`}
                    className="flex items-center text-xs uppercase tracking-widest font-black text-slate-700 hover:text-blue-600 transition-colors whitespace-nowrap h-full group"
                  >
                    <span className="relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-blue-800 after:scale-x-0 group-hover:after:scale-x-100 after:origin-center after:transition-transform after:duration-300">Dashboard</span>
                  </Link>
                )}
                <Link href="/explore" className="flex items-center text-xs uppercase tracking-widest font-black text-slate-700 hover:text-blue-600 transition-colors whitespace-nowrap h-full group">
                  <span className="relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-blue-800 after:scale-x-0 group-hover:after:scale-x-100 after:origin-center after:transition-transform after:duration-300">Explore</span>
                </Link>

                {/* About Us Dropdown */}
                <div className="relative group h-full flex items-center">
                  <button className="flex items-center gap-1 text-xs uppercase tracking-widest font-black text-slate-700 hover:text-blue-600 transition-colors whitespace-nowrap h-full cursor-pointer">
                    <span className="relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-blue-800 after:scale-x-0 group-hover:after:scale-x-100 after:origin-center after:transition-transform after:duration-300">About Us</span>
                  </button>
                  <div className="absolute top-full left-0 w-48 bg-white/90 backdrop-blur-xl border border-slate-100 shadow-2xl rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50">
                    <Link href="/about" className="block px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      About Us
                    </Link>
                    <Link href="/contact" className="block px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      Contact
                    </Link>
                    <Link href="/how-it-works" className="block px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      How It Works
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right: CTA Actions & Mobile Toggle */}
              <div className="flex items-center lg:flex-1 justify-end shrink-0 gap-2 h-full">
                {/* Desktop Auth Buttons */}
                <div className="hidden lg:flex items-center gap-2 h-full">
                  {user ? (
                    <div className="relative group h-full flex items-center">
                      <button className="p-2.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer">
                        <Menu size={24} />
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
                      <span className="hidden sm:inline text-xs uppercase tracking-[0.2em] font-black text-slate-700 group-hover:text-blue-600 transition-colors">
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
                <Link 
                  href="/explore" 
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-700 hover:bg-blue-100 rounded-lg transition-all block w-full text-left"
                >
                  Explore
                </Link>
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
                      <Link
                        href={`/${user.role}/dashboard`}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-4 px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-700 hover:bg-blue-100 rounded-lg transition-all w-full text-left"
                      >
                        <LayoutDashboard size={18} className="text-blue-500 shrink-0" />
                        Dashboard
                      </Link>
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
                      {!isDashboardPage && (
                        <Link
                          href="/profile"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-4 px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-700 hover:bg-blue-100 rounded-lg transition-all w-full text-left"
                        >
                          <User size={18} className="text-blue-500 shrink-0" />
                          Profile
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
