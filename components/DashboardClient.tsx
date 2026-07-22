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
  Zap,
  FileText
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
  const [editClientName, setEditClientName] = useState('');
  const [editClientCompany, setEditClientCompany] = useState('');
  const [editClientPhone, setEditClientPhone] = useState('');
  const [editClientEmail, setEditClientEmail] = useState('');
  const [editClientAddress, setEditClientAddress] = useState('');
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
    topCards: { card_id: string; count: number; client_name?: string; client_company?: string }[];
  } | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  // PI Generator States
  const [piInvoiceNo, setPiInvoiceNo] = useState(() => {
    const year = new Date().getFullYear().toString().slice(-2);
    const nextYear = (new Date().getFullYear() + 1).toString().slice(-2);
    const rand = Math.floor(100 + Math.random() * 900);
    return `PG/${year}-${nextYear}/${rand}`;
  });
  const [piDate, setPiDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [piProjectStart, setPiProjectStart] = useState(() => new Date().toISOString().split('T')[0]);
  const [piProjectEnd, setPiProjectEnd] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
  const [piClientId, setPiClientId] = useState('');
  const [piClientName, setPiClientName] = useState('');
  const [piClientEmail, setPiClientEmail] = useState('');
  const [piClientMobile, setPiClientMobile] = useState('');
  const [piClientAddress, setPiClientAddress] = useState('');
  
  const [piProducts, setPiProducts] = useState<Array<{
    description: string;
    hsnSac: string;
    quantity: number;
    rate: number;
  }>>([
    { description: 'IT Consulting & Cloud Infrastructure Services', hsnSac: '998311', quantity: 1, rate: 45000 },
    { description: 'Social Media Marketing & Brand Strategy (1 Month)', hsnSac: '998371', quantity: 1, rate: 35000 }
  ]);
  const piTotalAmount = piProducts.reduce((sum, p) => sum + (p.quantity * p.rate || 0), 0);
  const [isPiSubmitting, setIsPiSubmitting] = useState(false);
  const [piSubmitMessage, setPiSubmitMessage] = useState('');
  const [piSubmitStatus, setPiSubmitStatus] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleAddPiProduct = () => {
    setPiProducts([...piProducts, { description: '', hsnSac: '', quantity: 1, rate: 0 }]);
  };

  const handleRemovePiProduct = (index: number) => {
    setPiProducts(piProducts.filter((_, i) => i !== index));
  };

  const handleUpdatePiProduct = (index: number, field: string, value: any) => {
    const updated = piProducts.map((p, i) => {
      if (i === index) {
        return { ...p, [field]: value };
      }
      return p;
    });
    setPiProducts(updated);
  };

  const numberToRupeesWords = (num: number): string => {
    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return 'Zero';

    const g = (n: number): string => {
      if (n < 20) return a[n];
      const digit = n % 10;
      return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
    };

    const convert = (n: number): string => {
      if (n < 100) return g(n);
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
      if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
      if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
      return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
    };

    const parts = num.toFixed(2).split('.');
    const whole = parseInt(parts[0]);
    const decimal = parseInt(parts[1]);

    let str = convert(whole) + ' Rupees';
    if (decimal > 0) {
      str += ' and ' + g(decimal) + ' Paise';
    }
    return str + ' Only';
  };

  const handleSaveAndDownloadPi = async () => {
    if (!piClientName || !piClientEmail || !piClientMobile || !piClientId) {
      alert('Please fill all client details and Asset/Client ID');
      return;
    }
    setIsPiSubmitting(true);
    setPiSubmitStatus('');
    setPiSubmitMessage('');
    
    try {
      const element = document.getElementById('printable-pi-invoice');
      if (!element) {
        throw new Error('Invoice element not found');
      }

      if (!(window as any).html2pdf) {
        alert('PDF library is still loading. Please try again in a few seconds.');
        setIsPiSubmitting(false);
        return;
      }

      // Create an iframe to isolate the element from Tailwind CSS v4 stylesheets containing "oklch" or "lab" colors
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '800px';
      iframe.style.height = '1050px';
      iframe.style.top = '-10000px';
      iframe.style.left = '-10000px';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Could not create isolated print context');
      }

      const logoUrl = window.location.origin + '/PINNACLE_GRID_LOGO.png';

      // Write standard HTML layout to the iframe with inline styling to guarantee a 1-page premium look
      iframeDoc.write(`
        <html>
          <head>
            <title>Proforma Invoice</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                color: #000000;
                margin: 0;
                padding: 0;
                background-color: #ffffff;
                -webkit-print-color-adjust: exact;
              }
              .invoice-container {
                width: 740px;
                margin: 0 auto;
                padding: 20px;
                box-sizing: border-box;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              .text-navy {
                color: #1e3a8a;
              }
              .bg-navy {
                background-color: #1e3a8a;
              }
              .border-cell {
                border: 1px solid #cbd5e1;
                padding: 8px 10px;
              }
            </style>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
          </head>
          <body>
            <div id="print-content" class="invoice-container">
              <!-- Top Header -->
              <table style="width: 100%; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 18px;">
                <tr>
                  <td style="vertical-align: top;">
                    <img src="${logoUrl}" style="height: 46px; width: auto; object-fit: contain;" />
                    <div style="font-size: 14px; font-weight: 800; color: #1e3a8a; margin-top: 4px;">Pinnacle Grid Skill Innovations LLP</div>
                    <div style="font-size: 9px; font-weight: bold; font-style: italic; color: #1e3a8a; margin-top: 2px;">Make Your Brand InExorable</div>
                  </td>
                  <td style="text-align: right; font-size: 10px; color: #000000; line-height: 1.4; vertical-align: top;">
                    <strong style="color: #1e3a8a;">Pinnacle Grid Skill Innovations LLP</strong><br/>
                    Hyderabad, Telangana, India<br/>
                    Contact: +91 9100305750<br/>
                    Email: <a href="mailto:info@pinnaclegrid.com" style="color: #1e3a8a; text-decoration: none; font-weight: bold;">info@pinnaclegrid.com</a> | website: <a href="https://pinnaclegrid.com" target="_blank" style="color: #1e3a8a; text-decoration: none; font-weight: bold;">pinnaclegrid.com</a>
                  </td>
                </tr>
              </table>

              <!-- Title -->
              <div style="text-align: center; margin: 18px 0;">
                <span style="font-size: 16px; font-weight: 900; letter-spacing: 0.1em; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 2px; text-transform: uppercase;">PROFORMA INVOICE</span>
              </div>

              <!-- Details Block -->
              <table style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 18px; background-color: #f8fafc; font-size: 11px; color: #000000;">
                <tr>
                  <td style="width: 50%; padding: 10px; vertical-align: top; border-right: 1px solid #cbd5e1; line-height: 1.6;">
                    <strong style="font-size: 9px; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">Invoice Details</strong>
                    <span style="color: #000000;">Invoice No:</span> <span style="color: #000000;">${piInvoiceNo}</span><br/>
                    <span style="color: #000000;">Invoice Date:</span> <span style="color: #000000;">${piDate}</span>
                  </td>
                  <td style="width: 50%; padding: 10px; vertical-align: top; line-height: 1.6;">
                    <strong style="font-size: 9px; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">Reference Info</strong>
                    <span style="color: #000000;">Place of Supply:</span> <span style="color: #000000;">${piClientAddress || 'N/A'}</span><br/>
                    <span style="color: #000000;">Client / Ref ID:</span> <span style="color: #000000;">${piClientId || 'N/A'}</span>
                  </td>
                </tr>
              </table>

              <!-- Customer Details -->
              <table style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 18px; background-color: #ffffff; font-size: 11px; color: #000000;">
                <tr>
                  <td style="padding: 10px; vertical-align: top; width: 65%;">
                    <strong style="font-size: 9px; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">Client Details & Billing Composition</strong>
                    <strong style="font-size: 12px; color: #000000; display: block; margin-bottom: 4px;">${piClientName || 'Client Name'}</strong>
                    <div style="color: #000000; margin-top: 4px; white-space: pre-wrap; line-height: 1.4;">${piClientAddress || 'Billing Address...'}</div>
                  </td>
                  <td style="padding: 10px; vertical-align: top; text-align: right; color: #000000; line-height: 1.6; width: 35%;">
                    <span>Email: <a href="mailto:${piClientEmail}" style="color: #1e3a8a; text-decoration: none; font-weight: bold;">${piClientEmail || 'client@email.com'}</a></span><br/>
                    <span>Mobile: <span style="color: #000000;">${piClientMobile || '+91 99999 99999'}</span></span>
                  </td>
                </tr>
              </table>

              <!-- Products Table -->
              <table style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; margin-bottom: 18px; font-size: 11px; color: #000000;">
                <thead>
                  <tr style="background-color: #f1f5f9; color: #000000; font-size: 9px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em; text-align: left; border-bottom: 1px solid #cbd5e1;">
                    <th style="padding: 8px 12px; border-right: 1px solid #cbd5e1; color: #1e3a8a;">Service / Product Description</th>
                    <th style="padding: 8px 12px; text-align: center; width: 80px; border-right: 1px solid #cbd5e1; color: #1e3a8a;">HSN/SAC</th>
                    <th style="padding: 8px 12px; text-align: center; width: 60px; border-right: 1px solid #cbd5e1; color: #1e3a8a;">Qty</th>
                    <th style="padding: 8px 12px; text-align: right; width: 100px; border-right: 1px solid #cbd5e1; color: #1e3a8a;">Rate (₹)</th>
                    <th style="padding: 8px 12px; text-align: right; width: 110px; color: #1e3a8a;">Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  ${piProducts.map((p, idx) => `
                    <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-top: 1px solid #cbd5e1;">
                      <td style="padding: 10px 12px; font-weight: bold; color: #000000; border-right: 1px solid #cbd5e1;">${p.description || 'Service Description'}</td>
                      <td style="padding: 10px 12px; text-align: center; font-family: monospace; color: #000000; border-right: 1px solid #cbd5e1;">${p.hsnSac || '-'}</td>
                      <td style="padding: 10px 12px; text-align: center; color: #000000; border-right: 1px solid #cbd5e1;">${p.quantity}</td>
                      <td style="padding: 10px 12px; text-align: right; font-weight: bold; color: #000000; border-right: 1px solid #cbd5e1;">₹${(p.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td style="padding: 10px 12px; text-align: right; font-weight: bold; color: #000000;">₹${(p.quantity * p.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  `).join('')}
                  <tr style="background-color: #f8fafc; border-top: 2px solid #cbd5e1; font-weight: bold;">
                    <td colspan="3" style="padding: 8px 12px; text-align: right; color: #000000; border-right: 1px solid #cbd5e1;">Total Amount</td>
                    <td colspan="2" style="padding: 8px 12px; text-align: right; color: #000000; font-size: 12px; font-weight: 800;">₹${piTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr style="background-color: #f1f5f9; border-top: 1px solid #cbd5e1; font-weight: 800; font-size: 12px;">
                    <td colspan="3" style="padding: 10px 12px; text-align: right; color: #000000; border-right: 1px solid #cbd5e1;">Total Payable Amount</td>
                    <td colspan="2" style="padding: 10px 12px; text-align: right; color: #1e3a8a; font-size: 13px; font-weight: 900;">₹${piTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Amount in Words -->
              <div style="font-size: 11px; color: #000000; font-style: italic; margin-bottom: 20px; padding: 0 4px;">
                Net Payable to Pinnacle Grid Skill Innovations LLP: <strong style="color: #000000; font-style: normal;">Rs. ${numberToRupeesWords(piTotalAmount)}</strong>
              </div>

              <!-- Banking & Legal -->
              <table style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 20px; background-color: #f8fafc; font-size: 11px; color: #000000;">
                <tr>
                  <td style="padding: 12px; vertical-align: middle; line-height: 1.6; width: 65%;">
                    <strong style="font-size: 9px; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">BANKING & PAYMENT INFO</strong>
                    <span style="color: #000000;">In Favour of:</span> <span style="color: #000000; font-weight: bold;">PINNACLE GRID SKILLS AND INNOVATION LLP</span><br/>
                    <span style="color: #000000;">Name Of the Bank:</span> <span style="color: #000000;">Punjab National Bank</span><br/>
                    <span style="color: #000000;">Current Account No:</span> <strong style="font-family: monospace; color: #000000;">8789002100003460</strong><br/>
                    <span style="color: #000000;">IFSC Code:</span> <strong style="font-family: monospace; color: #000000;">PUNB0878900</strong><br/>
                    <span style="color: #000000;">UPI ID:</span> <strong style="font-family: monospace; color: #000000;">9100305750m@pnb</strong>
                  </td>
                  <td style="width: 35%; border-left: 1px solid #cbd5e1; padding: 12px; text-align: center; vertical-align: middle;">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('upi://pay?pa=9100305750m@pnb&pn=PINNACLE GRID SKILLS AND INNOVATION LLP')}" style="width: 110px; height: 110px; object-fit: contain; margin-bottom: 4px;" /><br/>
                    <span style="font-size: 8px; font-weight: bold; color: #000000; letter-spacing: 0.05em; text-transform: uppercase;">Scan to Pay via UPI</span>
                  </td>
                </tr>
              </table>

              <!-- Compliance Policies -->
              <div style="margin-bottom: 20px; padding: 0 4px; color: #000000;">
                <strong style="font-size: 10px; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">POLICIES & LEGAL COMPLIANCE</strong>
                <ul style="margin: 0; padding-left: 15px; font-size: 9.5px; color: #000000; line-height: 1.5; list-style-type: disc;">
                  <li style="margin-bottom: 4px;">All services are governed by the Master Service Agreement (MSA) signed between the parties.</li>
                  <li style="margin-bottom: 4px;">Payments must be cleared within 7 days of invoice date to avoid service disruption.</li>
                  <li style="margin-bottom: 4px;">Pinnacle Grid is not liable for performance variations caused by third-party platform updates (Google, Meta, etc.).</li>
                  <li style="margin-bottom: 4px;">Intellectual property transfer of deliverables occurs only upon full receipt of the invoiced amount.</li>
                  <li style="margin-bottom: 4px;">Post-implementation support & maintenance will be billed separately unless explicitly included.</li>
                  <li style="margin-bottom: 4px;">Jurisdiction: Disputes, if any, shall be subject exclusively to the courts of Hyderabad, Telangana.</li>
                </ul>
              </div>

              <!-- Footer -->
              <div style="border-top: 2px solid #1e3a8a; padding-top: 10px; margin-top: 20px; text-align: center; color: #000000;">
                <div style="font-size: 10px; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 2px;">Thank you for choosing Pinnacle Grid Skill Innovations LLP</div>
                <div style="font-size: 8px; font-weight: bold; color: #000000;">
                  Make Your Brand InExorable | 
                  website: <a href="https://pinnaclegrid.com" target="_blank" style="color: #1e3a8a; text-decoration: none; font-weight: bold;">pinnaclegrid.com</a> | 
                  Email: <a href="mailto:info@pinnaclegrid.com" style="color: #1e3a8a; text-decoration: none; font-weight: bold;">info@pinnaclegrid.com</a>
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
      iframeDoc.close();

      // Wait a moment for any image (logo/QR) to load and html2pdf to initialize inside the iframe
      await new Promise((resolve) => {
        iframe.onload = () => {
          setTimeout(resolve, 800);
        };
        // Fallback in case load event already fired
        setTimeout(resolve, 1000);
      });

      const printElement = iframeDoc.getElementById('print-content');
      const iframeWindow = iframe.contentWindow;
      if (!printElement || !iframeWindow || !(iframeWindow as any).html2pdf) {
        throw new Error('Isolated print content or library context not found');
      }

      const opt = {
        margin: 0.15,
        filename: `PI_${piInvoiceNo.replace(/\//g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      // Generate PDF data uri string calling the isolated html2pdf in the iframe window
      const pdfBase64 = await (iframeWindow as any).html2pdf().from(printElement).set(opt).outputPdf('datauristring');

      // Post payload to GAS webapp
      const payload = {
        userdetails: {
          id: piClientId,
          name: piClientName,
          mobile: String(piClientMobile),
          email: piClientEmail,
          invoiceno: piInvoiceNo,
          invoice: {
            data: pdfBase64,
            mimeType: 'application/pdf',
            fileName: `PI_${piInvoiceNo.replace(/\//g, '_')}.pdf`
          }
        }
      };

      try {
        await fetch('https://script.google.com/macros/s/AKfycbw0t02kFENnSvM6GAa9FXvQPsRO956_cUGH7dCcEdeqGR4ugtlEmoUmXpGcnqS2T7q6gw/exec', {
          method: 'POST',
          body: JSON.stringify(payload),
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          }
        });
      } catch (apiErr) {
        console.warn('API call redirect handled:', apiErr);
      }

      // Trigger download directly in the parent window using the base64 PDF data URI
      const link = document.createElement('a');
      link.href = pdfBase64;
      link.download = `PI_${piInvoiceNo.replace(/\//g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up isolated iframe
      document.body.removeChild(iframe);

      setPiSubmitStatus('success');
      setPiSubmitMessage('PI saved to sheet and downloaded successfully!');
    } catch (err: any) {
      console.error(err);
      setPiSubmitStatus('error');
      setPiSubmitMessage(`Failed to generate PI: ${err.message || err.toString()}`);
    } finally {
      setIsPiSubmitting(false);
    }
  };

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
          is_activated: true,
          client_name: editClientName,
          client_company: editClientCompany,
          client_phone: editClientPhone,
          client_email: editClientEmail,
          client_address: editClientAddress
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
    const matchesSearch = c.card_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.client_company || '').toLowerCase().includes(searchTerm.toLowerCase());
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
      { id: 'generate-pi', icon: FileText, label: 'Generate PI' },
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

      {/* EDIT URL & CLIENT MODAL */}
      {editingCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditingCard(null)} />
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200 border border-slate-200 my-8">
            <button 
              onClick={() => setEditingCard(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
            >
              <X size={20} />
            </button>
            
            <div className="mb-6 pb-4 border-b border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary shrink-0">
                <CreditCard size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Asset Configuration & Client Assignment</h3>
                <p className="text-slate-400 font-semibold text-xs mt-0.5">Configure hardware target routing and customer details mapping for Serial: <span className="font-mono text-primary bg-primary/5 px-2 py-0.5 rounded">{editingCard.card_id}</span></p>
              </div>
            </div>

            <form onSubmit={handleUpdateUrl} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Destination URL</label>
                <input 
                  type="url"
                  required
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://connect.pinnaclegrid.com/profile/client-id"
                  className="input-premium text-xs focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-[10px] text-slate-400 font-medium px-0.5 leading-normal">
                  The dynamic target website users are redirected to when scanning the physical NFC card.
                </p>
              </div>

              <div className="space-y-4 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Client Identity</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Client Name</label>
                    <input 
                      type="text"
                      value={editClientName}
                      onChange={(e) => setEditClientName(e.target.value)}
                      placeholder="e.g. Sri Sant"
                      className="input-premium text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Company Name</label>
                    <input 
                      type="text"
                      value={editClientCompany}
                      onChange={(e) => setEditClientCompany(e.target.value)}
                      placeholder="e.g. Sri Sant Krupa Dry Nuts"
                      className="input-premium text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Mobile Number</label>
                    <input 
                      type="tel"
                      value={editClientPhone}
                      onChange={(e) => setEditClientPhone(e.target.value)}
                      placeholder="e.g. 9100305750"
                      className="input-premium text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                    <input 
                      type="email"
                      value={editClientEmail}
                      onChange={(e) => setEditClientEmail(e.target.value)}
                      placeholder="e.g. contact@domain.com"
                      className="input-premium text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Physical Address</label>
                  <textarea 
                    value={editClientAddress}
                    onChange={(e) => setEditClientAddress(e.target.value)}
                    placeholder="e.g. Suite 101, Nagarjuna Nagar, Hyderabad"
                    rows={2}
                    className="input-premium py-2 resize-none text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="btn-premium-primary flex-1 py-2.5 h-11"
                >
                  {isUpdating ? 'Saving...' : 'Update & Save Configuration'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingCard(null)}
                  className="btn-premium-secondary px-8 py-2.5 h-11"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <aside className="w-64 shrink-0 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <Link href="/" className="flex items-center mb-10 pl-2">
            <img src="/PINNACLE_GRID_LOGO.png" alt="Pinnacle Grid Logo" className="h-8 w-auto object-contain" />
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
              <Link href="/" className="flex items-center">
                <img src="/PINNACLE_GRID_LOGO.png" alt="Pinnacle Grid Logo" className="h-8 w-auto object-contain" />
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
                    <p className="text-xs font-medium text-slate-900 truncate">{user?.email || 'info@pinnaclegrid.com'}</p>
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
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-white/70 transition-colors">
                                      {card.client_company || card.client_name 
                                        ? `${card.client_name}${card.client_name && card.client_company ? ' @ ' : ''}${card.client_company}` 
                                        : 'Pinnacle Asset'}
                                    </span>
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
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setEditingCard(card); 
                                        setEditUrl(card.review_url || ''); 
                                        setEditClientName(card.client_name || '');
                                        setEditClientCompany(card.client_company || '');
                                        setEditClientPhone(card.client_phone || '');
                                        setEditClientEmail(card.client_email || '');
                                        setEditClientAddress(card.client_address || '');
                                      }}
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
              
              {/* Stat Cards at Top */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { 
                    label: 'Avg Scans/Day', 
                    value: analyticsStats.avgScansPerDay, 
                    icon: Activity, 
                    bgColor: 'bg-primary/5', 
                    textColor: 'text-primary',
                    glow: 'hover:shadow-primary/5 hover:border-primary/30' 
                  },
                  { 
                    label: 'Peak Time', 
                    value: analyticsStats.peakTime, 
                    icon: Clock, 
                    bgColor: 'bg-indigo-50', 
                    textColor: 'text-indigo-600',
                    glow: 'hover:shadow-indigo-500/5 hover:border-indigo-500/30' 
                  },
                  { 
                    label: 'Unique Reach', 
                    value: analyticsStats.uniqueReach, 
                    icon: Smartphone, 
                    bgColor: 'bg-emerald-50', 
                    textColor: 'text-emerald-600',
                    glow: 'hover:shadow-emerald-500/5 hover:border-emerald-500/30' 
                  },
                  { 
                    label: 'System Health', 
                    value: analyticsStats.systemHealth, 
                    icon: CheckCircle2, 
                    bgColor: 'bg-emerald-50', 
                    textColor: 'text-emerald-600',
                    glow: 'hover:shadow-emerald-500/5 hover:border-emerald-500/30' 
                  },
                ].map((stat, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 hover:shadow-md",
                      stat.glow
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                       <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center transition-all group-hover:scale-105", stat.bgColor, stat.textColor)}>
                          <stat.icon size={16} />
                       </div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900 tracking-tight font-outfit">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Dynamic Analytics Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Graph Card */}
                <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300">
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
                            strokeWidth={4} 
                            fillOpacity={1} 
                            fill="url(#colorTaps)" 
                            activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
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
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Device breakdown</h4>
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
                         const progressColor = device.name === 'Mobile' ? 'bg-emerald-500' : device.name === 'Desktop' ? 'bg-primary' : 'bg-amber-500';
                         const lightGlow = device.name === 'Mobile' ? 'bg-emerald-50' : device.name === 'Desktop' ? 'bg-primary/5' : 'bg-amber-50';
                         const textGlow = device.name === 'Mobile' ? 'text-emerald-600' : device.name === 'Desktop' ? 'text-primary' : 'text-amber-600';
                         
                         return (
                           <div key={device.name} className="space-y-2 p-2 rounded-lg hover:bg-slate-50/50 transition-all">
                             <div className="flex justify-between items-center text-xs">
                               <span className="font-semibold text-slate-500 flex items-center gap-2">
                                 <div className={cn("p-1.5 rounded-md", lightGlow, textGlow)}>
                                   <Icon size={12} className="shrink-0" />
                                 </div>
                                 {device.name}
                               </span>
                               <span className="font-extrabold text-slate-800">
                                 {device.percentage}% <span className="text-[10px] text-slate-400 font-medium">({device.value})</span>
                               </span>
                             </div>
                             <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                               <div 
                                 className={cn("h-full rounded-full transition-all duration-700", progressColor)} 
                                 style={{ width: `${device.percentage}%` }}
                               />
                             </div>
                           </div>
                         );
                       })}
                    </div>
                  </div>

                  {/* Top Performing Cards */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1 hover:shadow-md transition-all duration-300">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Top active assets</h4>
                    {(!analyticsData?.topCards || analyticsData.topCards.length === 0) ? (
                      <div className="text-center py-6 text-slate-400 text-xs font-medium">
                        No taps recorded in this timeframe
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {analyticsData.topCards.map((card) => (
                          <div key={card.card_id} className="flex justify-between items-center p-2.5 rounded-lg hover:bg-slate-50/80 transition-all border border-transparent hover:border-slate-100/50">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] shadow-sm shrink-0",
                                card.client_company 
                                  ? 'bg-gradient-to-tr from-primary/10 to-indigo-600/10 text-primary'
                                  : 'bg-slate-100 text-slate-400'
                              )}>
                                {card.client_name ? card.client_name.slice(0, 2).toUpperCase() : card.card_id.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-slate-800 truncate font-inter tracking-tight leading-tight">
                                  {card.client_name || card.card_id}
                                </span>
                                <span className="text-[9px] font-semibold text-slate-400 truncate leading-none mt-0.5">
                                  {card.client_company ? `${card.client_company} (${card.card_id})` : 'Pinnacle Asset'}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-full shrink-0">{card.count} taps</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
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

          {activeTab === 'generate-pi' && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-outfit">Proforma Invoice Generator</h2>
                <p className="text-slate-500 font-medium text-xs mt-1">Design, preview, and provision a professional proforma invoice for corporate clients.</p>
              </div>

              {piSubmitStatus && (
                <div className={cn(
                  "p-4 rounded-xl border font-semibold text-xs transition-all duration-300",
                  piSubmitStatus === 'success' ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"
                )}>
                  {piSubmitMessage}
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                {/* FORM CONTROLS PANEL */}
                <div className="xl:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Client & Invoice Information</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Name</label>
                        <input 
                          type="text" 
                          value={piClientName} 
                          onChange={(e) => setPiClientName(e.target.value)} 
                          placeholder="e.g. Acme Corporation" 
                          className="input-premium text-xs focus:ring-primary/20 focus:border-primary" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Email</label>
                        <input 
                          type="email" 
                          value={piClientEmail} 
                          onChange={(e) => setPiClientEmail(e.target.value)} 
                          placeholder="e.g. accounts@acme.com" 
                          className="input-premium text-xs focus:ring-primary/20 focus:border-primary" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Mobile</label>
                        <input 
                          type="text" 
                          value={piClientMobile} 
                          onChange={(e) => setPiClientMobile(e.target.value)} 
                          placeholder="e.g. +91 9876543210" 
                          className="input-premium text-xs focus:ring-primary/20 focus:border-primary" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset / Client ID</label>
                        <input 
                          type="text" 
                          value={piClientId} 
                          onChange={(e) => setPiClientId(e.target.value)} 
                          placeholder="e.g. NFC-PG-001 or CLI-09" 
                          className="input-premium text-xs font-mono focus:ring-primary/20 focus:border-primary" 
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Address</label>
                      <textarea 
                        value={piClientAddress} 
                        onChange={(e) => setPiClientAddress(e.target.value)} 
                        placeholder="e.g. Suite 404, Cyber Towers, Hitec City, Hyderabad" 
                        rows={2}
                        className="input-premium text-xs py-2 resize-none focus:ring-primary/20 focus:border-primary" 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice Number</label>
                        <input 
                          type="text" 
                          value={piInvoiceNo} 
                          onChange={(e) => setPiInvoiceNo(e.target.value)} 
                          className="input-premium text-xs font-mono focus:ring-primary/20 focus:border-primary" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice Date</label>
                        <input 
                          type="date" 
                          value={piDate} 
                          onChange={(e) => setPiDate(e.target.value)} 
                          className="input-premium text-xs focus:ring-primary/20 focus:border-primary" 
                        />
                      </div>
                    </div>

                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Line Items (Products/Services)</h3>
                      <button 
                        type="button" 
                        onClick={handleAddPiProduct}
                        className="text-[10px] font-bold text-primary bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded transition-colors"
                      >
                        + Add Item
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                      {piProducts.map((prod, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-3 relative">
                          <button 
                            type="button" 
                            onClick={() => handleRemovePiProduct(idx)}
                            className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                          
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                            <input 
                              type="text" 
                              value={prod.description} 
                              onChange={(e) => handleUpdatePiProduct(idx, 'description', e.target.value)} 
                              placeholder="e.g. SEO Optimization Campaign" 
                              className="input-premium text-xs bg-white focus:ring-primary/20 focus:border-primary" 
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SAC/HSN</label>
                              <input 
                                type="text" 
                                value={prod.hsnSac} 
                                onChange={(e) => handleUpdatePiProduct(idx, 'hsnSac', e.target.value)} 
                                placeholder="998311" 
                                className="input-premium text-xs bg-white font-mono focus:ring-primary/20 focus:border-primary" 
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Qty/Days</label>
                              <input 
                                type="number" 
                                value={prod.quantity} 
                                onChange={(e) => handleUpdatePiProduct(idx, 'quantity', Number(e.target.value))} 
                                className="input-premium text-xs bg-white focus:ring-primary/20 focus:border-primary" 
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rate (₹)</label>
                              <input 
                                type="number" 
                                value={prod.rate} 
                                onChange={(e) => handleUpdatePiProduct(idx, 'rate', Number(e.target.value))} 
                                className="input-premium text-xs bg-white focus:ring-primary/20 focus:border-primary" 
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      type="button" 
                      disabled={isPiSubmitting}
                      onClick={handleSaveAndDownloadPi}
                      className="btn-premium-primary w-full py-3 h-12 flex items-center justify-center gap-2"
                    >
                      {isPiSubmitting ? 'Saving and Generating PDF...' : 'Save & Download Proforma Invoice'}
                    </button>
                  </div>
                </div>

                {/* INVOICE LIVE PREVIEW PANEL */}
                <div className="xl:col-span-3">
                  <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 shadow-inner flex justify-center overflow-x-auto">
                    <div 
                      id="printable-pi-invoice" 
                      className="w-[800px] min-h-[1050px] bg-white p-8 shadow-2xl relative flex flex-col justify-between font-sans text-black border border-slate-300"
                      style={{ fontSize: '12px', lineHeight: '1.4' }}
                    >
                      {/* Top Header */}
                      <div>
                        <div className="flex justify-between items-start border-b-2 border-slate-200 pb-4 mb-4 text-black">
                          <div className="flex items-center gap-3">
                            <img src="/PINNACLE_GRID_LOGO.png" alt="Pinnacle Grid Logo" className="h-12 w-auto object-contain" />
                            <div>
                              <h1 className="text-base font-extrabold text-[#1e3a8a] tracking-tight">Pinnacle Grid Skill Innovations LLP</h1>
                              <p className="text-[9px] text-[#1e3a8a] font-bold italic tracking-wide mt-0.5">Make Your Brand InExorable</p>
                            </div>
                          </div>
                          <div className="text-right text-[10px] text-black space-y-0.5">
                            <p className="font-bold text-[#1e3a8a]">Pinnacle Grid Skill Innovations LLP</p>
                            <p>Hyderabad, Telangana, India</p>
                            <p>Contact: +91 9100305750</p>
                            <p>Email: <a href="mailto:info@pinnaclegrid.com" className="text-[#1e3a8a] font-bold hover:underline">info@pinnaclegrid.com</a> | website: <a href="https://pinnaclegrid.com" target="_blank" className="text-[#1e3a8a] font-bold hover:underline">pinnaclegrid.com</a></p>
                          </div>
                        </div>

                        {/* Invoice Title */}
                        <div className="text-center my-4">
                          <h2 className="text-lg font-black tracking-widest text-[#1e3a8a] border-b-2 border-[#1e3a8a] pb-1 inline-block">PROFORMA INVOICE</h2>
                        </div>

                        {/* Invoice Details Block */}
                        <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded-lg p-3 mb-4 bg-slate-50/50 text-black">
                          <div className="space-y-1">
                            <p className="text-[10px] text-[#1e3a8a] font-extrabold uppercase tracking-wider">Invoice details</p>
                            <div className="grid grid-cols-3 gap-1 text-[11px] text-black">
                              <span className="font-bold">Invoice No</span>
                              <span className="col-span-2 font-normal">: {piInvoiceNo}</span>

                              <span className="font-bold">Invoice Date</span>
                              <span className="col-span-2 font-normal">: {piDate}</span>
                            </div>
                          </div>
                          <div className="space-y-1 border-l border-slate-300 pl-4">
                            <p className="text-[10px] text-[#1e3a8a] font-extrabold uppercase tracking-wider">Reference Info</p>
                            <div className="grid grid-cols-3 gap-1 text-[11px] text-black">
                              <span className="font-bold">Place of Supply</span>
                              <span className="col-span-2 font-normal">: {piClientAddress || 'N/A'}</span>

                              <span className="font-bold">Client / Ref ID</span>
                              <span className="col-span-2 font-normal">: {piClientId || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Client details Composition */}
                        <div className="border border-slate-300 rounded-lg p-3 mb-4 bg-white text-black">
                          <p className="text-[10px] text-[#1e3a8a] font-extrabold uppercase tracking-wider mb-1.5">Client Details & Billing Composition</p>
                          <div className="grid grid-cols-2 gap-4 text-black">
                            <div>
                              <p className="text-xs font-bold text-black">{piClientName || 'Client Name'}</p>
                              <p className="text-[11px] text-black mt-1 leading-relaxed whitespace-pre-wrap">{piClientAddress || 'Billing Address...'}</p>
                            </div>
                            <div className="text-right text-[11px] space-y-0.5 text-black">
                              <p><span className="font-bold">Email:</span> <a href={`mailto:${piClientEmail}`} className="text-[#1e3a8a] font-bold hover:underline">{piClientEmail || 'client@email.com'}</a></p>
                              <p><span className="font-bold">Mobile:</span> <span className="font-normal">{piClientMobile || '+91 99999 99999'}</span></p>
                            </div>
                          </div>
                        </div>

                        {/* Products / Services Table */}
                        <div className="border border-slate-300 rounded-lg overflow-hidden mb-4">
                          <table className="w-full text-left border-collapse text-black">
                            <thead>
                              <tr className="bg-slate-100 text-[10px] font-bold text-black uppercase border-b border-slate-300">
                                <th className="px-4 py-2 border-r border-slate-300 text-[#1e3a8a]">Service / Product Description</th>
                                <th className="px-4 py-2 text-center w-24 border-r border-slate-300 text-[#1e3a8a]">HSN/SAC</th>
                                <th className="px-4 py-2 text-center w-20 border-r border-slate-300 text-[#1e3a8a]">Days/Qty</th>
                                <th className="px-4 py-2 text-right w-28 border-r border-slate-300 text-[#1e3a8a]">Rate (₹)</th>
                                <th className="px-4 py-2 text-right w-32 text-[#1e3a8a]">Total (₹)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-300 text-black text-xs">
                              {piProducts.map((p, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="px-4 py-3 font-semibold text-black border-r border-slate-300">{p.description || 'Service Description'}</td>
                                  <td className="px-4 py-3 text-center font-mono text-black border-r border-slate-300">{p.hsnSac || '-'}</td>
                                  <td className="px-4 py-3 text-center border-r border-slate-300">{p.quantity}</td>
                                  <td className="px-4 py-3 text-right font-semibold border-r border-slate-300">₹{(p.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                  <td className="px-4 py-3 text-right font-bold text-black">₹{(p.quantity * p.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                </tr>
                              ))}
                              {/* Totals Section */}
                              <tr className="bg-slate-50/30 text-[11px] border-t border-slate-300">
                                <td colSpan={3} className="px-4 py-2 text-right font-bold text-black border-r border-slate-300">Total Amount</td>
                                <td colSpan={2} className="px-4 py-2 text-right font-bold text-black">₹{piTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                              </tr>
                              <tr className="bg-slate-50 border-t border-slate-300 text-[11px]">
                                <td colSpan={3} className="px-4 py-2.5 text-right font-extrabold text-black border-r border-slate-300">Total Payable Amount</td>
                                <td colSpan={2} className="px-4 py-2.5 text-right font-extrabold text-[#1e3a8a] text-sm">₹{piTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Amount in words */}
                        <div className="mb-4 px-2 text-black">
                          <p className="text-[11px] italic">
                            Net Payable to Pinnacle Grid Skill Innovations LLP: <span className="font-bold not-italic">Rs. {numberToRupeesWords(piTotalAmount)}</span>
                          </p>
                        </div>
                      </div>

                      {/* Bottom Section */}
                      <div className="space-y-4 pt-4 border-t border-slate-200">
                        {/* Banking Info */}
                        <div className="grid grid-cols-3 gap-4 border border-slate-300 rounded-lg p-3 bg-slate-50/40 items-center text-black">
                          <div className="col-span-2 space-y-1 text-[11px]">
                            <h4 className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider mb-1">BANKING & PAYMENT INFO</h4>
                            <p><span className="font-semibold">In Favour of:</span> <span className="font-bold">PINNACLE GRID SKILLS AND INNOVATION LLP</span></p>
                            <p><span className="font-semibold">Name Of the Bank:</span> <span className="font-normal">Punjab National Bank</span></p>
                            <p><span className="font-semibold">Current Account No:</span> <span className="font-mono font-bold">8789002100003460</span></p>
                            <p><span className="font-semibold">IFSC Code:</span> <span className="font-mono font-bold">PUNB0878900</span></p>
                            <p><span className="font-semibold">UPI ID:</span> <span className="font-mono font-bold">9100305750m@pnb</span></p>
                          </div>
                          <div className="flex flex-col items-center justify-center border-l border-slate-300 pl-4 py-1">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('upi://pay?pa=9100305750m@pnb&pn=PINNACLE GRID SKILLS AND INNOVATION LLP')}`} 
                              alt="Payment QR" 
                              className="w-28 h-28 object-contain mb-1" 
                            />
                            <span className="text-[8px] font-bold text-black tracking-wider">Scan to Pay via UPI</span>
                          </div>
                        </div>

                        {/* Policies and legal compliance */}
                        <div className="space-y-1 px-1 text-black">
                          <h4 className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-widest">POLICIES & LEGAL COMPLIANCE</h4>
                          <ul className="list-disc pl-4 text-[9px] space-y-0.5 leading-normal">
                            <li>All services are governed by the Master Service Agreement (MSA) signed between the parties.</li>
                            <li>Payments must be cleared within 7 days of invoice date to avoid service disruption.</li>
                            <li>Pinnacle Grid is not liable for performance variations caused by third-party platform updates (Google, Meta, etc.).</li>
                            <li>Intellectual property transfer of deliverables occurs only upon full receipt of the invoiced amount.</li>
                            <li>Post-implementation support & maintenance will be billed separately unless explicitly included.</li>
                            <li>Jurisdiction: Disputes, if any, shall be subject exclusively to the courts of Hyderabad, Telangana.</li>
                          </ul>
                        </div>

                        {/* Footer details banner */}
                        <div className="border-t-2 border-slate-200 pt-3 text-center space-y-0.5 mt-2 text-black">
                          <p className="text-[10px] font-bold tracking-wide">Thank you for choosing Pinnacle Grid Skill Innovations LLP</p>
                          <p className="text-[8px] font-bold">
                            Make Your Brand InExorable | 
                            website: <a href="https://pinnaclegrid.com" target="_blank" className="text-[#1e3a8a] hover:underline">pinnaclegrid.com</a> | 
                            Email: <a href="mailto:info@pinnaclegrid.com" className="text-[#1e3a8a] hover:underline">info@pinnaclegrid.com</a>
                          </p>
                        </div>
                      </div>
                    </div>
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
