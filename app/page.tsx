import Link from 'next/link';
import { ArrowRight, Zap, Shield, BarChart3, Smartphone, Star, Globe, TrendingUp, CheckCircle2 } from 'lucide-react';
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
      <footer className="max-w-7xl mx-auto px-6 pb-20 mt-20">
        <div className="border-t border-slate-100 pt-20 flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <Smartphone className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 font-inter">Pinnacle Grid</span>
            </div>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Global infrastructure for NFC networking and identity management. Professional tools for the modern era.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16 md:gap-24">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Platform</p>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">Security</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Company</p>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="#" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">&copy; {new Date().getFullYear()} Pinnacle Grid Operations. All status nominal.</p>
          <div className="flex items-center gap-4 text-slate-400">
             <CheckCircle2 size={14} className="text-emerald-500" />
             <span className="text-[10px] font-bold uppercase tracking-widest">Server: NCR-GLOBAL-01</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
