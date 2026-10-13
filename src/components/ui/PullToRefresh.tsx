import React, { useState, useRef, useCallback } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  threshold?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 60,
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow pull-to-refresh if user is at the very top of the page
    if (window.scrollY <= 0 && !isRefreshing) {
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    } else {
      isPullingRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPullingRef.current || isRefreshing) return;

    // Check if still at top
    if (window.scrollY > 0) {
      isPullingRef.current = false;
      setPullDistance(0);
      return;
    }

    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0) {
      // Rubber-band resistance formula
      const dampedDistance = Math.min(diff * 0.45, 95);
      setPullDistance(dampedDistance);
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPullingRef.current || isRefreshing) return;
    isPullingRef.current = false;

    if (pullDistance >= threshold) {
      // Trigger refresh
      setIsRefreshing(true);
      setPullDistance(threshold);

      try {
        await Promise.resolve(onRefresh());
        setIsSuccess(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        console.error('Pull-to-refresh failed', err);
      } finally {
        setIsSuccess(false);
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // Cancelled pull
      setPullDistance(0);
    }
  };

  // Progress 0 to 1
  const progress = Math.min(pullDistance / threshold, 1);
  const isThresholdReached = pullDistance >= threshold;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-full w-full"
    >
      {/* Pull indicator bar - visible primarily on touch mobile */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 z-30 flex items-center justify-center transition-all duration-150"
          style={{
            height: `${pullDistance}px`,
            opacity: Math.min(pullDistance / 24, 1),
          }}
        >
          <div className="flex items-center gap-2 rounded-full border border-[#222222] bg-[#141414]/95 px-3.5 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all">
            {isSuccess ? (
              <>
                <i className="ti ti-check text-[14px] text-[#C0DD97]"></i>
                <span className="text-[11.5px] font-medium text-[#F4F2EC]">Up to date</span>
              </>
            ) : isRefreshing ? (
              <>
                <i className="ti ti-loader-2 animate-spin text-[14px] text-[#C9B8FF]"></i>
                <span className="text-[11.5px] font-medium text-[#F4F2EC]">Updating campaigns...</span>
              </>
            ) : (
              <>
                <i
                  className="ti ti-arrow-down text-[14px] text-[#C9B8FF] transition-transform duration-150"
                  style={{
                    transform: `rotate(${isThresholdReached ? 180 : progress * 180}deg)`,
                  }}
                ></i>
                <span className="text-[11.5px] font-medium text-[#B8B6AE]">
                  {isThresholdReached ? 'Release to refresh' : 'Pull to refresh'}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main content with elastic spring translation during pull */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance * 0.35}px)` : 'none',
          transition: isPullingRef.current ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)',
        }}
      >
        {children}
      </div>
    </div>
  );
};
