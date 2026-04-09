'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowRight, Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-[480px] relative">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform shadow-xl shadow-indigo-200">
              <ShieldCheck className="text-white w-7 h-7" />
            </div>
            <span className="text-3xl font-black tracking-tighter text-slate-900">ReviewBoost</span>
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 mt-3 font-medium text-lg">Manage your NFC review cards with ease.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] p-10 border border-slate-100 backdrop-blur-sm">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2.5 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-14 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 bottom-0 px-5 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors z-10"
                >
                  <div className="pointer-events-none">
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </div>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 text-lg"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Log In'}
              {!loading && <ArrowRight className="w-6 h-6" />}
            </button>
          </form>

          <p className="text-center mt-10 text-slate-500 font-medium">
            New to the platform? {' '}
            <Link href="/signup" className="text-indigo-600 font-black hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        {/* Support Link */}
        <p className="text-center mt-12 text-slate-400 font-bold text-sm tracking-wide uppercase">
          Enterprise Security & Privacy Guaranteed
        </p>
      </div>
    </div>
  );
}
