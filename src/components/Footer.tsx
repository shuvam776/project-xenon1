"use client";

import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Linkedin, Youtube, Instagram } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  
  if (pathname?.includes("/dashboard") || pathname?.startsWith("/profile")) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  const categories = [
    { name: "Billboard", href: "/search?type=Billboard" },
    { name: "Unipole", href: "/search?type=Unipole" },
    { name: "Gantry", href: "/search?type=Gantry" },
    { name: "Bus Shelter", href: "/search?type=Bus%20Shelter" },
    { name: "Kiosk", href: "/search?type=Kiosk" },
  ];

  const popularCities = [
    { name: "Bhubaneswar", href: "/explore?city=Bhubaneswar" },
    { name: "Cuttack", href: "/explore?city=Cuttack" },
    { name: "Rourkela", href: "/explore?city=Rourkela" },
  ];

  const legal = [
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Refund Policy", href: "/refund-policy" },
    { name: "Cookie Policy", href: "/cookie-policy" },
  ];

  const sponsors = [
    { name: "MeitY", src: "/logos/IMG_2179.PNG", link: "https://msh.meity.gov.in/" },
    { name: "MSME", src: "/logos/IMG_2180.JPG", link: "https://msme.gov.in/" },
    { name: "NIT Rourkela", src: "/logos/IMG_2181.PNG", link: "https://www.nitrkl.ac.in/" },
    { name: "FTBI", src: "/logos/IMG_2182.PNG", link: "https://www.ftbi-nitrkl.org/" },
    { name: "Startup Odisha", src: "/logos/IMG_2183.PNG", link: "https://startupodisha.gov.in/" },
    { name: "Startup India", src: "/logos/IMG_2184.JPG", link: "https://www.startupindia.gov.in/" },
  ];

  return (
    <footer className="bg-white border-t border-slate-100 w-full overflow-hidden">
        
      {/* Sponsors Carousel Section */}
      <div className="border-b border-slate-100 bg-slate-50/50 py-8 overflow-hidden relative w-full">
        <div className="flex w-[200%] animate-marquee">
          {/* Double the array for seamless scrolling */}
          {[...sponsors, ...sponsors].map((sponsor, idx) => (
            <a
              key={idx}
              href={sponsor.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-1/12 flex-shrink-0 flex items-center justify-center px-4 md:px-8 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
            >
              <Image
                src={sponsor.src}
                alt={sponsor.name}
                width={160}
                height={80}
                className="object-contain max-h-16 w-auto mix-blend-multiply"
              />
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Left Column: Logo & Info */}
          <div className="md:col-span-12 lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block">
              <Image
                src="/companyLogo/Screenshot 2026-03-02 at 02.10.29.png"
                alt="HoardSpace Logo"
                width={180}
                height={50}
                className="h-10 w-auto object-contain"
              />
            </Link>
            
            <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-sm">
              India's leading platform for booking premium outdoor advertising spaces. Connect with verified vendors and grow your brand's visibility.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4 pt-2">
              <a href="https://x.com/hoardspace1" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.486 3.24H4.298l13.31 17.41z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/hoardspace-bookings-private-limited" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                <Linkedin size={20} className="fill-current" />
              </a>
              <a href="https://www.instagram.com/hoardspace/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-600 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://www.youtube.com/@HoardSpace" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-600 transition-colors">
                <Youtube size={22} className="fill-current" />
              </a>
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white shadow-sm mt-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold text-slate-600 tracking-wide">All systems operational</span>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-12 lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
            
            {/* Column 1 */}
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-6">Categories</h3>
              <ul className="space-y-4">
                {categories.map((category) => (
                  <li key={category.name}>
                    <Link href={category.href} className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-6">Explore</h3>
              <ul className="space-y-4">
                {popularCities.map((city) => (
                  <li key={city.name}>
                    <Link href={city.href} className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                      {city.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/explore" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1">
                    All Cities <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded ml-1">New</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-6">Company</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/about" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">About Us</Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Contact</Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">How it works</Link>
                </li>
              </ul>

              <h3 className="text-sm font-black text-slate-900 mb-6 mt-8">Contact Info</h3>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:bookings@hoardspace.in" className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                    <Mail size={14} /> bookings@hoardspace.in
                  </a>
                </li>
                <li>
                  <a href="tel:+917655052057" className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                    <Phone size={14} /> 7655-052057
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Registration Details */}
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-6">Registration</h3>
              <div className="space-y-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                <p>CIN: U63120OD2025PTC051640</p>
                <p>PAN: AAICH3418E</p>
                <p>TAN: BBNH01998D</p>
                <p>CKYC: 90003349208072</p>
                <p>GSTIN: 21AAICH3418E1Z3</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium text-slate-500">
            &copy; {currentYear} Hoardspace Bookings Private Limited.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {legal.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}
