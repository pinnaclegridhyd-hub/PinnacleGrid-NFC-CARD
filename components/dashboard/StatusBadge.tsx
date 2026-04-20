'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  isActivated: boolean;
  className?: string;
}

export function StatusBadge({ isActivated, className }: StatusBadgeProps) {
  if (isActivated) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-100",
        className
      )}>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span className="tracking-wider">ACTIVE</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50/50 text-amber-700 rounded-full text-[10px] font-bold border border-amber-100",
      className
    )}>
      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
      <span className="tracking-wider">PENDING</span>
    </div>
  );
}

