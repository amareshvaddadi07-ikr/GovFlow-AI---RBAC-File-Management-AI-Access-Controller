import React from 'react';
import { DocumentItem, UserSession } from '../types';
import { ShieldAlert, Lock, X, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';

interface AccessDeniedModalProps {
  document: DocumentItem | null;
  session: UserSession;
  onClose: () => void;
  onOpenSessionModal: () => void;
}

export const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({
  document,
  session,
  onClose,
  onOpenSessionModal,
}) => {
  if (!document) return null;

  const EXACT_DENIAL_MSG =
    'Access Denied: You do not have clearance to view files outside of your assigned department.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-xl text-slate-800 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Shield Icon & Alert Badge */}
        <div className="flex flex-col items-center text-center space-y-3 mb-5">
          <div className="h-14 w-14 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-sm">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 font-mono text-xs font-bold uppercase tracking-wider border border-red-200">
            RBAC Access Violation Intercepted
          </span>

          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Security System Enforcement</h2>
        </div>

        {/* Required Policy Message Box - Exact Professional Polish red alert style */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm text-red-800 mb-5">
          <p className="text-red-800 font-bold text-xs uppercase tracking-tight mb-1">Access Denied</p>
          <p className="text-sm font-semibold text-red-800 leading-relaxed font-sans">
            "{EXACT_DENIAL_MSG}"
          </p>
        </div>

        {/* Evaluation Breakdown Matrix */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-xs font-mono space-y-2 mb-6">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
            Authorization Verification Matrix
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Current User:</span>
            <span className="text-slate-900 font-bold">{session.userName}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500 font-medium">User Role:</span>
            <span className="text-blue-700 font-bold">{session.role}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Assigned Clearance Dept:</span>
            <span className="text-amber-700 font-bold">{session.department || 'None'}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Requested File Dept:</span>
            <span className="text-red-700 font-bold">{document.department}</span>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-slate-500 font-medium">Security Audit Result:</span>
            <span className="text-red-700 font-bold uppercase">DENIED & LOGGED</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenSessionModal();
            }}
            className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center justify-center space-x-1.5"
          >
            <UserCheck className="h-4 w-4 text-blue-600" />
            <span>Switch Persona</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide text-white bg-blue-600 hover:bg-blue-700 border border-blue-700 transition-colors shadow-sm"
          >
            Acknowledge & Dismiss
          </button>
        </div>

      </div>
    </div>
  );
};
