'use client';

import Link from 'next/link';
import { Smartphone, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
      isScrolled ? "bg-white/90 backdrop-blur-md border-b border-slate-200 py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img src="/PINNACLE_GRID_LOGO.png" alt="Pinnacle Grid Logo" className="h-8 w-auto object-contain" />
          <span className="text-xl font-bold tracking-tight text-slate-900 font-inter">Pinnacle Grid</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="https://www.pinnaclegrid.com/services" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-slate-500 hover:text-primary uppercase tracking-widest transition-colors">Solutions</a>
          <a href="https://www.pinnaclegrid.com/about" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-slate-500 hover:text-primary uppercase tracking-widest transition-colors">About Us</a>
          <div className="h-4 w-px bg-slate-200 mx-2" />
          <Link href="/login" className="text-xs font-bold text-slate-500 hover:text-primary uppercase tracking-widest transition-colors">Sign In</Link>
          <a href="https://www.pinnaclegrid.com/contact" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-primary text-white font-bold rounded-lg hover:shadow-lg transition-all text-sm">
            Contact Sales
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-slate-900"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-8 flex flex-col gap-6 md:hidden animate-in slide-in-from-top-2 duration-200">
          <a href="https://www.pinnaclegrid.com/services" target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-900">Solutions</a>
          <a href="https://www.pinnaclegrid.com/about" target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-900">About Us</a>
          <hr />
          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-900">Sign In</Link>
          <a href="https://www.pinnaclegrid.com/contact" target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-4 bg-primary text-white font-bold rounded-xl text-center">
            Contact Sales
          </a>
        </div>
      )}
    </nav>
  );
}

