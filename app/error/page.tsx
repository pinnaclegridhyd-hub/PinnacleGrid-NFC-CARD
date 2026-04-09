import Navbar from '@/components/Navbar';
import { AlertCircle, ArrowLeft, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function ErrorPage({ 
  searchParams 
}: { 
  searchParams: { message?: string, type?: string } 
}) {
  const message = searchParams.message || 'The card identifier you are trying to access is invalid or does not exist in our system.';
  const type = searchParams.type || 'Invalid ID';

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-60" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-100 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-md text-center relative z-10">
        <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-rose-100 animate-bounce">
          <AlertCircle className="text-rose-500 w-12 h-12" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
          Error: {type}
        </div>

        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-6 leading-tight">
          Oops! Something <br /> went wrong.
        </h1>

        <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10">
          {message}
        </p>

        <div className="space-y-4">
          <Link 
            href="/" 
            className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest pt-4">
            <Smartphone className="w-4 h-4" />
            Pinnacle Grid Secure System
          </div>
        </div>
      </div>
    </div>
  );
}
