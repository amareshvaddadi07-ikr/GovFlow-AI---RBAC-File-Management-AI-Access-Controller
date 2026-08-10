import React from 'react';
import { X, ShieldCheck, Lock, User, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface RBACPolicyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RBACPolicyInfoModal: React.FC<RBACPolicyInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-xl text-slate-800 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">System RBAC Specification & Rules</h2>
            <p className="text-xs text-slate-500 font-mono">
              Role-Based Access Control Specification & Enforcement Mandates
            </p>
          </div>
        </div>

        {/* Roles section */}
        <div className="space-y-4 text-xs font-sans">
          
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="font-bold text-sm text-blue-700 uppercase tracking-wider mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>1. User Roles & Permissions</span>
            </h3>

            <div className="space-y-3 font-mono text-slate-700">
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="text-slate-900 font-bold text-xs mb-1">A. Department Officer:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>Can ONLY access files, data, and information belonging to their specific assigned department.</li>
                  <li>Must be denied access to any files, data, or metrics from other departments.</li>
                </ul>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="text-purple-700 font-bold text-xs mb-1">B. Commissioner:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>Has universal access to all files, data, and documents across all departments without restriction.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="font-bold text-sm text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>2. Operational Rules</span>
            </h3>

            <div className="space-y-2 font-mono text-slate-700 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 font-bold mr-2">Rule #1:</span>
                Identify user Role and Department from context at start.
              </div>

              <div className="p-2.5 bg-red-50 rounded-lg border border-red-200 text-red-900">
                <span className="text-red-700 font-bold block mb-1">Rule #2 (Officer Out-of-Scope Denial Message):</span>
                <span className="text-red-800 italic font-bold">
                  "Access Denied: You do not have clearance to view files outside of your assigned department."
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 font-bold mr-2">Rule #3:</span>
                If Commissioner makes request, fulfill completely citing department source.
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 font-bold mr-2">Rule #4:</span>
                Never leak, summarize, or hint at files from other departments to an Officer.
              </div>
            </div>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide text-white bg-blue-600 hover:bg-blue-700 border border-blue-700 transition-colors shadow-sm"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
