import Link from 'next/link';
import { ArrowRight, Zap, Shield, BarChart3, Smartphone, Star, Globe, TrendingUp, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-indigo-50 rounded-full blur-3xl opacity-60 animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-60 animate-pulse-slow" />

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-indigo-600 rounded-full text-sm font-bold mb-8 shadow-sm">
              <Zap className="w-4 h-4 fill-indigo-600" />
              <span>Next-Gen Reputation Management</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-[5.5rem] font-black text-slate-900 tracking-tight leading-[1.05] mb-8">
              Transform Taps into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500">5-Star Reviews.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mb-12 font-medium leading-relaxed px-4">
              The professional NFC review engine for local businesses. Activate cards in seconds, track performance in real-time, and dominate your local market.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto px-6 sm:px-0">
              <Link href="/signup" className="btn-primary w-full sm:w-auto px-10 py-5 text-lg shadow-2xl shadow-indigo-200 justify-center">
                Start Growing Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 border border-slate-200 text-lg font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center">
                View Live Demo
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-16 flex flex-col items-center gap-4">
              <div className="flex -space-x-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200" />
                ))}
              </div>
              <p className="text-sm font-bold text-slate-600">Trusted by 500+ local businesses in Delhi NCR</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white/50 border-y border-slate-100 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-4">
          {[
            { label: 'Total Taps', value: '1M+' },
            { label: 'Active Cards', value: '50k+' },
            { label: 'Average Growth', value: '3.5x' },
            { label: 'Uptime', value: '99.9%' },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4">
              <div className="text-4xl font-black text-slate-900 mb-1">{stat.value}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 md:py-32 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">Built for Scale and Speed</h2>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">Everything you need to manage a fleet of NFC review cards from a single professional dashboard.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              title: 'Instant Activation', 
              desc: 'Our mobile-first activation flow takes under 30 seconds. No apps, no complex setup.', 
              icon: Zap, 
              color: 'bg-amber-500' 
            },
            { 
              title: 'Dynamic Routing', 
              desc: 'Change your review link anytime globally. Perfect for moving locations or seasonal campaigns.', 
              icon: Globe, 
              color: 'bg-indigo-600' 
            },
            { 
              title: 'Deep Analytics', 
              desc: 'See exactly when and where your cards are being tapped with our advanced tracking engine.', 
              icon: BarChart3, 
              color: 'bg-sky-500' 
            },
            { 
              title: 'Card Security', 
              desc: 'Only authorized cards can be activated. Prevent unauthorized URL hijacking with our secure ID system.', 
              icon: Shield, 
              color: 'bg-green-500' 
            },
            { 
              title: 'Review Boost', 
              desc: 'Direct integration with Google Review links to maximize conversion from physical tap to digital star.', 
              icon: Star, 
              color: 'bg-rose-500' 
            },
            { 
              title: 'Growth Insights', 
              desc: 'Identify your top-performing locations and card placements with heat-map analytics.', 
              icon: TrendingUp, 
              color: 'bg-violet-500' 
            },
          ].map((feature, i) => (
            <div key={i} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group">
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-900 rounded-[3rem] mx-6 mb-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px]" />
        
        <div className="max-w-7xl mx-auto px-10 relative">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">Simple, Transparent Pricing</h2>
            <p className="text-lg text-slate-400 font-medium">No hidden fees. Scale as you grow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-10 bg-slate-800/50 border border-slate-700/50 rounded-[2.5rem] flex flex-col">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">Startup</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">₹0</span>
                  <span className="text-slate-400 font-medium">/forever</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {['Up to 5 cards', 'Standard analytics', 'Mobile activation', 'Community support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="w-full py-4 bg-white text-slate-900 font-bold rounded-2xl text-center hover:bg-slate-100 transition-colors">
                Get Started
              </Link>
            </div>

            <div className="p-10 bg-indigo-600 border border-indigo-500 rounded-[2.5rem] flex flex-col shadow-2xl shadow-indigo-600/40 relative transform md:scale-110">
              <div className="absolute -top-4 right-8 px-4 py-1 bg-white text-indigo-600 text-xs font-black rounded-full uppercase tracking-widest shadow-xl">Best Value</div>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">₹1999</span>
                  <span className="text-indigo-100 font-medium">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {['Unlimited cards', 'Advanced API access', 'Priority White-labeling', '24/7 Phone support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-white font-medium">
                    <CheckCircle2 className="w-5 h-5 text-white/60" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="w-full py-4 bg-white text-indigo-600 font-bold rounded-2xl text-center hover:bg-indigo-50 transition-colors">
                Go Pro Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 pb-12">
        <div className="border-t border-slate-200 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Smartphone className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900">ReviewBoost</span>
          </div>
          <div className="flex gap-8">
            <Link href="#" className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">Terms of Service</Link>
            <Link href="#" className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">Contact</Link>
          </div>
          <p className="text-sm font-bold text-slate-400">&copy; {new Date().getFullYear()} ReviewBoost. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
