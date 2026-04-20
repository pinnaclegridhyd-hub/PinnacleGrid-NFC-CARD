'use client';

import { useState } from 'react';
import { 
  BarChart3, 
  CreditCard, 
  Settings, 
  Plus, 
  Search, 
  Trash2, 
  ExternalLink, 
  RefreshCcw,
  Trophy,
  Activity,
  LogOut,
  ChevronDown,
  Smartphone,
  CheckCircle2,
  Clock,
  Menu,
  X,
  QrCode,
  Download,
  Copy,
  Check
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DashboardClient({ initialCards }: { initialCards: any[] }) {
  const [cards, setCards] = useState(initialCards);
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardId, setNewCardId] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // QR Modal States
  const [qrCard, setQrCard] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Edit Modal States
  const [editingCard, setEditingCard] = useState<any>(null);
  const [editUrl, setEditUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const router = useRouter();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

  // Stats calculation
  const totalTaps = cards.reduce((acc, card) => acc + (card.taps_count || 0), 0);
  const activeCards = cards.filter(c => c.is_activated).length;
  const activationRate = cards.length > 0 ? (activeCards / cards.length * 100).toFixed(1) : 0;

  // Chart data
  const chartData = [
    { name: 'Mon', taps: 40 },
    { name: 'Tue', taps: 300 },
    { name: 'Wed', taps: 200 },
    { name: 'Thu', taps: 278 },
    { name: 'Fri', taps: 189 },
    { name: 'Sat', taps: 239 },
    { name: 'Sun', taps: 349 },
  ];

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: newCardId }),
      });
      if (res.ok) {
        const newCard = await res.json();
        setCards([newCard, ...cards]);
        setNewCardId('');
        setIsAddingCard(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  const deleteCard = async (id: string) => {
    if (confirm('Delete this card permanently?')) {
      await fetch(`/api/cards/${id}`, { method: 'DELETE' });
      setCards(cards.filter(c => c._id !== id));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleUpdateUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/cards/${editingCard._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          review_url: editUrl,
          is_activated: true 
        }),
      });
      if (res.ok) {
        const updatedCard = await res.json();
        setCards(cards.map(c => c._id === editingCard._id ? updatedCard : c));
        setEditingCard(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredCards = cards.filter(c => 
    c.card_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const NavItems = () => (
    <nav className="space-y-1">
      {[
        { id: 'inventory', icon: CreditCard, label: 'NFC Inventory' },
        { id: 'analytics', icon: BarChart3, label: 'Analytics' },
        { id: 'settings', icon: Settings, label: 'Settings' },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setActiveTab(item.id);
            setIsMobileMenuOpen(false);
          }}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
            activeTab === item.id 
              ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50' 
              : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
          )}
        >
          <item.icon className="w-5 h-5" />
          {item.label}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#fcfdfe] flex">
      {/* QR MODAL */}
      {qrCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setQrCard(null)} />
          <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-8 sm:p-12 animate-in zoom-in-95 duration-300 border border-slate-100">
            <button 
              onClick={() => setQrCard(null)}
              className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X size={24} />
            </button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <QrCode size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">QR Identifier</h3>
              <p className="text-slate-500 font-bold text-sm tracking-wide uppercase mt-1">{qrCard.card_id}</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-[2.5rem] mb-8 flex flex-col items-center">
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(`${baseUrl}/r/${qrCard.card_id}`)}`}
                  alt="QR Code"
                  className="w-48 h-48 sm:w-64 sm:h-64 object-contain"
                />
              </div>
              <div className="mt-6 w-full space-y-3">
                <div className="relative group">
                  <div className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 text-xs truncate pr-12">
                    {`${baseUrl}/r/${qrCard.card_id}`}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(`${baseUrl}/r/${qrCard.card_id}`)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-50 rounded-lg text-indigo-600 transition-colors"
                  >
                    {isCopied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <a 
                href={`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(`${baseUrl}/r/${qrCard.card_id}`)}`}
                download={`QR_${qrCard.card_id}.png`}
                target="_blank"
                className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Download Print Quality
              </a>
              <button 
                onClick={() => setQrCard(null)}
                className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT URL MODAL */}
      {editingCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditingCard(null)} />
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-8 sm:p-12 animate-in zoom-in-95 duration-300 border border-slate-100">
            <button 
              onClick={() => setEditingCard(null)}
              className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X size={24} />
            </button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                <ExternalLink size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Update Destination</h3>
              <p className="text-slate-500 font-bold text-sm tracking-wide uppercase mt-1">ID: {editingCard.card_id}</p>
            </div>

            <form onSubmit={handleUpdateUrl} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Google Review Link</label>
                <input 
                  type="url"
                  required
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://g.page/r/your-id/review"
                  className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all font-bold text-slate-900"
                />
                <p className="text-[10px] text-slate-400 font-bold px-2 italic">Changes take effect immediately for all scans.</p>
              </div>

              <div className="flex gap-3">
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingCard(null)}
                  className="px-8 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <aside className="w-72 bg-white border-r border-slate-100 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <Smartphone className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">ReviewBoost</span>
          </Link>
          <NavItems />
        </div>
        <div className="mt-auto p-8 border-t border-slate-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 font-bold hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <nav className="absolute top-0 left-0 bottom-0 w-80 bg-white shadow-2xl p-8 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-12">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Smartphone className="text-white w-6 h-6" />
                </div>
                <span className="text-2xl font-black tracking-tighter text-slate-900">ReviewBoost</span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400">
                <X />
              </button>
            </div>
            <NavItems />
            <div className="mt-auto pt-8 border-t border-slate-50">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 font-bold hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 bg-slate-50 text-slate-600 rounded-xl"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-3 text-slate-400 font-bold text-sm">
              <span className="text-slate-900">Dashboard</span>
              <span className="text-slate-200">/</span>
              <span className="capitalize">{activeTab}</span>
            </div>
            {/* Mobile Title */}
            <h1 className="lg:hidden text-lg font-black text-slate-900 sm:hidden">Dashboard</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <button 
              onClick={() => setIsAddingCard(true)}
              className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors shadow-sm shadow-indigo-100/50"
            >
              <Plus className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-slate-100" />
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 sm:gap-3 bg-slate-50/50 border border-slate-100 px-2 py-1.5 sm:px-3 sm:py-2 rounded-2xl hover:bg-white transition-all"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-[10px] sm:text-xs">
                  AD
                </div>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isProfileOpen && "rotate-180")} />
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="px-4 py-3 border-b border-slate-50 mb-1">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate">admin@pinnaclegrid.com</p>
                  </div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-rose-600 font-bold hover:bg-rose-50 rounded-xl transition-colors">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[
              { label: 'Total Scans', value: totalTaps.toLocaleString(), icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50/50' },
              { label: 'Active Devices', value: activeCards, icon: CreditCard, color: 'text-indigo-500', bg: 'bg-indigo-50/50' },
              { label: 'Conversion Rate', value: `${activationRate}%`, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50/50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 sm:p-6 rounded-[2rem] border border-slate-100/80 shadow-sm shadow-slate-200/20 flex items-center gap-4 group hover:border-indigo-100 transition-colors">
                <div className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6 sm:w-7 sm:h-7", stat.color)} />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 sm:p-6 rounded-[2.5rem] border border-slate-100/80">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="text"
                    placeholder="Search cards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                  />
                </div>
                
                <button 
                  onClick={() => setIsAddingCard(true)}
                  className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Plus size={18} />
                  New Identifier
                </button>
              </div>

              {/* Add Card Form */}
              {isAddingCard && (
                <div className="bg-white border-2 border-indigo-50 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 animate-in zoom-in-95 duration-200">
                  <form onSubmit={handleAddCard} className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 w-full space-y-2.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Card Access ID</label>
                      <input 
                        type="text"
                        required
                        value={newCardId}
                        onChange={(e) => setNewCardId(e.target.value)}
                        placeholder="e.g., NFC-DXB-001"
                        className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all font-black text-slate-900 uppercase"
                      />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button type="submit" className="flex-1 px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100">Generate</button>
                      <button type="button" onClick={() => setIsAddingCard(false)} className="px-10 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors">Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Cards List - Truly Responsive */}
              <div className="bg-white border border-slate-100/80 rounded-[2.5rem] shadow-sm shadow-slate-200/20 overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-slate-50/50 border-b border-slate-50">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hardware Identity</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Status</th>
                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Taps</th>
                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredCards.length > 0 ? filteredCards.map((card) => (
                        <tr key={card._id} className="hover:bg-slate-50/30 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors",
                                card.is_activated ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                              )}>
                                {card.card_id.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-black text-slate-900 tracking-tight">{card.card_id}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            {card.is_activated ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black border border-green-100">
                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />
                                ACTIVE
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-[10px] font-black">
                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                                PENDING
                              </div>
                            )}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex flex-col items-end">
                              <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">{card.taps_count || 0}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Interactions</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setEditingCard(card);
                                  setEditUrl(card.review_url || '');
                                }}
                                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                title="Edit URL"
                              >
                                <Settings size={20} />
                              </button>
                              <button 
                                onClick={() => setQrCard(card)}
                                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                title="View QR Code"
                              >
                                <QrCode size={20} />
                              </button>
                              <Link 
                                href={`/r/${card.card_id}`} 
                                target="_blank"
                                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                              >
                                <ExternalLink size={20} />
                              </Link>
                              <button 
                                onClick={() => deleteCard(card._id)}
                                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-8 py-20 text-center">
                            <div className="inline-flex flex-col items-center gap-2">
                              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                                <Search className="text-slate-200 w-8 h-8" />
                              </div>
                              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No cards found matching your scan</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-6 sm:p-10 rounded-[3rem] border border-slate-100/80 shadow-sm shadow-slate-200/20">
                <div className="mb-10 flex flex-col sm:flex-row justify-between items-start gap-6">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">Network Growth</h3>
                    <p className="text-slate-400 font-medium">Daily card scans across your entire global network</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Period</span>
                    <select className="bg-slate-50 border-none px-4 py-2.5 rounded-xl text-xs font-black text-slate-600 focus:outline-none cursor-pointer ring-1 ring-slate-100 hover:bg-slate-100 transition-colors">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                    </select>
                  </div>
                </div>
                
                <div className="h-[300px] sm:h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorTaps" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#cbd5e1', fontSize: 10, fontWeight: 800}}
                        dy={15}
                      />
                      <YAxis 
                        hide 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          borderRadius: '24px', 
                          border: 'none', 
                          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' 
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="taps" 
                        stroke="#4f46e5" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorTaps)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Enhanced Analytics Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { label: 'Avg Taps/Day', value: '24.2' },
                  { label: 'Busiest Hour', value: '14:00 PM' },
                  { label: 'Unique Devices', value: '418' },
                  { label: 'System Health', value: 'Optimal' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100/50 shadow-sm text-center transform hover:-translate-y-1 transition-transform">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">{stat.label}</p>
                    <p className="text-xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
