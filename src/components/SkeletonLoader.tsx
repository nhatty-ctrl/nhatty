import React from 'react';

export const CampaignCardSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-[84px_minmax(0,1fr)] sm:grid-cols-[100px_minmax(0,1fr)] gap-3 sm:gap-4 items-start animate-pulse">
      {/* Category skeleton */}
      <div className="pt-2 space-y-2">
        <div className="h-4 bg-[#1C1C1C] rounded w-16" />
        <div className="h-3 bg-[#1C1C1C] rounded w-12" />
      </div>

      {/* Card skeleton */}
      <div className="card bg-[#161616] border border-[#2A2A2A] rounded-[20px] p-4 flex justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-[#242424] rounded w-40" />
          <div className="h-3 bg-[#1C1C1C] rounded w-24" />
          <div className="flex gap-2">
            <div className="h-6 bg-[#242424] rounded-full w-32" />
            <div className="h-6 bg-[#1C1C1C] rounded-full w-8" />
            <div className="h-6 bg-[#1C1C1C] rounded-full w-8" />
          </div>
          <div className="flex gap-3 items-center pt-1">
            <div className="h-8 bg-[#242424] rounded-full w-28" />
            <div className="h-4 bg-[#1C1C1C] rounded w-16" />
          </div>
        </div>

        {/* Tile skeleton */}
        <div className="w-[84px] h-[84px] sm:w-[96px] sm:h-[96px] bg-[#1C1C1C] rounded-[20px] shrink-0" />
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="card space-y-4 animate-pulse">
      <div className="h-5 bg-[#242424] rounded w-36" />
      <div className="flex items-end gap-2 h-[150px] pt-4">
        {[40, 65, 30, 85, 45, 90, 70, 55, 80, 100].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-[#242424] rounded-t-[6px]"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between pt-2">
        <div className="h-3 bg-[#1C1C1C] rounded w-14" />
        <div className="h-3 bg-[#1C1C1C] rounded w-24" />
        <div className="h-3 bg-[#1C1C1C] rounded w-14" />
      </div>
    </div>
  );
};
