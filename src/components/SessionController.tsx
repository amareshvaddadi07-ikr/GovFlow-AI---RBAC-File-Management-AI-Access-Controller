import React, { useState } from 'react';
import { UserSession, Role, Department } from '../types';
import { USER_PRESETS } from '../data/mockData';
import { UserCheck, ShieldAlert, Check, X, Shield, Lock, Award, Building, User } from 'lucide-react';

interface SessionControllerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: UserSession;
  onSelectSession: (session: UserSession) => void;
}

export const SessionController: React.FC<SessionControllerProps> = ({
  isOpen,
  onClose,
  currentSession,
  onSelectSession,
}) => {
  const [customName, setCustomName] = useState(currentSession.userName);
  const [customRole, setCustomRole] = useState<Role>(currentSession.role);
  const [customDept, setCustomDept] = useState<Department | '' | 'All'>(currentSession.department);

  if (!isOpen) return null;

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectSession({
      userName: customName.trim() || 'Anonymous Officer',
      role: customRole,
      department: customRole === 'Commissioner' ? 'All' : customDept || 'Finance',
      title: customRole === 'Commissioner' ? 'Universal Access Commissioner' : `${customDept} Officer`,
      badgeId: `CUSTOM-${Date.now().toString().slice(-4)}`
    });
    onClose();
  };

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

        {/* Title & Banner */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Current Session Context Controller</h2>
            <p className="text-xs text-slate-500 font-medium">
              Configure active User Name, Role, and Department to test RBAC enforcement in real-time.
            </p>
          </div>
        </div>

        {/* Active Session Highlight Banner */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
          <div className="text-xs font-mono font-bold uppercase text-slate-500 mb-2 flex items-center justify-between">
            <span>ACTIVE SESSION CONTEXT</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Enforcement Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <div className="text-[10px] text-slate-500 uppercase font-mono font-bold mb-0.5">User Name</div>
              <div className="text-sm font-bold text-slate-900 flex items-center space-x-1.5 truncate">
                <User className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                <span className="truncate">{currentSession.userName}</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <div className="text-[10px] text-slate-500 uppercase font-mono font-bold mb-0.5">User Role</div>
              <div className="text-sm font-bold flex items-center space-x-1.5">
                <Shield className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />
                <span
                  className={
                    currentSession.role === 'Commissioner'
                      ? 'text-purple-700 font-bold'
                      : 'text-blue-700 font-bold'
                  }
                >
                  {currentSession.role}
                </span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <div className="text-[10px] text-slate-500 uppercase font-mono font-bold mb-0.5">User Department</div>
              <div className="text-sm font-bold text-slate-800 flex items-center space-x-1.5 truncate">
                <Building className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                <span className="truncate">
                  {currentSession.role === 'Commissioner'
                    ? 'Universal Access'
                    : currentSession.department || 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Preset Selector Grid */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Quick Persona Switcher (Select to Test)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {USER_PRESETS.map((preset) => {
              const isSelected =
                currentSession.userName === preset.userName &&
                currentSession.role === preset.role &&
                currentSession.department === preset.department;

              return (
                <button
                  key={preset.userName}
                  onClick={() => {
                    onSelectSession(preset);
                    setCustomName(preset.userName);
                    setCustomRole(preset.role);
                    setCustomDept(preset.department);
                    onClose();
                  }}
                  className={`p-3 rounded-xl text-left border transition-all flex items-start justify-between ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">{preset.userName}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                          preset.role === 'Commissioner'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {preset.role}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 font-medium mt-1 flex items-center space-x-2">
                      <span>{preset.title}</span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-500 mt-1 font-semibold">
                      Dept Scope: {preset.role === 'Commissioner' ? 'Universal (All)' : preset.department}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Profile Creator */}
        <form onSubmit={handleApplyCustom} className="border-t border-slate-200 pt-5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Custom Session Context Parameters
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">User Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g., Officer John Doe"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">User Role</label>
              <select
                value={customRole}
                onChange={(e) => {
                  const newRole = e.target.value as Role;
                  setCustomRole(newRole);
                  if (newRole === 'Commissioner') {
                    setCustomDept('All');
                  } else if (customDept === 'All' || !customDept) {
                    setCustomDept('Finance');
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none"
              >
                <option value="Officer">Department Officer</option>
                <option value="Commissioner">Commissioner</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">User Department</label>
              <select
                value={customDept}
                disabled={customRole === 'Commissioner'}
                onChange={(e) => setCustomDept(e.target.value as Department)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none disabled:opacity-50"
              >
                {customRole === 'Commissioner' ? (
                  <option value="All">All Departments (Universal)</option>
                ) : (
                  <>
                    <option value="Finance">Finance</option>
                    <option value="HR">HR</option>
                    <option value="Operations">Operations</option>
                    <option value="IT & Security">IT & Security</option>
                    <option value="Legal & Compliance">Legal & Compliance</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide text-white bg-blue-600 hover:bg-blue-700 border border-blue-700 transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <Check className="h-4 w-4" />
              <span>Apply Session Context</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
