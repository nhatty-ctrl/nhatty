import React from 'react';

export const CampaignCardSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-[84px_minmax(0,1fr)] sm:grid-cols-[100px_minmax(0,1fr)] gap-3 sm:gap-4 items-start animate-pulse">
      {/* Category skeleton */}
      <div className="pt-2 space-y-2">
        <div className="h-4 bg-[#141414] rounded w-16" />
        <div className="h-3 bg-[#141414] rounded w-12" />
      </div>

      {/* Card skeleton */}
      <div className="card bg-[#0E0E0E] border border-[#222222] rounded-[20px] p-4 flex justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-[#1B1B1B] rounded w-44" />
          <div className="h-3 bg-[#141414] rounded w-28" />
          <div className="flex gap-2">
            <div className="h-6 bg-[#1B1B1B] rounded-full w-32" />
            <div className="h-6 bg-[#141414] rounded-full w-12" />
            <div className="h-6 bg-[#141414] rounded-full w-12" />
          </div>
          <div className="flex gap-3 items-center pt-1">
            <div className="h-9 bg-[#1B1B1B] rounded-full w-28" />
            <div className="h-4 bg-[#141414] rounded w-20" />
          </div>
        </div>

        {/* Tile skeleton */}
        <div className="w-[84px] h-[84px] sm:w-[96px] sm:h-[96px] bg-[#141414] rounded-[20px] shrink-0" />
      </div>
    </div>
  );
};

export const CampaignDetailSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-[940px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="h-4 bg-[#141414] rounded w-36" />

      {/* Hero header skeleton */}
      <div className="bg-[#0E0E0E] border border-[#222222] rounded-[24px] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#1B1B1B] rounded-[20px] shrink-0" />
          <div className="space-y-2">
            <div className="h-6 bg-[#1B1B1B] rounded w-48" />
            <div className="h-4 bg-[#141414] rounded w-32" />
            <div className="h-3 bg-[#141414] rounded w-24" />
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="h-11 bg-[#1B1B1B] rounded-full w-32" />
          <div className="h-11 bg-[#141414] rounded-full w-28" />
        </div>
      </div>

      {/* Grid metrics skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#0E0E0E] border border-[#222222] rounded-[18px] p-4 space-y-2">
            <div className="h-3 bg-[#141414] rounded w-16" />
            <div className="h-6 bg-[#1B1B1B] rounded w-24" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="bg-[#0E0E0E] border border-[#222222] rounded-[24px] p-6 space-y-4">
        <div className="h-5 bg-[#1B1B1B] rounded w-40" />
        <div className="h-4 bg-[#141414] rounded w-full" />
        <div className="h-4 bg-[#141414] rounded w-3/4" />
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="card space-y-4 animate-pulse bg-[#0E0E0E] border border-[#222222] rounded-[24px] p-6">
      <div className="flex justify-between items-center">
        <div className="h-5 bg-[#1B1B1B] rounded w-40" />
        <div className="h-4 bg-[#141414] rounded w-20" />
      </div>
      <div className="flex items-end gap-2 h-[180px] pt-4">
        {[40, 65, 30, 85, 45, 90, 70, 55, 80, 100, 75, 95].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-[#1B1B1B] rounded-t-[6px]"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between pt-2">
        <div className="h-3 bg-[#141414] rounded w-14" />
        <div className="h-3 bg-[#141414] rounded w-24" />
        <div className="h-3 bg-[#141414] rounded w-14" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="bg-[#0E0E0E] border border-[#222222] rounded-[16px] p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#141414] shrink-0" />
            <div className="space-y-1.5">
              <div className="h-4 bg-[#1B1B1B] rounded w-36" />
              <div className="h-3 bg-[#141414] rounded w-20" />
            </div>
          </div>
          <div className="h-5 bg-[#1B1B1B] rounded w-20" />
        </div>
      ))}
    </div>
  );
};
