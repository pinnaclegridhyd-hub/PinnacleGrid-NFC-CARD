import ActivationForm from '@/components/ActivationForm';
import { ShieldCheck, Smartphone, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default async function ActivationPage({ params }: { params: { card_id: string } }) {
  const { card_id } = await params;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col relative overflow-hidden selection:bg-indigo-100">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-70" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-70" />

      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 pt-32 pb-20 relative z-10">
        <div className="w-full max-w-[540px]">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-indigo-600 text-white rounded-2xl text-sm font-black mb-8 shadow-xl shadow-indigo-200">
              <Zap className="w-4 h-4 fill-white" />
              HARDWARE ACTIVATION
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">
              Connect Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500">Physical Device.</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-sm mx-auto">
              Link your NFC hardware to your Google business profile in one step.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] p-8 md:p-12 border border-slate-100 backdrop-blur-sm">
            <ActivationForm card_id={card_id} />
          </div>

          {/* Footer Info */}
          <p className="text-center mt-12 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            End-to-End Encryption Enabled
          </p>
        </div>
      </main>

      {/* Footer link back to home if user is lost */}
      <footer className="py-8 text-center relative z-10">
        <p className="text-sm font-bold text-slate-400">
          Not your device? <a href="/" className="text-indigo-600 hover:underline">Contact Support</a>
        </p>
      </footer>
    </div>
  );
}
