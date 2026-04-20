'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  className?: string;
}

const variants = {
  primary: {
    bg: 'bg-white',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/5',
    border: 'border-slate-200'
  },
  secondary: {
    bg: 'bg-white',
    iconColor: 'text-slate-600',
    iconBg: 'bg-slate-100',
    border: 'border-slate-200'
  },
  success: {
    bg: 'bg-white',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    border: 'border-slate-200'
  },
  warning: {
    bg: 'bg-white',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    border: 'border-slate-200'
  }
};

export function KpiCard({ label, value, icon: Icon, variant = 'primary', className }: KpiCardProps) {
  const styles = variants[variant];

  return (
    <div className={cn(
      "relative bg-white p-6 rounded-xl border premium-shadow transition-all duration-200 hover:shadow-md",
      styles.border,
      className
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-300",
          styles.iconBg
        )}>
          <Icon className={cn("w-6 h-6", styles.iconColor)} />
        </div>
        
        <div className="flex flex-col">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-inter">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}

