import React from 'react';

interface GvmcLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const GvmcLogo: React.FC<GvmcLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const textClasses = {
    sm: { title: 'text-sm', subtitle: 'text-[8px] tracking-[0.18em]' },
    md: { title: 'text-base', subtitle: 'text-[9px] tracking-[0.2em]' },
    lg: { title: 'text-lg', subtitle: 'text-[10px] tracking-[0.22em]' },
    xl: { title: 'text-2xl', subtitle: 'text-[12px] tracking-[0.25em]' },
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* GVMC Badge Icon */}
      <div
        className={`relative ${sizeClasses[size]} rounded-xl p-1.5 bg-gradient-to-br from-cyan-600 via-teal-700 to-slate-900 shadow-md border border-cyan-400/30 flex items-center justify-center shrink-0 group overflow-hidden`}
      >
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-white fill-none stroke-current"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Orbit Ring */}
          <circle
            cx="50"
            cy="45"
            r="38"
            className="stroke-cyan-300/40"
            strokeWidth="2"
            strokeDasharray="100 20"
          />

          {/* Glowing Nodes on Orbit */}
          <circle cx="20" cy="45" r="3.5" className="fill-cyan-300 stroke-none" />
          <circle cx="80" cy="45" r="3.5" className="fill-cyan-300 stroke-none" />
          <circle cx="40" cy="10" r="3" className="fill-cyan-200 stroke-none" />

          {/* Lighthouse Dome / Top */}
          <path d="M 46 22 Q 50 16 54 22 Z" className="fill-white/20" />
          <line x1="50" y1="16" x2="50" y2="12" strokeWidth="3" />

          {/* Light Rays / Beacons */}
          <line x1="57" y1="24" x2="72" y2="19" strokeWidth="2.5" className="stroke-cyan-200" />
          <line x1="58" y1="27" x2="75" y2="27" strokeWidth="2.5" className="stroke-cyan-200" />
          <line x1="57" y1="30" x2="72" y2="35" strokeWidth="2.5" className="stroke-cyan-200" />

          {/* Lighthouse Tower Body */}
          <path d="M 45 27 L 55 27 L 58 54 L 42 54 Z" />
          <line x1="43.5" y1="40" x2="56.5" y2="40" strokeWidth="2" />

          {/* Rocks / Waves Base */}
          <path
            d="M 28 62 C 34 52, 42 52, 48 58 C 53 50, 62 50, 72 62 C 60 66, 40 66, 28 62 Z"
            className="fill-white/30"
          />
        </svg>
      </div>

      {/* Typography: GovFlow Ai */}
      {showText && (
        <div className="flex flex-col justify-center leading-none select-none">
          <span className={`font-black text-white tracking-tight ${textClasses[size].title}`}>
            GovFlow <span className="text-cyan-400 font-extrabold">Ai</span>
          </span>
          <span className={`font-semibold text-cyan-300/90 uppercase ${textClasses[size].subtitle}`}>
            DIGITAL CONNECT
          </span>
        </div>
      )}
    </div>
  );
};
