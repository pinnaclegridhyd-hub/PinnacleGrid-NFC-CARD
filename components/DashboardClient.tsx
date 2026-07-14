'use client';

import { useState, useEffect } from 'react';
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
  Monitor,
  Tablet,
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

export default function DashboardClient({ initialCards, user }: { initialCards: any[], user: any }) {
  const userRole = (user?.email === 'admin@pinnaclegrid.com' || user?.email?.startsWith('admin@'))
    ? 'admin'
    : (user?.role || 'editor');
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

  // Settings States
  const [selectedSettingsSection, setSelectedSettingsSection] = useState(userRole === 'admin' ? 'general' : 'security');
  const [redirectMode, setRedirectMode] = useState('instant');
  const [antiSpamSeconds, setAntiSpamSeconds] = useState(15);
  const [orgName, setOrgName] = useState('Pinnacle Grid');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSettingsSaved, setIsSettingsSaved] = useState(true);

  const handleSaveSettings = () => {
    setIsSettingsSaved(false);
    setTimeout(() => {
      setIsSettingsSaved(true);
    }, 800);
  };

  // Change Password States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      if (res.ok) {
        setPasswordSuccess('Password changed successfully');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json();
        setPasswordError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setPasswordError('An error occurred');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Create Account States (Admin Only)
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState('editor');
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    setIsCreatingAccount(true);
    try {
      const res = await fetch('/api/user/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: createEmail, password: createPassword, role: createRole }),
      });
      if (res.ok) {
        setCreateSuccess('Account created successfully');
        setCreateEmail('');
        setCreatePassword('');
        setCreateRole('editor');
      } else {
        const data = await res.json();
        setCreateError(data.error || 'Failed to create account');
      }
    } catch (err) {
      setCreateError('An error occurred');
    } finally {
      setIsCreatingAccount(false);
    }
  };


  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

  // Stats calculation
  const totalTaps = cards.reduce((acc, card) => acc + (card.taps_count || 0), 0);
  const activeCards = cards.filter(c => c.is_activated).length;
  const activationRate = cards.length > 0 ? (activeCards / cards.length * 100).toFixed(1) : 0;

  // Dynamic Analytics State
  const [analyticsData, setAnalyticsData] = useState<{
    chartData: { name: string; taps: number }[];
    stats: {
      avgScansPerDay: string;
      peakTime: string;
      uniqueReach: string;
      systemHealth: string;
    };
    devices: { name: string; value: number; percentage: number }[];
    topCards: { card_id: string; count: number }[];
  } | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsAnalyticsLoading(true);
      try {
        const res = await fetch(`/api/analytics?period=${selectedPeriod}`);
        if (res.ok) {
          const data = await res.json();
          setAnalyticsData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsAnalyticsLoading(false);
      }
    };

    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, selectedPeriod]);

  // Fallback/Default chart data when loading or empty
  const chartData = analyticsData?.chartData || [
    { name: 'Mon', taps: 0 },
    { name: 'Tue', taps: 0 },
    { name: 'Wed', taps: 0 },
    { name: 'Thu', taps: 0 },
    { name: 'Fri', taps: 0 },
    { name: 'Sat', taps: 0 },
    { name: 'Sun', taps: 0 },
  ];

  const analyticsStats = analyticsData?.stats || {
    avgScansPerDay: '0.0',
    peakTime: 'N/A',
    uniqueReach: '0',
    systemHealth: 'Nominal'
  };

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

  const NavItems = () => {
    const items = [
      { id: 'inventory', icon: CreditCard, label: 'NFC Inventory' },
      ...(userRole === 'admin' ? [{ id: 'analytics', icon: BarChart3, label: 'Analytics' }] : []),
      { id: 'settings', icon: Settings, label: 'Settings' },
    ];
    return (
      <nav className="space-y-1">
        {items.map((item) => (
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
  };

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
                                <div className="flex items-center justify-end gap-1.5 transition-all duration-300">
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
                                    {userRole === 'admin' && (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); deleteCard(card._id); }}
                                        className="p-2 text-slate-300 hover:text-rose-600 bg-transparent hover:bg-rose-50 rounded-md transition-all group-hover:text-white group-hover:hover:bg-white group-hover:hover:text-rose-600"
                                        title="Delete"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    )}
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
              {/* Dynamic Analytics Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Graph Card */}
                <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="mb-10 flex flex-col sm:flex-row justify-between items-start gap-6 relative z-10">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-1.5 font-outfit">Engagement Analytics</h3>
                        <p className="text-slate-400 font-medium max-w-xl leading-relaxed text-xs">
                          Visualizing scan interaction rates across active hardware assets in real-time.
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80">
                        {['7D', '30D', '90D', 'All'].map((period) => (
                          <button 
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={cn(
                              "px-3.5 py-1.5 rounded-md text-[10px] font-extrabold transition-all tracking-wider",
                              selectedPeriod === period 
                                ? 'bg-white text-primary shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700'
                            )}
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="h-[340px] w-full relative z-10">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorTaps" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#004AAD" stopOpacity={0.15}/>
                              <stop offset="100%" stopColor="#004AAD" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}}
                            dy={10}
                          />
                          <YAxis hide />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                 return (
                                    <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-800/80 flex flex-col gap-1">
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{payload[0].payload.name}</p>
                                       <p className="text-sm font-extrabold text-white flex items-center gap-1.5">
                                          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                          {payload[0].value} <span className="text-[11px] text-slate-300 font-medium">Scans</span>
                                       </p>
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
                            animationDuration={1000}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Right Analytics Sidebar */}
                <div className="flex flex-col gap-6">
                  
                  {/* Device Analytics Panel */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Device breakdown</h4>
                    <div className="space-y-4">
                      {((analyticsData?.devices && analyticsData.devices.length > 0) 
                        ? analyticsData.devices 
                        : [
                            { name: 'Mobile', value: 0, percentage: 0 },
                            { name: 'Desktop', value: 0, percentage: 0 },
                            { name: 'Tablet', value: 0, percentage: 0 },
                          ]
                      ).map((device) => {
                        const Icon = device.name === 'Mobile' ? Smartphone : device.name === 'Desktop' ? Monitor : Tablet;
                        return (
                          <div key={device.name} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                                <Icon size={14} className="text-slate-400" />
                                {device.name}
                              </span>
                              <span className="font-extrabold text-slate-800">
                                {device.percentage}% <span className="text-[10px] text-slate-400 font-medium">({device.value})</span>
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all duration-700" 
                                style={{ width: `${device.percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Performing Cards */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Top active assets</h4>
                    {(!analyticsData?.topCards || analyticsData.topCards.length === 0) ? (
                      <div className="text-center py-6 text-slate-400 text-xs font-medium">
                        No taps recorded in this timeframe
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {analyticsData.topCards.map((card) => (
                          <div key={card.card_id} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-100">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 bg-primary/10 text-primary text-[10px] font-black rounded-lg flex items-center justify-center">
                                {card.card_id.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="text-xs font-bold text-slate-700 truncate max-w-[120px] font-inter tracking-tight">{card.card_id}</span>
                            </div>
                            <span className="text-[10px] font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-full">{card.count} taps</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Stat Cards at Bottom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Avg Scans/Day', value: analyticsStats.avgScansPerDay, icon: Activity, glow: 'hover:shadow-primary/5 hover:border-primary/30' },
                  { label: 'Peak Time', value: analyticsStats.peakTime, icon: Clock, glow: 'hover:shadow-indigo-500/5 hover:border-indigo-500/30' },
                  { label: 'Unique Reach', value: analyticsStats.uniqueReach, icon: Smartphone, glow: 'hover:shadow-emerald-500/5 hover:border-emerald-500/30' },
                  { label: 'System Health', value: analyticsStats.systemHealth, icon: CheckCircle2, glow: 'hover:shadow-amber-500/5 hover:border-amber-500/30' },
                ].map((stat, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all duration-300 relative overflow-hidden group hover:-translate-y-0.5",
                      stat.glow
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                       <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                          <stat.icon size={16} />
                       </div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900 tracking-tight font-outfit">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row min-h-[500px]">
                  
                  {/* Settings Sidebar */}
                  <div className="w-full md:w-64 border-r border-slate-200/60 bg-slate-50/50 p-6 space-y-1">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-3 mb-4">Configuration</h3>
                    {[
                      ...(userRole === 'admin' ? [
                        { id: 'general', label: 'General Settings' },
                        { id: 'api', label: 'Developer & API' }
                      ] : []),
                      { id: 'security', label: 'Security & Access' }
                    ].map((sec) => (
                      <button
                        key={sec.id}
                        onClick={() => setSelectedSettingsSection(sec.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all",
                          selectedSettingsSection === sec.id
                            ? 'bg-primary/5 text-primary'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                        )}
                      >
                        {sec.label}
                      </button>
                    ))}
                  </div>

                  {/* Settings Form Content */}
                  <div className="flex-1 p-8 md:p-10">
                    {userRole === 'admin' && selectedSettingsSection === 'general' && (
                      <div className="space-y-8 max-w-xl">
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900 tracking-tight font-outfit">General Settings</h4>
                          <p className="text-slate-400 text-xs mt-1">Configure global behavior parameters for your NFC hardware identifiers.</p>
                        </div>
                        
                        <div className="space-y-6">
                          {/* Redirect Mode */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Default Redirect Action</label>
                            <div className="grid grid-cols-2 gap-4">
                              <button 
                                onClick={() => setRedirectMode('instant')}
                                className={cn(
                                  "p-4 rounded-xl border text-left transition-all",
                                  redirectMode === 'instant' 
                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/5' 
                                    : 'border-slate-200 hover:border-slate-300'
                                )}
                              >
                                <span className="block text-xs font-bold text-slate-900">Instant Redirect</span>
                                <span className="block text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">Directly route scanned devices to destination URLs in &lt;100ms.</span>
                              </button>
                              <button 
                                onClick={() => setRedirectMode('interstitial')}
                                className={cn(
                                  "p-4 rounded-xl border text-left transition-all",
                                  redirectMode === 'interstitial' 
                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/5' 
                                    : 'border-slate-200 hover:border-slate-300'
                                )}
                              >
                                <span className="block text-xs font-bold text-slate-900">Loading Screen</span>
                                <span className="block text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">Show a brief loading interface before destination routing.</span>
                              </button>
                            </div>
                          </div>

                          {/* Anti-Spam Rate Limit */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analytics Anti-Spam (Seconds)</label>
                            <p className="text-[10px] text-slate-400 font-medium">Prevent duplicate scans from inflating tap logs within specified intervals.</p>
                            <select 
                              value={antiSpamSeconds}
                              onChange={(e) => setAntiSpamSeconds(Number(e.target.value))}
                              className="input-premium py-2.5"
                            >
                              <option value={0}>Disabled (Log all interactions)</option>
                              <option value={5}>5 seconds</option>
                              <option value={15}>15 seconds</option>
                              <option value={30}>30 seconds</option>
                              <option value={60}>60 seconds</option>
                            </select>
                          </div>

                          {/* Organization Name */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization Name</label>
                            <input 
                              type="text" 
                              value={orgName}
                              onChange={(e) => setOrgName(e.target.value)}
                              className="input-premium py-2.5 font-semibold"
                            />
                          </div>

                        </div>
                      </div>
                    )}

                    {userRole === 'admin' && selectedSettingsSection === 'api' && (
                      <div className="space-y-8 max-w-xl">
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900 tracking-tight font-outfit">Developer & API</h4>
                          <p className="text-slate-400 text-xs mt-1">Integrate external services and retrieve authentication headers.</p>
                        </div>
                        
                        <div className="space-y-6">
                          {/* API Key */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">API Secret Key</label>
                            <div className="flex gap-2">
                              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between font-mono text-xs text-slate-500 overflow-hidden truncate">
                                {showApiKey ? 'sk_live_pinnacle_grid_9f27c81d830b' : '••••••••••••••••••••••••••••••••••••'}
                                <button 
                                  onClick={() => setShowApiKey(!showApiKey)}
                                  className="text-primary font-sans font-bold hover:underline ml-2"
                                >
                                  {showApiKey ? 'Hide' : 'Reveal'}
                                </button>
                              </div>
                              <button 
                                onClick={() => copyToClipboard('sk_live_pinnacle_grid_9f27c81d830b')}
                                className="btn-premium-secondary px-4 py-2 flex items-center justify-center gap-1.5"
                              >
                                <Copy size={14} />
                                Copy
                              </button>
                            </div>
                          </div>

                          {/* Webhook Url */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Webhook URL Endpoint</label>
                            <p className="text-[10px] text-slate-400 font-medium">Trigger HTTP POST requests with device payload whenever an NFC asset is scanned.</p>
                            <input 
                              type="url" 
                              placeholder="https://yourserver.com/webhooks/nfc"
                              value={webhookUrl}
                              onChange={(e) => setWebhookUrl(e.target.value)}
                              className="input-premium py-2.5 font-semibold"
                            />
                          </div>

                        </div>
                      </div>
                    )}

                    {selectedSettingsSection === 'security' && (
                      <div className="space-y-8 max-w-xl">
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900 tracking-tight font-outfit">Security & Access</h4>
                          <p className="text-slate-400 text-xs mt-1">Review account details, update credentials, and manage authorizations.</p>
                        </div>
                        
                        <div className="space-y-6">
                          {/* Info Panel */}
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                              <span className="text-xs font-semibold text-slate-500">Account Owner</span>
                              <span className="text-xs font-extrabold text-slate-700">{user?.email}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                              <span className="text-xs font-semibold text-slate-500">Access Role</span>
                              <span className="text-[10px] font-black text-white bg-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider">{userRole}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-xs font-semibold text-slate-500">Datacenter Location</span>
                              <span className="text-xs font-bold text-slate-600">Mumbai Central, India (AWS)</span>
                            </div>
                          </div>

                          {/* Change Password Form */}
                          <div className="border border-slate-200 rounded-xl p-6 space-y-4">
                            <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Change Password</h5>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">New Password</label>
                                <input 
                                  type="password" 
                                  required
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  placeholder="••••••••"
                                  className="input-premium py-2 font-semibold"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confirm New Password</label>
                                <input 
                                  type="password" 
                                  required
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  placeholder="••••••••"
                                  className="input-premium py-2 font-semibold"
                                />
                              </div>
                              {passwordError && (
                                <p className="text-xs font-bold text-rose-600">{passwordError}</p>
                              )}
                              {passwordSuccess && (
                                <p className="text-xs font-bold text-emerald-600">{passwordSuccess}</p>
                              )}
                              <button 
                                type="submit" 
                                disabled={isChangingPassword}
                                className="btn-premium-primary w-full py-2 text-xs"
                              >
                                {isChangingPassword ? 'Updating Password...' : 'Update Password'}
                              </button>
                            </form>
                          </div>

                          {/* Create Account Form (Admin Only) */}
                          {userRole === 'admin' && (
                            <div className="border border-slate-200 rounded-xl p-6 space-y-4">
                              <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Create Team Account</h5>
                              <form onSubmit={handleCreateAccount} className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                                  <input 
                                    type="email" 
                                    required
                                    value={createEmail}
                                    onChange={(e) => setCreateEmail(e.target.value)}
                                    placeholder="team-member@pinnaclegrid.com"
                                    className="input-premium py-2 font-semibold"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
                                  <input 
                                    type="password" 
                                    required
                                    value={createPassword}
                                    onChange={(e) => setCreatePassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-premium py-2 font-semibold"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Access Role</label>
                                  <select 
                                    value={createRole}
                                    onChange={(e) => setCreateRole(e.target.value)}
                                    className="input-premium py-2 font-semibold"
                                  >
                                    <option value="editor">Editor (Access Restricted)</option>
                                    <option value="admin">Administrator (Full Access)</option>
                                  </select>
                                </div>
                                {createError && (
                                  <p className="text-xs font-bold text-rose-600">{createError}</p>
                                )}
                                {createSuccess && (
                                  <p className="text-xs font-bold text-emerald-600">{createSuccess}</p>
                                )}
                                <button 
                                  type="submit" 
                                  disabled={isCreatingAccount}
                                  className="btn-premium-primary w-full py-2 text-xs"
                                >
                                  {isCreatingAccount ? 'Creating Account...' : 'Create Account'}
                                </button>
                              </form>
                            </div>
                          )}
                          
                        </div>
                      </div>
                    )}

                    {/* Save Changes Floating Bar (Admin Only, for non-security sections) */}
                    {userRole === 'admin' && selectedSettingsSection !== 'security' && (
                      <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {isSettingsSaved ? '✓ All changes auto-saved to session profile' : 'Unsaved changes in workspace'}
                        </span>
                        <button 
                          onClick={handleSaveSettings}
                          className="btn-premium-primary px-8 py-2.5 h-11"
                        >
                          Apply Config
                        </button>
                      </div>
                    )}

                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  </div>
  );
}
