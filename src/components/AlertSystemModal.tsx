import React, { useState } from 'react';
import { UserSession, DocumentItem, AuditLog } from '../types';
import {
  Bell,
  X,
  AlertTriangle,
  ShieldAlert,
  Scan,
  CheckCircle2,
  Sparkles,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Zap
} from 'lucide-react';

export interface AlertItem {
  id: string;
  type: 'PENDING_SCAN' | 'ACCESS_VIOLATION' | 'TAMPER_CHECK' | 'SYSTEM';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  timestamp: string;
  documentId?: string;
  doc?: DocumentItem;
}

interface AlertSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  documents: DocumentItem[];
  auditLogs: AuditLog[];
  onOpenScanBarcode: (doc: DocumentItem) => void;
  onOpenDoc: (doc: DocumentItem) => void;
  onSwitchTab: (tab: string) => void;
}

export const AlertSystemModal: React.FC<AlertSystemModalProps> = ({
  isOpen,
  onClose,
  session,
  documents,
  auditLogs,
  onOpenScanBarcode,
  onOpenDoc,
  onSwitchTab,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'CRITICAL' | 'PENDING'>('ALL');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isOpen) return null;

  // Build active real-time alerts
  const alertsList: AlertItem[] = [];

  // 1. Pending Barcode Verifications assigned to user
  const pendingDocs = documents.filter(
    (d) => d.assignedToUser === session.userName && d.isPendingVerification
  );
  pendingDocs.forEach((doc) => {
    alertsList.push({
      id: `alert-scan-${doc.id}`,
      type: 'PENDING_SCAN',
      severity: 'CRITICAL',
      title: `Barcode Seal Scan Required: ${doc.title}`,
      description: `Document transferred to ${session.userName}. You must scan printed document barcode [${doc.barcode}] to unlock.`,
      timestamp: doc.updatedAt || 'Today',
      documentId: doc.id,
      doc,
    });
  });

  // 2. Recent Audit Access Violations (DENIED logs)
  const deniedLogs = auditLogs.filter((log) => log.status === 'DENIED').slice(0, 5);
  deniedLogs.forEach((log) => {
    alertsList.push({
      id: `alert-log-${log.id}`,
      type: 'ACCESS_VIOLATION',
      severity: 'CRITICAL',
      title: `Security Clearance Violation Attempted`,
      description: `User '${log.userName}' (${log.role} - ${log.userDepartment}) attempted unauthorized query/upload for '${log.targetDepartment}'.`,
      timestamp: log.timestamp,
    });
  });

  // 3. Digital Signature Seals
  documents.forEach((doc) => {
    if (doc.tamperStatus === 'TAMPER_DETECTED') {
      alertsList.push({
        id: `alert-tamper-${doc.id}`,
        type: 'TAMPER_CHECK',
        severity: 'CRITICAL',
        title: `TAMPER ALERT: ${doc.title}`,
        description: `SHA256 signature hash integrity check failed for file [${doc.barcode}]. Document quarantined.`,
        timestamp: doc.updatedAt || 'Recent',
        documentId: doc.id,
        doc,
      });
    }
  });

  // Filtered List
  const filteredAlerts = alertsList.filter((item) => {
    if (filterType === 'CRITICAL') return item.severity === 'CRITICAL';
    if (filterType === 'PENDING') return item.type === 'PENDING_SCAN';
    return true;
  });

  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiSummary(null);

    try {
      const res = await fetch('/api/alerts/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session, alerts: alertsList }),
      });
      const data = await res.json();
      setAiSummary(data.summary || 'Alert analysis completed successfully.');
    } catch (e) {
      setAiSummary('• Unable to contact AI Threat Intelligence endpoint.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-600/30 text-red-400 rounded-xl border border-red-500/40 relative">
              <Bell className="h-6 w-6" />
              {alertsList.length > 0 && (
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-red-500 rounded-full border-2 border-slate-900 animate-ping" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-base tracking-tight text-white">System Security & Alert Center</h2>
                <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-[10px] font-mono font-bold rounded border border-red-400/30">
                  {alertsList.length} Active Alerts
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Real-time security notifications, barcode dispatches & RBAC violation feeds
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Controls & AI Threat Briefing Trigger */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center justify-between gap-2 text-xs font-mono">
          <div className="flex space-x-1.5">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterType === 'ALL'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              All ({alertsList.length})
            </button>
            <button
              onClick={() => setFilterType('CRITICAL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterType === 'CRITICAL'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setFilterType('PENDING')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterType === 'PENDING'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Barcode Scans ({pendingDocs.length})
            </button>
          </div>

          <button
            disabled={isAnalyzing}
            onClick={handleRunAiAnalysis}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center space-x-1.5 shadow-sm transition-all text-xs"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Evaluating Threats...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>AI Risk Briefing</span>
              </>
            )}
          </button>
        </div>

        {/* AI Threat Summary Box */}
        {aiSummary && (
          <div className="bg-blue-50 border-b border-blue-200 p-4 animate-fade-in text-xs font-mono text-blue-950 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-blue-900 uppercase text-[11px]">
              <Zap className="h-4 w-4 text-blue-600" />
              <span>AI Security Threat & Alert Briefing:</span>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed text-slate-800">{aiSummary}</div>
          </div>
        )}

        {/* Alerts List Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">All Security Seals Intact</h3>
              <p className="text-xs text-slate-500 font-mono">
                No active threats or unverified barcode dispatches found for {session.userName}.
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all shadow-xs flex items-start justify-between gap-3 ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-red-50/50 border-red-200 hover:border-red-300'
                    : 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-lg mt-0.5 flex-shrink-0 ${
                      alert.type === 'PENDING_SCAN'
                        ? 'bg-amber-500 text-white'
                        : alert.type === 'ACCESS_VIOLATION'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-800 text-white'
                    }`}
                  >
                    {alert.type === 'PENDING_SCAN' ? (
                      <Scan className="h-5 w-5" />
                    ) : (
                      <ShieldAlert className="h-5 w-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 text-xs">{alert.title}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {alert.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-mono leading-relaxed">{alert.description}</p>
                    <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-1 pt-1">
                      <Clock className="h-3 w-3" />
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Trigger Buttons */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {alert.type === 'PENDING_SCAN' && alert.doc && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenScanBarcode(alert.doc!);
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold uppercase font-mono shadow-xs flex items-center space-x-1"
                    >
                      <Scan className="h-3.5 w-3.5" />
                      <span>Scan Barcode</span>
                    </button>
                  )}

                  {alert.type === 'ACCESS_VIOLATION' && (
                    <button
                      onClick={() => {
                        onClose();
                        onSwitchTab('audit');
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold uppercase font-mono shadow-xs flex items-center space-x-1"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>View Audit Log</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
