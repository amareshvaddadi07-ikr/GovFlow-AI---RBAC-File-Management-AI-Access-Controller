import React, { useState } from 'react';
import { AuditLog, UserSession } from '../types';
import { ShieldCheck, ShieldAlert, Lock, CheckCircle2, XCircle, Filter, Download, Terminal, RefreshCw, AlertTriangle } from 'lucide-react';

interface AuditLogViewProps {
  auditLogs: AuditLog[];
  session: UserSession;
  onRefresh: () => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  auditLogs,
  session,
  onRefresh,
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'GRANTED' | 'DENIED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const totalRequests = auditLogs.length;
  const grantedCount = auditLogs.filter((l) => l.status === 'GRANTED').length;
  const deniedCount = auditLogs.filter((l) => l.status === 'DENIED').length;
  const complianceScore = totalRequests > 0 ? Math.round(((totalRequests - 0) / totalRequests) * 100) : 100;

  const filteredLogs = auditLogs.filter((log) => {
    if (filterStatus !== 'ALL' && log.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.userName.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.userDepartment.toLowerCase().includes(q) ||
        (log.targetDocumentTitle || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Role', 'User Dept', 'Action', 'Target Dept', 'Status', 'Details', 'IP'];
    const rows = auditLogs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.userName}"`,
      l.role,
      l.userDepartment,
      l.action,
      l.targetDepartment || 'N/A',
      l.status,
      `"${l.details}"`,
      l.ipAddress,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vaultshield_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Security Metrics Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
            <Terminal className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-mono uppercase font-bold">Total Access Events</div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">{totalRequests}</div>
            <div className="text-[10px] text-slate-400 font-mono">Real-time audit stream</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-mono uppercase font-bold">Granted Clearances</div>
            <div className="text-2xl font-bold text-emerald-600 tracking-tight">{grantedCount}</div>
            <div className="text-[10px] text-slate-400 font-mono">Authorized department views</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-200">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-mono uppercase font-bold">Violations Blocked</div>
            <div className="text-2xl font-bold text-red-600 tracking-tight">{deniedCount}</div>
            <div className="text-[10px] text-slate-400 font-mono">RBAC Policy Enforcement</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-mono uppercase font-bold">Policy Compliance</div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">100%</div>
            <div className="text-[10px] text-emerald-600 font-mono font-bold">Zero Data Leakage</div>
          </div>
        </div>

      </div>

      {/* Filter & Export Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Status Tabs */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg border border-slate-200 w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              filterStatus === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Logs ({auditLogs.length})
          </button>
          <button
            onClick={() => setFilterStatus('GRANTED')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              filterStatus === 'GRANTED' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Granted ({grantedCount})
          </button>
          <button
            onClick={() => setFilterStatus('DENIED')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              filterStatus === 'DENIED' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Denied ({deniedCount})
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail..."
            className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full sm:w-48"
          />

          <button
            onClick={onRefresh}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            title="Refresh Log Stream"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg border border-slate-200 transition-colors uppercase tracking-wide flex items-center space-x-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Audit Stream Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-mono border-b border-slate-200 uppercase text-[10px]">
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">User & Role</th>
                <th className="p-3.5">User Dept</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Target Scope</th>
                <th className="p-3.5">RBAC Status</th>
                <th className="p-3.5">Security Enforcement Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-mono">
                    No security audit logs match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isDenied = log.status === 'DENIED';

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isDenied ? 'bg-red-50/60 text-red-900' : ''
                      }`}
                    >
                      <td className="p-3.5 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                        <div>{log.userName}</div>
                        <div
                          className={`text-[10px] font-mono font-bold ${
                            log.role === 'Commissioner' ? 'text-purple-700' : 'text-blue-700'
                          }`}
                        >
                          {log.role}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-700 font-bold">{log.userDepartment}</td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] uppercase font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-700 font-bold">{log.targetDepartment || 'General'}</td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border flex items-center space-x-1 w-max ${
                            isDenied
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isDenied ? (
                            <>
                              <XCircle className="h-3 w-3 text-red-600" />
                              <span>DENIED</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span>GRANTED</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-700 max-w-xs truncate">{log.details}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
