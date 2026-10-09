import React, { useState } from 'react';

export interface TelemetryDataPoint {
  date: string; // e.g. "Dec 7"
  dayNumber: number;
  value: number; // e.g. 2.0, 3.8, 6.0
  installs: number;
  earnings?: number;
}

export interface KredTelemetryBarChartProps {
  title?: string;
  pillLabel?: string;
  icon?: string;
  data?: TelemetryDataPoint[];
  maxY?: number;
  yTicks?: number[];
  xTickDays?: number[];
  bountyPrice?: number;
  barColor?: string;
  badgeBg?: string;
  badgeFg?: string;
  className?: string;
  onRefresh?: () => void;
}

// Default seed data perfectly matching the exact distribution shown in Image 1
// (Dec 7 to Dec 31, with bars peaking around 6, 5.2, 4.2, 3.8, etc.)
export const DEFAULT_TELEMETRY_DATA: TelemetryDataPoint[] = [
  { date: 'Dec 7', dayNumber: 7, value: 2.0, installs: 2 },
  { date: 'Dec 8', dayNumber: 8, value: 3.7, installs: 4 },
  { date: 'Dec 9', dayNumber: 9, value: 3.2, installs: 3 },
  { date: 'Dec 10', dayNumber: 10, value: 2.5, installs: 2 },
  { date: 'Dec 11', dayNumber: 11, value: 4.0, installs: 4 },
  { date: 'Dec 12', dayNumber: 12, value: 6.0, installs: 6 },
  { date: 'Dec 13', dayNumber: 13, value: 2.7, installs: 3 },
  { date: 'Dec 14', dayNumber: 14, value: 1.6, installs: 2 },
  { date: 'Dec 15', dayNumber: 15, value: 0.5, installs: 1 },
  { date: 'Dec 16', dayNumber: 16, value: 2.9, installs: 3 },
  { date: 'Dec 17', dayNumber: 17, value: 2.2, installs: 2 },
  { date: 'Dec 18', dayNumber: 18, value: 4.2, installs: 4 },
  { date: 'Dec 19', dayNumber: 19, value: 3.3, installs: 3 },
  { date: 'Dec 20', dayNumber: 20, value: 2.5, installs: 2 },
  { date: 'Dec 21', dayNumber: 21, value: 1.7, installs: 2 },
  { date: 'Dec 22', dayNumber: 22, value: 3.1, installs: 3 },
  { date: 'Dec 23', dayNumber: 23, value: 2.1, installs: 2 },
  { date: 'Dec 24', dayNumber: 24, value: 4.1, installs: 4 },
  { date: 'Dec 25', dayNumber: 25, value: 5.2, installs: 5 },
  { date: 'Dec 26', dayNumber: 26, value: 2.6, installs: 3 },
  { date: 'Dec 27', dayNumber: 27, value: 0.8, installs: 1 },
  { date: 'Dec 28', dayNumber: 28, value: 1.3, installs: 1 },
  { date: 'Dec 29', dayNumber: 29, value: 2.3, installs: 2 },
  { date: 'Dec 30', dayNumber: 30, value: 0.4, installs: 0 },
  { date: 'Dec 31', dayNumber: 31, value: 0.9, installs: 1 },
  { date: 'Jan 1', dayNumber: 32, value: 3.2, installs: 3 },
  { date: 'Jan 2', dayNumber: 33, value: 3.8, installs: 4 },
  { date: 'Jan 3', dayNumber: 34, value: 2.9, installs: 3 },
];

