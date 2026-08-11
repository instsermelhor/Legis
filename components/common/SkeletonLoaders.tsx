/**
 * components/common/SkeletonLoaders.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — UI SKELETON & SHIMMER LOADERS
 * Componentes de carregamento elegante com efeito shimmer para evitar layouts brutos.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';

export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-6 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 animate-pulse ${className}`}>
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 rounded-2xl bg-gray-300 dark:bg-white/10" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-300 dark:bg-white/10 rounded-lg w-1/2" />
        <div className="h-3 bg-gray-200 dark:bg-white/5 rounded-lg w-1/3" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 dark:bg-white/5 rounded-lg w-full" />
      <div className="h-3 bg-gray-200 dark:bg-white/5 rounded-lg w-4/5" />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="w-full rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 animate-pulse space-y-3">
    <div className="h-8 bg-gray-300 dark:bg-white/10 rounded-xl w-full" />
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="h-12 bg-gray-200 dark:bg-white/5 rounded-xl w-full" />
    ))}
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="min-h-screen p-6 max-w-7xl mx-auto space-y-8 animate-pulse">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-8 bg-gray-300 dark:bg-white/10 rounded-xl w-64" />
        <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-lg w-48" />
      </div>
      <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-white/10" />
    </div>

    {/* KPI Cards Grid */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>

    {/* Table / Content Area */}
    <TableSkeleton rows={4} />
  </div>
);

export const ProfileSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto p-6 space-y-6 animate-pulse">
    <div className="h-48 rounded-3xl bg-gray-300 dark:bg-white/10 w-full" />
    <div className="space-y-3">
      <div className="h-6 bg-gray-300 dark:bg-white/10 rounded-lg w-1/3" />
      <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-lg w-2/3" />
    </div>
  </div>
);
