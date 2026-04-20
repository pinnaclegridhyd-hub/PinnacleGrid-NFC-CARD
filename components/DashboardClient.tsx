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
  Check,
  Filter,
  ChevronLeft,
  ChevronRight,
  Zap
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
import { KpiCard } from './dashboard/KpiCard';
import { StatusBadge } from './dashboard/StatusBadge';
import { KpiSkeleton, TableRowSkeleton } from './dashboard/SkeletonUI';

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
  const [isLoading, setIsLoading] = useState(true);
  
  // QR Modal States
  const [qrCard, setQrCard] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);

  const [editingCard, setEditingCard] = useState<any>(null);
  const [editUrl, setEditUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Pagination & Filtering States
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState('7D');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
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

  const filteredCards = cards.filter(c => {
    const matchesSearch = c.card_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && c.is_activated) || 
                         (statusFilter === 'pending' && !c.is_activated);
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCards = filteredCards.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filter or search changes
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter: 'all' | 'active' | 'pending') => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  // Simulate initial loading for Skeleton demonstration
  useState(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  });

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
            "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 active:scale-[0.98] group relative",
            activeTab === item.id 
              ? 'bg-primary/5 text-primary' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          )}
        >
          <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-primary" : "text-slate-400 group-hover:text-slate-600")} />
          <span className="tracking-tight text-sm">{item.label}</span>
          {activeTab === item.id && (
             <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full" />
          )}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#fcfdfe] flex">
      {/* QR MODAL */}
      {qrCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setQrCard(null)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-8 animate-in zoom-in-95 duration-200 border border-slate-200">
            <button 
              onClick={() => setQrCard(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary">
                <QrCode size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">QR Identifier</h3>
              <p className="text-slate-500 font-medium text-xs mt-1">{qrCard.card_id}</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl mb-6 flex flex-col items-center border border-slate-100">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(`${baseUrl}/r/${qrCard.card_id}`)}`}
                  alt="QR Code"
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                />
              </div>
              <div className="mt-6 w-full space-y-3">
                <div className="relative group">
                  <div className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-600 text-xs truncate pr-10">
                    {`${baseUrl}/r/${qrCard.card_id}`}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(`${baseUrl}/r/${qrCard.card_id}`)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-50 rounded-md text-primary transition-colors"
                  >
                    {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <a 
                href={`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(`${baseUrl}/r/${qrCard.card_id}`)}`}
                download={`QR_${qrCard.card_id}.png`}
                target="_blank"
                className="btn-premium-primary w-full"
              >
                <Download size={18} />
                Download PNG
              </a>
              <button 
                onClick={() => setQrCard(null)}
                className="btn-premium-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT URL MODAL */}
      {editingCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditingCard(null)} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl p-8 animate-in zoom-in-95 duration-200 border border-slate-200">
            <button 
              onClick={() => setEditingCard(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary">
                <ExternalLink size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Update Destination</h3>
              <p className="text-slate-500 font-medium text-xs mt-1">ID: {editingCard.card_id}</p>
            </div>

            <form onSubmit={handleUpdateUrl} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Destination URL</label>
                <input 
                  type="url"
                  required
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://g.page/r/your-id/review"
                  className="input-premium"
                />
                <p className="text-[10px] text-slate-400 font-medium px-1 underline decoration-primary/20">Changes sync instantly to your global NFC assets.</p>
              </div>

              <div className="flex gap-3">
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="btn-premium-primary flex-1"
                >
                  {isUpdating ? 'Saving...' : 'Update Destination'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingCard(null)}
                  className="btn-premium-secondary px-8"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 mb-10 pl-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center shadow-sm">
              <Smartphone className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Pinnacle Grid</span>
          </Link>
          <NavItems />
        </div>
        <div className="mt-auto p-6 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 font-medium hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <nav className="absolute top-0 left-0 bottom-0 w-72 bg-white shadow-xl p-6 flex flex-col animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between mb-10">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <Smartphone className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">Pinnacle Grid</span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400">
                <X size={20} />
              </button>
            </div>
            <NavItems />
            <div className="mt-auto pt-6 border-t border-slate-100">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 font-medium hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all"
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
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            
            <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg group transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/5 focus-within:border-primary/40">
              <Search className="w-4 h-4 text-slate-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Quick search cards..." 
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400 w-48"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
               <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                 <RefreshCcw className="w-4 h-4" />
               </button>
               <div className="h-4 w-px bg-slate-200 mx-1" />
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 bg-white border border-slate-200 p-1.5 pr-3.5 rounded-lg hover:border-slate-300 hover:shadow-sm active:scale-[0.98] transition-all"
              >
                <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-white font-bold text-[10px]">
                  PG
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Admin</p>
                  <p className="text-xs font-semibold text-slate-700 leading-none">Pinnacle Grid</p>
                </div>
                <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-200", isProfileOpen && "rotate-180")} />
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-1 animate-in fade-in slide-in-from-top-1 duration-150 z-50">
                  <div className="px-4 py-3 border-b border-slate-100 mb-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Administrator</p>
                    <p className="text-xs font-medium text-slate-900 truncate">support@pinnaclegrid.com</p>
                  </div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 text-xs font-semibold hover:bg-rose-50 rounded-lg transition-colors">
                    <LogOut className="w-3.5 h-3.5" />
                    Secure Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth bg-[#f8f9fa]">
          <div className="px-8 py-10">
            <div className="mb-10">
               <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">NFC Device Ecosystem</h1>
               <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
                  Monitor and manage your Pinnacle Grid hardware assets. Centralized control for your global NFC networking identity.
               </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
               {isLoading ? (
                 <>
                   <KpiSkeleton />
                   <KpiSkeleton />
                   <KpiSkeleton />
                 </>
               ) : (
                 <>
                   <KpiCard 
                     label="Total Fleet Scans" 
                     value={totalTaps.toLocaleString()} 
                     icon={Activity} 
                     variant="primary" 
                   />
                   <KpiCard 
                     label="Activated Assets" 
                     value={activeCards} 
                     icon={CreditCard} 
                     variant="secondary" 
                   />
                   <KpiCard 
                     label="Average Engagement" 
                     value={`${activationRate}%`} 
                     icon={Trophy} 
                     variant="success" 
                   />
                 </>
               )}
            </div>

          {activeTab === 'inventory' && (
            <div className="space-y-8">
              {/* Toolbar & Filters */}
              <div className="flex flex-col gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
                  <div className="relative w-full lg:max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text"
                      placeholder="Filter by hardware ID..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="input-premium pl-11 pr-4 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    <button 
                      onClick={() => setIsAddingCard(true)}
                      className="btn-premium-primary flex-1 lg:flex-none py-2.5 h-11"
                    >
                      <Plus size={18} />
                      Provision New Asset
                    </button>
                    <button className="btn-premium-icon lg:hidden">
                      <Filter size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Quick Filters:</span>
                  {[
                    { id: 'all', label: 'All Cards', count: cards.length },
                    { id: 'active', label: 'Active', count: activeCards },
                    { id: 'pending', label: 'Inventory', count: cards.length - activeCards },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => handleFilterChange(filter.id as any)}
                      className={cn(
                        "px-4 py-1.5 rounded-md text-[11px] font-semibold transition-all flex items-center gap-2",
                        statusFilter === filter.id 
                          ? 'bg-primary text-white' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      )}
                    >
                      {filter.label}
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[9px] font-bold",
                        statusFilter === filter.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      )}>
                        {filter.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Card Form */}
              {isAddingCard && (
                <div className="bg-white p-6 rounded-xl border border-primary/20 shadow-sm animate-in fade-in duration-200">
                  <form onSubmit={handleAddCard} className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 w-full space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Card Serial Number</label>
                      <input 
                        type="text"
                        required
                        value={newCardId}
                        onChange={(e) => setNewCardId(e.target.value)}
                        placeholder="e.g. NFC-PG-001"
                        className="input-premium font-semibold tracking-wide"
                      />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <button type="submit" className="btn-premium-primary flex-1 px-8 py-2.5 h-11">Register Hardware</button>
                      <button type="button" onClick={() => setIsAddingCard(false)} className="btn-premium-secondary px-8 py-2.5 h-11">Dismiss</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Cards List */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200">
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hardware Identity</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Status</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Scans</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isLoading ? (
                         Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                      ) : (
                        paginatedCards.length > 0 ? (
                          paginatedCards.map((card) => (
                            <tr 
                              key={card._id} 
                              className="hover:bg-primary transition-all duration-300 group cursor-pointer hover:shadow-xl relative hover:-translate-y-0.5"
                            >
                              <td className="px-6 py-4.5">
                                <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs transition-all duration-300",
                                    card.is_activated 
                                      ? 'bg-primary/10 text-primary group-hover:bg-white group-hover:text-primary' 
                                      : 'bg-slate-100 text-slate-400 border border-slate-200 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/40'
                                  )}>
                                    {card.card_id.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-bold text-slate-900 text-sm group-hover:text-white transition-colors text-inter tracking-tight">{card.card_id}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-white/70 transition-colors">Pinnacle Asset</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4.5">
                                <StatusBadge isActivated={card.is_activated} />
                              </td>
                              <td className="px-6 py-4.5 text-right">
                                <span className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-white group-hover:scale-110 transition-all inline-block">{card.taps_count || 0}</span>
                              </td>
                              <td className="px-6 py-4.5">
                                <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setEditingCard(card); setEditUrl(card.review_url || ''); }}
                                      className="p-2 text-slate-400 bg-transparent hover:bg-white/20 rounded-md transition-all group-hover:text-white group-hover:hover:bg-white group-hover:hover:text-primary"
                                      title="Config"
                                    >
                                      <Settings size={16} />
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setQrCard(card); }}
                                      className="p-2 text-slate-400 bg-transparent hover:bg-white/20 rounded-md transition-all group-hover:text-white group-hover:hover:bg-white group-hover:hover:text-primary"
                                      title="QR"
                                    >
                                      <QrCode size={16} />
                                    </button>
                                    <Link 
                                      href={`/r/${card.card_id}`} 
                                      target="_blank"
                                      onClick={(e) => e.stopPropagation()}
                                      className="p-2 text-slate-400 bg-transparent hover:bg-white/20 rounded-md transition-all group-hover:text-white group-hover:hover:bg-white group-hover:hover:text-primary"
                                      title="Visit"
                                    >
                                      <ExternalLink size={16} />
                                    </Link>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); deleteCard(card._id); }}
                                      className="p-2 text-slate-300 hover:text-rose-600 bg-transparent hover:bg-rose-50 rounded-md transition-all group-hover:text-white group-hover:hover:bg-white group-hover:hover:text-rose-600"
                                      title="Delete"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-10 py-32 text-center">
                              <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                <div className="w-28 h-28 bg-slate-50/50 rounded-[3rem] flex items-center justify-center mb-10 border border-slate-100 shadow-inner group">
                                  <CreditCard className="text-slate-200 w-12 h-12 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-6" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-3 font-outfit">Resource Not Found</h3>
                                <p className="text-slate-400 font-bold text-sm mb-10 leading-relaxed font-inter">
                                   No hardware assets match your current selection. Try refining your filters or register a new NFC identifier.
                                </p>
                                <button 
                                  onClick={() => setIsAddingCard(true)}
                                  className="btn-premium-primary font-outfit"
                                >
                                  <Plus size={20} />
                                  Register Asset
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] font-medium text-slate-500">
                      Showing <span className="text-slate-900 font-bold">{startIndex + 1}</span>-
                      <span className="text-slate-900 font-bold">{Math.min(startIndex + itemsPerPage, filteredCards.length)}</span> of 
                      <span className="text-slate-900 font-bold"> {filteredCards.length}</span> assets
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 bg-white border border-slate-200 rounded text-slate-400 hover:text-primary disabled:opacity-30 transition-all"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={cn(
                            "min-w-[28px] h-7 px-1 rounded text-[10px] font-bold transition-all",
                            currentPage === i + 1 
                              ? 'bg-primary text-white shadow-sm' 
                              : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
                          )}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 bg-white border border-slate-200 rounded text-slate-400 hover:text-primary disabled:opacity-30 transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="mb-10 flex flex-col sm:flex-row justify-between items-start gap-6 relative z-10">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Engagement Analytics</h3>
                    <p className="text-slate-500 font-medium max-w-xl leading-relaxed text-sm">
                       Visualizing your network interaction trends across active hardware assets.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                    {['7D', '30D', '90D', 'All'].map((period) => (
                      <button 
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={cn(
                          "px-4 py-1.5 rounded-md text-[10px] font-bold transition-all tracking-wider",
                          selectedPeriod === period ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        )}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="h-[400px] min-h-[400px] w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorTaps" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#004AAD" stopOpacity={0.1}/>
                          <stop offset="100%" stopColor="#004AAD" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 500}}
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                             return (
                                <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs">
                                   <p className="font-bold">{payload[0].value} Scans</p>
                                </div>
                             );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="taps" 
                        stroke="#004AAD" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorTaps)" 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Avg Scans/Day', value: '24.2', icon: Activity },
                  { label: 'Peak Time', value: '2:00 PM', icon: Clock },
                  { label: 'Unique Reach', value: '418', icon: Smartphone },
                  { label: 'System Health', value: 'Nominal', icon: CheckCircle2 },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-slate-300 group">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                          <stat.icon size={16} />
                       </div>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    </div>
                    <p className="text-xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  </div>
  );
}
