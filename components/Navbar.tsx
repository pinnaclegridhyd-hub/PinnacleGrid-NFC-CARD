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
      isScrolled ? "bg-white/80 backdrop-blur-lg border-b border-slate-200 py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
            <Smartphone className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900">ReviewBoost</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Features</Link>
          <Link href="/#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">How it Works</Link>
          <Link href="/#pricing" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Pricing</Link>
          <div className="h-6 w-px bg-slate-200 mx-2" />
          <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Log In</Link>
          <Link href="/signup" className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-200 active:scale-95 text-sm">
            Get Started
          </Link>
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
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-6 flex flex-col gap-6 md:hidden animate-in slide-in-from-top-4 duration-300">
          <Link href="/#features" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-semibold text-slate-900">Features</Link>
          <Link href="/#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-semibold text-slate-900">How it Works</Link>
          <Link href="/#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-semibold text-slate-900">Pricing</Link>
          <hr />
          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-semibold text-slate-900">Log In</Link>
          <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl text-center">
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
