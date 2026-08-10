import React from 'react';
import { generateBarcodeSVGPattern } from '../utils/barcode';
import { QrCode, ShieldCheck } from 'lucide-react';

interface BarcodeDisplayProps {
  barcode: string;
  sha256Hash?: string;
  className?: string;
  compact?: boolean;
}

export const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
  barcode,
  sha256Hash,
  className = '',
  compact = false,
}) => {
  const pattern = generateBarcodeSVGPattern(barcode || 'DOC-DIGI-000000');

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono ${className}`}>
        {/* Mini Barcode Graphic */}
        <div className="flex items-center h-7 bg-white px-1.5 py-1 rounded border border-slate-200">
          <svg className="h-5 w-24" viewBox="0 0 100 20">
            {pattern.reduce((acc, bar, idx) => {
              if (!bar.isGap) {
                acc.elements.push(
                  <rect
                    key={idx}
                    x={acc.currentX}
                    y={0}
                    width={bar.width * 1.8}
                    height={20}
                    fill="#0f172a"
                  />
                );
              }
              acc.currentX += bar.width * 1.8;
              return acc;
            }, { currentX: 2, elements: [] as React.ReactNode[] }).elements}
          </svg>
        </div>
        <div className="text-[10px]">
          <span className="font-bold text-slate-800 block tracking-wider">{barcode}</span>
          <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
            <ShieldCheck className="h-3 w-3 inline" /> Verified
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center relative overflow-hidden ${className}`}>
      {/* Top Label */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
        <span className="flex items-center space-x-1 text-slate-800">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
          <span>GovSec Official Barcode ID</span>
        </span>
        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
          Anti-Tamper Locked
        </span>
      </div>

      {/* Barcode SVG Visual */}
      <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between gap-3 my-2">
        <div className="flex-1 flex justify-center">
          <svg className="h-12 w-full max-w-[220px]" viewBox="0 0 140 32">
            {pattern.reduce((acc, bar, idx) => {
              if (!bar.isGap) {
                acc.elements.push(
                  <rect
                    key={idx}
                    x={acc.currentX}
                    y={2}
                    width={bar.width * 2}
                    height={28}
                    fill="#0f172a"
                  />
                );
              }
              acc.currentX += bar.width * 2;
              return acc;
            }, { currentX: 4, elements: [] as React.ReactNode[] }).elements}
          </svg>
        </div>

        {/* QR Verification Matrix Simulation */}
        <div className="p-1.5 bg-white border border-slate-300 rounded flex flex-col items-center justify-center flex-shrink-0">
          <QrCode className="h-8 w-8 text-slate-900" />
          <span className="text-[8px] font-mono text-slate-500 font-bold mt-0.5">SCAN</span>
        </div>
      </div>

      {/* Barcode Text Code */}
      <div className="font-mono text-xs font-bold text-slate-900 tracking-widest uppercase my-1">
        *{barcode}*
      </div>

      {sha256Hash && (
        <div className="text-[9px] font-mono text-slate-500 truncate mt-1 bg-slate-100 p-1 rounded border border-slate-200">
          <span className="text-slate-400 uppercase font-bold mr-1">HASH:</span>
          {sha256Hash}
        </div>
      )}
    </div>
  );
};
