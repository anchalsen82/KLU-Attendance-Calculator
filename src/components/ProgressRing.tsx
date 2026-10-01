import React from 'react';

interface ProgressRingProps {
  percentage: number;
  target?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  status?: 'safe' | 'warning' | 'critical' | 'unrecorded';
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  target = 75,
  size = 160,
  strokeWidth = 12,
  label,
  sublabel,
  status = 'safe',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  // Status color styles
  const statusColorMap = {
    safe: {
      gradientStart: '#06b6d4', // cyan-500
      gradientEnd: '#6366f1',   // indigo-500
      glowColor: 'rgba(6, 182, 212, 0.4)',
      textColor: 'text-cyan-500 dark:text-cyan-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      badgeText: 'Eligible',
    },
    warning: {
      gradientStart: '#f59e0b', // amber-500
      gradientEnd: '#ec4899',   // pink-500
      glowColor: 'rgba(245, 158, 11, 0.4)',
      textColor: 'text-amber-500 dark:text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      badgeText: 'Warning',
    },
    critical: {
      gradientStart: '#ef4444', // red-500
      gradientEnd: '#8b5cf6',   // violet-500
      glowColor: 'rgba(239, 68, 68, 0.4)',
      textColor: 'text-rose-500 dark:text-rose-400',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      badgeText: 'Shortage',
    },
    unrecorded: {
      gradientStart: '#64748b',
      gradientEnd: '#94a3b8',
      glowColor: 'rgba(100, 116, 139, 0.2)',
      textColor: 'text-slate-400',
      badgeBg: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
      badgeText: 'No Data',
    },
  };

  const currentTheme = statusColorMap[status] || statusColorMap.safe;
  const gradientId = `ring-grad-${size}-${Math.round(percentage)}`;

  return (
    <div className="relative inline-flex flex-col items-center justify-center select-none">
      <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="rotate-[-90deg] transition-all duration-700 ease-out"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentTheme.gradientStart} />
              <stop offset="100%" stopColor={currentTheme.gradientEnd} />
            </linearGradient>
            <filter id={`glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="4"
                floodColor={currentTheme.gradientStart}
                floodOpacity="0.5"
              />
            </filter>
          </defs>

          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="stroke-slate-200/80 dark:stroke-slate-800/80"
            fill="transparent"
          />

          {/* Animated Value Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={`url(#${gradientId})`}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter={`url(#glow-${gradientId})`}
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          {label && (
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-400 mb-0.5">
              {label}
            </span>
          )}
          <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight flex items-baseline">
            {percentage.toFixed(1)}
            <span className="text-xs sm:text-sm font-semibold text-cyan-500 dark:text-cyan-400 ml-0.5">%</span>
          </span>
          {sublabel ? (
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[90%]">
              {sublabel}
            </span>
          ) : (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 ${currentTheme.badgeBg}`}>
              {currentTheme.badgeText}
            </span>
          )}
        </div>
      </div>

      {target && (
        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Target: <strong className="text-slate-700 dark:text-slate-200 font-mono">{target}%</strong>
        </span>
      )}
    </div>
  );
};
