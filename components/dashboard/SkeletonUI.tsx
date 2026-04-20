'use client';

import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded bg-slate-200/50 relative overflow-hidden", className)}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

export function KpiSkeleton() {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-2 w-16 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-md" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-5">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-1.5">
             <Skeleton className="h-4 w-24 rounded" />
             <Skeleton className="h-2 w-16 rounded-full" />
          </div>
        </div>
      </td>
      <td className="px-6 py-5">
        <Skeleton className="h-5 w-20 rounded-full" />
      </td>
      <td className="px-6 py-5">
        <div className="flex justify-end">
          <Skeleton className="h-6 w-10 rounded" />
        </div>
      </td>
      <td className="px-6 py-5">
        <div className="flex justify-end gap-1.5">
          <Skeleton className="w-8 h-8 rounded" />
          <Skeleton className="w-8 h-8 rounded" />
          <Skeleton className="w-8 h-8 rounded" />
        </div>
      </td>
    </tr>
  );
}