export const KredTelemetryBarChart: React.FC<KredTelemetryBarChartProps> = ({
  title = "Let’s look at your latest runs and make a plan to trim some time.",
  pillLabel = "Read health data",
  icon = "ti-heart-filled",
  data = DEFAULT_TELEMETRY_DATA,
  maxY = 6.5,
  yTicks = [6, 5, 4, 3, 2, 1, 0],
  xTickDays = [7, 11, 15, 19, 23, 27, 31],
  bountyPrice = 2.5,
  barColor = '#F4C0D1',
  badgeBg,
  badgeFg,
  className = '',
  onRefresh,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<TelemetryDataPoint | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayToggle = () => {
    setIsPlaying(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsPlaying(false), 900);
  };

  const resolvedBadgeBg = badgeBg || (barColor === '#F4C0D1' ? '#F4C0D1' : barColor);
  const resolvedBadgeFg = badgeFg || (barColor === '#F4C0D1' ? '#4B1528' : '#0B0B0B');

  return (
    <div
      className={`bg-transparent border-0 text-left select-none relative w-full py-2 ${className}`}
    >
      {/* Serif Typography Headline matching Image 1 & Design System */}
      <h3 className="font-serif text-[20px] sm:text-[24px] text-[#F5F3EC] leading-[1.3] tracking-[-0.2px] font-normal pr-2">
        {title}
      </h3>

      {/* Action Capsule Pill matching Image 1 & Design System */}
      <div className="flex items-center justify-between mt-3.5 mb-6 p-1.5 pl-3 pr-2 bg-[#141414] rounded-full border border-white/10 transition-colors">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[13px] shrink-0 shadow-xs font-semibold"
            style={{ backgroundColor: resolvedBadgeBg, color: resolvedBadgeFg }}
          >
            <i className={`ti ${icon}`}></i>
          </div>
          <span className="text-[13px] text-[#B9B7AF] truncate font-medium">
            {pillLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={handlePlayToggle}
          className={`w-7 h-7 rounded-full bg-[#242424] hover:bg-[#2A2A2A] text-[#F5F3EC] flex items-center justify-center cursor-pointer transition-all shrink-0 ml-2 shadow-xs ${
            isPlaying ? 'scale-95 bg-[#C7F26B] text-[#0B0B0B]' : ''
          }`}
          aria-label="Refresh telemetry data"
          title="Refresh telemetry"
        >
          <i
            className={`ti ${
              isPlaying ? 'ti-loader animate-spin text-[12px]' : 'ti-player-play-filled text-[10px]'
            }`}
          ></i>
        </button>
      </div>

      {/* Main Chart Container */}
      <div className="relative pt-2 pb-1">
        {/* Tooltip on hover */}
        {hoveredPoint && (
          <div className="absolute top-0 right-2 z-20 px-3 py-1.5 bg-[#1C1C1C] border border-[#2A2A2A] rounded-[10px] text-[11.5px] font-mono shadow-xl animate-[fade-in_0.1s_ease-out]">
            <span className="text-[#A8A69E]">{hoveredPoint.date}: </span>
            <span className="text-[#F5F3EC] font-semibold">{hoveredPoint.value} runs </span>
            <span className="text-[#C7F26B] font-medium">
              (${((hoveredPoint.earnings ?? hoveredPoint.value * bountyPrice)).toFixed(2)})
            </span>
          </div>
        )}

        <div className="flex">
          {/* Y-axis Labels on Left */}
          <div className="w-6 shrink-0 flex flex-col justify-between items-end pr-2.5 text-[11px] font-mono text-[#A8A69E] h-[150px] sm:h-[170px] select-none py-1">
            {yTicks.map((val) => (
              <span key={val} className="leading-none">
                {val}
              </span>
            ))}
          </div>

          {/* Chart Grid and Bars Area */}
          <div className="flex-1 relative h-[150px] sm:h-[170px]">
            {/* Horizontal Gridlines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-1">
              {yTicks.map((val) => (
                <div key={val} className="w-full border-b border-[#2A2A2A]/60" />
              ))}
            </div>

            {/* Vertical Dashed Tick Separators matching Image 1 */}
            <div className="absolute inset-0 flex justify-between pointer-events-none px-2">
              {xTickDays.map((day, idx) => (
                <div
                  key={day}
                  className={`h-full border-r ${
                    idx === 0 ? 'border-transparent' : 'border-dashed border-[#2A2A2A]'
                  }`}
                />
              ))}
            </div>

            {/* Vertical Bars themed with design system */}
            <div className="absolute inset-0 flex items-end justify-between px-1.5 z-10">
              {data.map((point, idx) => {
                const heightPercent = Math.min(100, Math.max(3, (point.value / maxY) * 100));
                const isHovered = hoveredPoint?.date === point.date;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredPoint(point)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="flex-1 h-full flex items-end justify-center group cursor-pointer px-[1px] sm:px-[2px]"
                  >
                    <div
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: isHovered ? '#F5F3EC' : barColor,
                        boxShadow: isHovered ? `0 0 10px ${barColor}` : undefined,
                      }}
                      className="w-full max-w-[9px] rounded-t-[2px] transition-all duration-150 group-hover:opacity-100 opacity-90"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* X-axis Labels at Bottom matching Image 1 */}
        <div className="flex pl-6 pt-2 text-[11px] font-mono text-[#A8A69E] justify-between px-1 select-none">
          {xTickDays.map((day, idx) => (
            <span key={day} className="text-center">
              {idx === 0 ? `Dec ${day}` : day}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
