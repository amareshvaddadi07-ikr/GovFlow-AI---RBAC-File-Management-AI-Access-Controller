import React, { useState, useRef, useEffect } from 'react';
import { UserSession } from '../types';
import { ShieldCheck, Lock, Building, FileText, Info, RefreshCw, X, ChevronRight, Bot, Bell, Sparkles } from 'lucide-react';
import { GvmcLogo } from './GvmcLogo';

interface HeaderProps {
  session: UserSession;
  onOpenSessionModal: () => void;
  onOpenPolicyModal: () => void;
  onOpenAuthPortal?: () => void;
  onOpenScanModal?: () => void;
  onOpenAgentModal?: () => void;
  onOpenAlertModal?: () => void;
  activeAlertCount?: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  totalDeniedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  onOpenSessionModal,
  onOpenPolicyModal,
  onOpenAuthPortal,
  onOpenAgentModal,
  onOpenAlertModal,
  activeAlertCount = 0,
  activeTab,
  setActiveTab,
  totalDeniedCount,
}) => {
  const isCommissioner = session.role === 'Commissioner';
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Header Brand Logo - Acts as a re-router to Home/Vault page */}
          <button
            id="logo-home-btn"
            onClick={() => setActiveTab('files')}
            className="flex items-center px-2 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-white transition-all shadow-sm group"
            title="GVMC Digital Connect - Official Secure Portal"
          >
            <GvmcLogo size="sm" showText={true} />
          </button>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            <button
              id="nav-files-btn"
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'files'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-blue-300" />
              <span>Vault</span>
            </button>

            <button
              id="nav-depts-btn"
              onClick={() => setActiveTab('departments')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'departments'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Building className="h-3.5 w-3.5" />
              <span>Matrix</span>
            </button>
          </nav>

          {/* Right Controls: Alert Center & Profile Photo */}
          <div className="flex items-center space-x-2.5">

            {/* Auth Portal / SSO Gateway Button */}
            {onOpenAuthPortal && (
              <button
                id="header-auth-portal-btn"
                onClick={onOpenAuthPortal}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-mono text-xs font-bold border border-blue-500/40 shadow-sm transition-all group"
                title="Open Parichay SSO / Aadhaar e-KYC Auth Portal"
              >
                <Lock className="h-3.5 w-3.5 text-cyan-300 group-hover:scale-110 transition-transform" />
                <span>SSO Auth Portal</span>
              </button>
            )}

            {/* Real-time Alert System Notification Bell */}
            {onOpenAlertModal && (
              <button
                id="header-alert-center-btn"
                onClick={onOpenAlertModal}
                className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/80 transition-all relative group shadow-xs"
                title="Open Security & Alert Center"
              >
                <Bell className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                {activeAlertCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-mono font-bold flex items-center justify-center border-2 border-slate-900 animate-pulse">
                    {activeAlertCount}
                  </span>
                )}
              </button>
            )}
            
            {/* Small Circle Personnel Profile Photo */}
            <div className="relative" ref={profileRef}>
              <button
                id="user-profile-circle-btn"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="relative focus:outline-none group rounded-full p-0.5 border-2 border-slate-700 hover:border-blue-400 transition-all shadow-sm"
                title={`Personnel Profile: ${session.userName}`}
              >
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-inner ${
                    isCommissioner
                      ? 'bg-gradient-to-tr from-purple-700 via-indigo-600 to-purple-500'
                      : 'bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500'
                  }`}
                >
                  {session.userName.charAt(0)}
                </div>
                {/* Active Indicator Dot */}
                <span
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 ${
                    isCommissioner ? 'bg-purple-400' : 'bg-emerald-400'
                  }`}
                />
              </button>

              {/* Personnel Details Popover Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 animate-fade-in font-sans">
                  
                  {/* Popover Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-base text-white shadow ${
                          isCommissioner
                            ? 'bg-gradient-to-tr from-purple-700 to-indigo-500'
                            : 'bg-gradient-to-tr from-blue-700 to-sky-500'
                        }`}
                      >
                        {session.userName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">{session.userName}</h4>
                        <span
                          className={`inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            isCommissioner
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {session.role}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsProfileOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Personnel Profile Metadata Details */}
                  <div className="py-3 space-y-2.5 text-xs font-mono">
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">Department:</span>
                      <span className="font-bold text-slate-900">{session.department || 'All (Universal)'}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">Badge ID:</span>
                      <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {session.badgeId || (isCommissioner ? 'COMM-001' : 'OFF-002')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">Clearance Level:</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {isCommissioner ? 'Level 5 (Top Secret)' : 'Level 3 (Confidential)'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500 font-medium">Title:</span>
                      <span className="font-sans text-[11px] text-slate-700 max-w-[140px] truncate text-right font-medium">
                        {session.title || (isCommissioner ? 'Commissioner' : 'Department Officer')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    {onOpenAuthPortal && (
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          onOpenAuthPortal();
                        }}
                        className="w-full py-2 px-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-between shadow-sm"
                      >
                        <span className="flex items-center space-x-1.5 font-mono">
                          <Lock className="h-3.5 w-3.5 text-cyan-300" />
                          <span>SSO Auth Portal (Parichay/MFA)</span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onOpenSessionModal();
                      }}
                      className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-between shadow-sm"
                    >
                      <span className="flex items-center space-x-1.5">
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Switch Personnel Profile</span>
                      </span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onOpenPolicyModal();
                      }}
                      className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between"
                    >
                      <span className="flex items-center space-x-1.5">
                        <Info className="h-3.5 w-3.5 text-slate-500" />
                        <span>Security Rules & RBAC</span>
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Nav bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-950 border-t border-slate-800/80 px-2 py-2 text-xs">
        <button
          onClick={() => setActiveTab('files')}
          className={`flex flex-col items-center py-1 ${activeTab === 'files' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
        >
          <FileText className="h-4 w-4" />
          <span>Vault</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex flex-col items-center py-1 ${activeTab === 'ai' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>AI Guard</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex flex-col items-center py-1 ${activeTab === 'audit' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
        >
          <Lock className="h-4 w-4" />
          <span>Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`flex flex-col items-center py-1 ${activeTab === 'departments' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
        >
          <Building className="h-4 w-4" />
          <span>Matrix</span>
        </button>
      </div>
    </header>
  );
};
