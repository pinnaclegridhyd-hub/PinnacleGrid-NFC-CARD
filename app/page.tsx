import Link from 'next/link';
import { ArrowRight, Zap, Shield, BarChart3, Smartphone, Star, Globe, TrendingUp, CheckCircle2, MapPin, Mail, Phone, MessageCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-primary rounded-full text-xs font-bold mb-8 uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5 fill-primary" />
              <span>NFC Networking Infrastructure</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-8 font-inter">
              Seamless Digital <br />
              <span className="text-primary italic">Interactions.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-500 max-w-2xl mb-12 font-medium leading-relaxed px-4">
               Pinnacle Grid provides enterprise-grade NFC hardware and software solutions to digitize professional presence. Simple, secure, and infinitely scalable.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 w-full sm:w-auto px-6 sm:px-0">
              <Link href="/signup" className="bg-primary text-white px-8 py-3.5 rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                Provision Hardware
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/login" className="bg-white text-slate-700 border border-slate-200 px-8 py-3.5 rounded-lg font-bold hover:bg-slate-50 transition-all flex items-center justify-center">
                System Console
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Global Requests', value: '1M+' },
            { label: 'Provisioned Hardware', value: '50k+' },
            { label: 'Latency', value: '<50ms' },
            { label: 'System Uptime', value: '99.99%' },
          ].map((stat, i) => (
            <div key={i} className="text-center md:text-left">
              <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">Enterprise Capabilities</h2>
          <p className="text-base text-slate-500 font-medium max-w-2xl">A robust platform engineered for professional NFC fleet management and analytics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { 
              title: 'Fast Provisioning', 
              desc: 'Deploy new NFC assets in under 30 seconds with our optimized onboarding flow.', 
              icon: Zap
            },
            { 
              title: 'Dynamic Routing', 
              desc: 'Reconfigure target destinations globally from your central command console.', 
              icon: Globe
            },
            { 
              title: 'Precision Metrics', 
              desc: 'Monitor real-time engagement data with high-granularity interaction logging.', 
              icon: BarChart3
            },
            { 
              title: 'Secure Validation', 
              desc: 'Cryptographically secured identity matching prevents spoofing and unauthorized access.', 
              icon: Shield
            },
            { 
              title: 'Professional Hub', 
              desc: 'Unified interface for managing thousands of cards with role-based access control.', 
              icon: Star
            },
            { 
              title: 'System Stability', 
              desc: 'Distributed edge infrastructure ensures zero-downtime for your global hardware fleet.', 
              icon: TrendingUp
            },
          ].map((feature, i) => (
            <div key={i} className="group">
              <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                <feature.icon className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 pb-12 mt-28 border-t border-slate-100 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Logo & Description */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <img src="/PINNACLE_GRID_LOGO.png" alt="Pinnacle Grid Logo" className="h-9 w-auto object-contain" />
              <span className="text-xl font-bold tracking-tight text-slate-900 font-inter">Pinnacle Grid</span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed max-w-sm">
              Global infrastructure for enterprise NFC networking, dynamic hardware activation, and real-time interaction logs. Professional tools for the modern connected enterprise.
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Platform Links</p>
              <ul className="space-y-2.5">
                <li><a href="https://www.pinnaclegrid.com/" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors">Home Page</a></li>
                <li><a href="https://www.pinnaclegrid.com/services" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors">Our Services</a></li>
                <li><a href="https://www.pinnaclegrid.com/about" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors">About Us</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Access Portals</p>
              <ul className="space-y-2.5">
                <li><Link href="/login" className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors">Console Login</Link></li>
                <li><Link href="/signup" className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors">New Registration</Link></li>
                <li><a href="https://www.pinnaclegrid.com/contact" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors">Get Support</a></li>
              </ul>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="lg:col-span-4 bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Contact</p>
            
            <div className="space-y-4">
              {/* Location */}
              <div className="flex gap-3">
                <MapPin className="text-primary w-4.5 h-4.5 shrink-0 mt-0.5" />
                <div className="text-xs font-medium text-slate-600 leading-relaxed">
                  <span className="block font-bold text-slate-900 mb-0.5">Our Location</span>
                  8-3-945/A/11/101, Nagarjuna Nagar Colony,<br />
                  Khairatabad, Hyderabad, 500073
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <Mail className="text-primary w-4.5 h-4.5 shrink-0" />
                <div className="text-xs font-medium text-slate-600">
                  <span className="block font-bold text-slate-900 mb-0.5">Email Us</span>
                  <a href="mailto:info@pinnaclegrid.com" className="hover:underline hover:text-primary">info@pinnaclegrid.com</a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <Phone className="text-primary w-4.5 h-4.5 shrink-0" />
                <div className="text-xs font-medium text-slate-600">
                  <span className="block font-bold text-slate-900 mb-0.5">Call Us</span>
                  <a href="tel:+919100305750" className="hover:underline hover:text-primary">+91 9100305750</a>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a 
              href="https://wa.me/919100305750" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366] text-white text-xs font-bold rounded-xl hover:shadow-lg transition-all hover:bg-[#20ba59]"
            >
              <MessageCircle size={14} className="fill-white" />
              WhatsApp Now
            </a>
          </div>
        </div>

        {/* Lower Footer */}
        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">&copy; {new Date().getFullYear()} Pinnacle Grid Operations. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
             <CheckCircle2 size={13} className="text-emerald-500" />
             <span className="text-[9px] font-bold uppercase tracking-widest">Server Status: Nominal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
