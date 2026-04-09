'use client';

import { useState } from 'react';
import { Smartphone, CheckCircle, AlertCircle, Loader2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function ActivationForm({ card_id }: { card_id: string }) {
  const [reviewUrl, setReviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');

    try {
      const res = await fetch('/api/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id, review_url: reviewUrl }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('Your NFC card is now live and ready to boost your reputation!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Activation failed');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-100">
          <CheckCircle className="text-green-500 w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">System Activated!</h2>
        <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10">
          {message}
        </p>
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center gap-3 mb-8">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Card ID: {card_id}</span>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 text-lg"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleActivate} className="space-y-8">
      <div className="space-y-4">
        <label className="block text-sm font-black text-slate-700 uppercase tracking-widest ml-1">
          Google Review Link
        </label>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-sky-500 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition-opacity" />
          <input 
            type="url"
            required
            placeholder="https://g.page/r/your-id/review"
            value={reviewUrl}
            onChange={(e) => setReviewUrl(e.target.value)}
            className="relative w-full px-6 py-5 bg-white border border-slate-200 rounded-[1.5rem] focus:outline-none focus:border-indigo-500 transition-all font-bold text-slate-900 text-lg shadow-sm"
          />
        </div>
        <div className="flex items-start gap-2 px-2">
          <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5" />
          <p className="text-xs text-slate-400 font-bold leading-relaxed">
            Must be a valid g.page or google.com/maps review link. This link will be triggered when customers tap your card.
          </p>
        </div>
      </div>

      <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
          <Smartphone className="text-indigo-600 w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Device Identifier</p>
          <p className="font-bold text-indigo-800 text-lg">{card_id}</p>
        </div>
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold animate-in shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {message}
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-5 bg-indigo-600 text-white font-black rounded-[1.5rem] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 text-xl"
      >
        {loading ? (
          <Loader2 className="w-7 h-7 animate-spin" />
        ) : (
          <>
            Activate Device
            <Zap className="w-6 h-6 fill-white" />
          </>
        )}
      </button>

      <div className="pt-6 flex items-center justify-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
        <ShieldCheck className="w-4 h-4" />
        Verified Hardware Handshake
      </div>
    </form>
  );
}
