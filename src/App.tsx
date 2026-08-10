import React, { useState, useEffect } from 'react';
import { UserSession, DocumentItem, AuditLog, Department, TransferRecord } from './types';
import { USER_PRESETS, MOCK_DOCUMENTS, INITIAL_AUDIT_LOGS } from './data/mockData';
import { Header } from './components/Header';
import { SessionController } from './components/SessionController';
import { AIAssistant } from './components/AIAssistant';
import { FileExplorer } from './components/FileExplorer';
import { FileViewerModal } from './components/FileViewerModal';
import { AccessDeniedModal } from './components/AccessDeniedModal';
import { ScanDigitizeModal } from './components/ScanDigitizeModal';
import { SecureTransferModal } from './components/SecureTransferModal';
import { AuditLogView } from './components/AuditLogView';
import { BarcodeVerificationModal } from './components/BarcodeVerificationModal';
import { DepartmentDashboard } from './components/DepartmentDashboard';
import { RBACPolicyInfoModal } from './components/RBACPolicyInfoModal';
import { AIAgentNavigationModal } from './components/AIAgentNavigationModal';
import { AlertSystemModal } from './components/AlertSystemModal';
import { AuthPortal } from './components/AuthPortal';
import { Bot, Sparkles } from 'lucide-react';

export default function App() {
  // Current active session state (default: Finance Officer Robert Chen)
  const [session, setSession] = useState<UserSession>(USER_PRESETS[1]);

  // Documents state
  const [documents, setDocuments] = useState<DocumentItem[]>(MOCK_DOCUMENTS);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>('files');
  const [activeDeptFilter, setActiveDeptFilter] = useState<string>('All');

  // Modals state
  const [isAuthPortalOpen, setIsAuthPortalOpen] = useState(true);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedDocForTransfer, setSelectedDocForTransfer] = useState<DocumentItem | null>(null);
  const [selectedDocForVerify, setSelectedDocForVerify] = useState<DocumentItem | null>(null);
  const [selectedDocForViewer, setSelectedDocForViewer] = useState<DocumentItem | null>(null);
  const [deniedDocForModal, setDeniedDocForModal] = useState<DocumentItem | null>(null);

  // Fetch documents from server
  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.documents) {
          setDocuments(data.documents);
        }
      }
    } catch (e) {
      console.error('Failed to fetch documents from server:', e);
    }
  };

  // Fetch audit logs from server
  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit');
      if (res.ok) {
        const data = await res.json();
        if (data.auditLogs) {
          setAuditLogs(data.auditLogs);
        }
      }
    } catch (e) {
      console.error('Failed to fetch audit logs:', e);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchAuditLogs();
    setIsPolicyModalOpen(true);
  }, [session]);

  // Handle logging audit event
  const handleLogAudit = async (
    action: 'VIEW' | 'SEARCH' | 'AI_QUERY' | 'DOWNLOAD' | 'SCAN_DIGITIZE' | 'TRANSFER_DISPATCH' | 'ACCESS_DENIED' | string,
    targetDept: string,
    status: 'GRANTED' | 'DENIED',
    details: string,
    targetDocTitle?: string
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: session.userName,
      role: session.role,
      userDepartment: session.department || 'All',
      action: action as any,
      targetDepartment: targetDept,
      targetDocumentTitle: targetDocTitle,
      status,
      details,
      ipAddress: '10.240.18.50',
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    try {
      await fetch('/api/audit/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
    } catch (err) {
      console.error('Error posting audit log:', err);
    }
  };

  // Handle saving digitized document from OCR scan
  const handleSaveDigitizedDocument = (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev]);
    handleLogAudit(
      'SCAN_DIGITIZE',
      newDoc.department,
      'GRANTED',
      `Optical OCR scan completed: Physical document digitized into barcode ID [${newDoc.barcode}] and sealed with HMAC-SHA256 signature by ${session.userName}.`,
      newDoc.title
    );
  };

  // Handle confirming official secure transfer
  const handleConfirmTransfer = (docId: string, transferRecord: TransferRecord) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          const history = doc.transferHistory || [];
          return {
            ...doc,
            transferHistory: [transferRecord, ...history],
            assignedToUser: transferRecord.toUser,
            assignedToBadgeId: transferRecord.toBadgeId,
            isPendingVerification: true,
          };
        }
        return doc;
      })
    );

    handleLogAudit(
      'TRANSFER_DISPATCH',
      transferRecord.toDepartment,
      'GRANTED',
      `Confidential Dispatch: Document [${transferRecord.barcode}] securely transferred from ${transferRecord.fromUser} (${transferRecord.fromDepartment}) to ${transferRecord.toUser} (${transferRecord.toDepartment}). Barcode seal pending verification by recipient.`,
      selectedDocForTransfer?.title
    );
  };

  // Handle barcode verification success for recipient
  const handleVerifyBarcodeSuccess = (docId: string, verifiedBarcode: string) => {
    let unsealedDoc: DocumentItem | null = null;

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          const verified = doc.verifiedByUsers || [];
          const updatedDoc = {
            ...doc,
            isPendingVerification: false,
            verifiedByUsers: verified.includes(session.userName) ? verified : [...verified, session.userName],
          };
          unsealedDoc = updatedDoc;
          return updatedDoc;
        }
        return doc;
      })
    );

    handleLogAudit(
      'TAMPER_CHECK_PASS',
      session.department || 'All',
      'GRANTED',
      `Barcode Verification Success: Document [${verifiedBarcode}] scanned and verified by recipient ${session.userName}. Seal confirmed intact and document unlocked.`,
      selectedDocForVerify?.title
    );

    if (unsealedDoc) {
      setSelectedDocForViewer(unsealedDoc);
    }
  };

  // Handle clicking a document that is accessible
  const handleSelectDocument = (doc: DocumentItem) => {
    setSelectedDocForViewer(doc);
    handleLogAudit(
      'VIEW',
      doc.department,
      'GRANTED',
      `Document viewed: "${doc.title}"`,
      doc.title
    );
  };

  // Handle clicking a locked document
  const handleAttemptDeniedFile = (doc: DocumentItem) => {
    setDeniedDocForModal(doc);
    handleLogAudit(
      'ACCESS_DENIED',
      doc.department,
      'DENIED',
      `RBAC Policy Violation: Officer (${session.department}) attempted to open file belonging to ${doc.department} department`,
      doc.title
    );
  };

  // Shortcut to ask AI about a specific document
  const handleAskAIAboutDoc = (doc: DocumentItem) => {
    setActiveTab('ai');
  };

  const totalDeniedCount = auditLogs.filter((l) => l.status === 'DENIED').length;

  // Active Real-time Alert Counter
  const pendingBarcodeScansCount = documents.filter(
    (d) => d.assignedToUser === session.userName && d.isPendingVerification
  ).length;
  const activeAlertCount = pendingBarcodeScansCount + totalDeniedCount;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Header with Context Switcher */}
      <Header
        session={session}
        onOpenSessionModal={() => setIsSessionModalOpen(true)}
        onOpenPolicyModal={() => setIsPolicyModalOpen(true)}
        onOpenAuthPortal={() => setIsAuthPortalOpen(true)}
        onOpenScanModal={() => setIsScanModalOpen(true)}
        onOpenAgentModal={() => setIsAgentModalOpen(true)}
        onOpenAlertModal={() => setIsAlertModalOpen(true)}
        activeAlertCount={activeAlertCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalDeniedCount={totalDeniedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {activeTab === 'files' && (
          <FileExplorer
            documents={documents}
            session={session}
            onSelectDocument={handleSelectDocument}
            onAttemptDeniedFile={handleAttemptDeniedFile}
            onOpenScanModal={() => setIsScanModalOpen(true)}
            onOpenTransferModal={(doc) => setSelectedDocForTransfer(doc)}
            onOpenVerifyModal={(doc) => setSelectedDocForVerify(doc)}
            onAskAIAboutDoc={handleAskAIAboutDoc}
            activeDeptFilter={activeDeptFilter}
            onDeptFilterChange={(dept) => setActiveDeptFilter(dept)}
          />
        )}

        {activeTab === 'ai' && (
          <AIAssistant
            session={session}
            onLogAudit={(action, targetDept, status, details) =>
              handleLogAudit(action, targetDept, status, details)
            }
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogView
            auditLogs={auditLogs}
            session={session}
            onRefresh={fetchAuditLogs}
          />
        )}

        {activeTab === 'departments' && (
          <DepartmentDashboard
            documents={documents}
            session={session}
            onSelectDepartment={(dept: Department) => {
              setActiveDeptFilter(dept);
              setActiveTab('files');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-400 font-mono">
        GovFlow Ai Portal • Cryptographic Blockchain Audit & eOffice Workflow Active
      </footer>

      {/* Floating AI Agent Circle Bubble Button */}
      <button
        id="floating-ai-agent-bubble"
        onClick={() => setIsAgentModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full shadow-2xl flex items-center justify-center border-2 border-blue-400/50 hover:scale-110 active:scale-95 transition-all group cursor-pointer"
        title="Open AI Navigation Agent Co-Pilot"
      >
        <div className="relative flex items-center justify-center">
          <Bot className="h-6 w-6 text-white group-hover:rotate-6 transition-transform" />
          <Sparkles className="h-3.5 w-3.5 text-amber-300 absolute -top-1.5 -right-1.5 animate-pulse" />
        </div>
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2.5 text-xs font-bold font-mono transition-all duration-300 ease-in-out">
          AI Co-Pilot
        </span>
      </button>

      {/* Modals */}
      <AuthPortal
        isOpen={isAuthPortalOpen}
        onClose={() => setIsAuthPortalOpen(false)}
        currentSession={session}
        onAuthenticate={(newSession) => {
          setSession(newSession);
          fetchDocuments();
        }}
      />

      <SessionController
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        currentSession={session}
        onSelectSession={(newSession) => {
          setSession(newSession);
          fetchDocuments();
        }}
      />

      <RBACPolicyInfoModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
      />

      <AIAgentNavigationModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        session={session}
        documents={documents}
        onFilterDept={(dept) => setActiveDeptFilter(dept)}
        onOpenDoc={(doc) => setSelectedDocForViewer(doc)}
        onOpenScanBarcode={(doc) => setSelectedDocForVerify(doc)}
        onSwitchTab={(tab) => setActiveTab(tab)}
      />

      <AlertSystemModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        session={session}
        documents={documents}
        auditLogs={auditLogs}
        onOpenScanBarcode={(doc) => setSelectedDocForVerify(doc)}
        onOpenDoc={(doc) => setSelectedDocForViewer(doc)}
        onSwitchTab={(tab) => setActiveTab(tab)}
      />

      <ScanDigitizeModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        session={session}
        onSaveDigitizedDocument={handleSaveDigitizedDocument}
      />

      <SecureTransferModal
        isOpen={selectedDocForTransfer !== null}
        onClose={() => setSelectedDocForTransfer(null)}
        document={selectedDocForTransfer}
        session={session}
        onConfirmTransfer={handleConfirmTransfer}
      />

      <FileViewerModal
        document={selectedDocForViewer}
        session={session}
        onClose={() => setSelectedDocForViewer(null)}
        onAskAI={handleAskAIAboutDoc}
        onOpenTransferModal={(doc) => setSelectedDocForTransfer(doc)}
      />

      <BarcodeVerificationModal
        isOpen={selectedDocForVerify !== null}
        onClose={() => setSelectedDocForVerify(null)}
        document={selectedDocForVerify}
        session={session}
        onVerifySuccess={handleVerifyBarcodeSuccess}
      />

      <AccessDeniedModal
        document={deniedDocForModal}
        session={session}
        onClose={() => setDeniedDocForModal(null)}
        onOpenSessionModal={() => {
          setDeniedDocForModal(null);
          setIsSessionModalOpen(true);
        }}
      />

    </div>
  );
}
