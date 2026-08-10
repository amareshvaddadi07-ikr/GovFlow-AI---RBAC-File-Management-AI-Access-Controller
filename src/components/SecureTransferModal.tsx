import React, { useState } from 'react';
import { DocumentItem, UserSession, Department, TransferRecord } from '../types';
import { USER_PRESETS } from '../data/mockData';
import { BarcodeDisplay } from './BarcodeDisplay';
import { Send, X, ShieldCheck, Lock, AlertTriangle, ArrowRight, CheckCircle2, User, Building, FileText } from 'lucide-react';

interface SecureTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  session: UserSession;
  onConfirmTransfer: (docId: string, transferRecord: TransferRecord) => void;
}

export const SecureTransferModal: React.FC<SecureTransferModalProps> = ({
  isOpen,
  onClose,
  document,
  session,
  onConfirmTransfer,
}) => {
  const [selectedRecipient, setSelectedRecipient] = useState<UserSession>(USER_PRESETS[0]);
  const [transferNotes, setTransferNotes] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [transferSuccess, setTransferSuccess] = useState<boolean>(false);

  if (!isOpen || !document) return null;

  const isCommissioner = session.role === 'Commissioner';
  const isRecipientCommissioner = selectedRecipient.role === 'Commissioner';
  
  // RBAC clearance check for transfer:
  // An officer can only transfer files from their own department OR to a commissioner or officer in cleared department.
  const isTransferAllowed =
    isCommissioner ||
    document.department.toLowerCase() === (session.department || '').toLowerCase() ||
    isRecipientCommissioner ||
    selectedRecipient.department === document.department;

  const handleExecuteTransfer = () => {
    if (!isTransferAllowed) return;

    setIsTransferring(true);

    setTimeout(() => {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const record: TransferRecord = {
        id: `tr-${Date.now()}`,
        fromUser: session.userName,
        fromBadgeId: session.badgeId || 'OFF-SYS-100',
        fromDepartment: session.department || 'All',
        toUser: selectedRecipient.userName,
        toBadgeId: selectedRecipient.badgeId || 'REC-SYS-200',
        toDepartment: selectedRecipient.department,
        timestamp: now,
        payloadHash: document.sha256Hash || 'sha256:7f8e32a10b49c71d62e30129f8c14a938217d842b109e4a0',
        barcode: document.barcode || 'DOC-DIGI-2026-90412',
        notes: transferNotes || 'Confidential Inter-Departmental Official Dispatch',
        status: 'VERIFIED'
      };

      onConfirmTransfer(document.id, record);
      setIsTransferring(false);
      setTransferSuccess(true);
    }, 1200);
  };

  const handleDone = () => {
    setTransferSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-2xl text-slate-800 relative max-h-[90vh] flex flex-col overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <Send className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Official Secure Document Transfer</h2>
              <p className="text-xs text-slate-500 font-mono">
                Cryptographic Inter-Departmental Dispatch with Tamper Prevention
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-4 flex-1">
          
          {!transferSuccess ? (
            <>
              {/* Document Overview & Barcode */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span>{document.title}</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                    {document.department}
                  </span>
                </div>

                <div className="text-slate-600">
                  <span className="text-slate-400 font-bold uppercase mr-2">SHA-256 HASH:</span>
                  <span>{document.sha256Hash}</span>
                </div>

                <div className="pt-2">
                  <BarcodeDisplay barcode={document.barcode} compact />
                </div>
              </div>

              {/* Recipient Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center space-x-1">
                  <User className="h-3.5 w-3.5 text-blue-600" />
                  <span>Select Target Official Recipient:</span>
                </label>
                <select
                  value={selectedRecipient.userName}
                  onChange={(e) => {
                    const target = USER_PRESETS.find((u) => u.userName === e.target.value);
                    if (target) setSelectedRecipient(target);
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  {USER_PRESETS.map((user) => (
                    <option key={user.badgeId} value={user.userName}>
                      {user.userName} ({user.title} - {user.department}) [{user.badgeId}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Clearance Check Diagnostic */}
              <div
                className={`p-3 rounded-xl border text-xs font-mono flex items-center space-x-3 ${
                  isTransferAllowed
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                {isTransferAllowed ? (
                  <>
                    <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold block">RBAC Transfer Clearance Granted:</span>
                      <span>
                        Sender ({session.role}) and Recipient ({selectedRecipient.role}) authorized for payload.
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold block">RBAC Transfer Blocked:</span>
                      <span>
                        Department Officer cannot dispatch confidential files outside assigned department without Commissioner clearance.
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Transfer Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dispatch Instructions / Notes:</label>
                <textarea
                  rows={2}
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  placeholder="Optional confidential dispatch memo or routing instructions..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Execute Transfer Button */}
              <div className="pt-2 flex justify-end">
                <button
                  disabled={!isTransferAllowed || isTransferring}
                  onClick={handleExecuteTransfer}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md flex items-center space-x-2 ${
                    isTransferAllowed && !isTransferring
                      ? 'bg-blue-600 hover:bg-blue-700 border border-blue-700'
                      : 'bg-slate-300 border border-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Send className="h-4 w-4" />
                  <span>{isTransferring ? 'Sealing & Transferring Payload...' : 'Initiate Secure Dispatch'}</span>
                </button>
              </div>
            </>
          ) : (
            /* Transfer Success Receipt */
            <div className="py-6 space-y-4 animate-fade-in text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Transfer Completed & Sealed</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Official payload transmitted with intact cryptographic signature & barcode tracking.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left text-xs font-mono space-y-2">
                <div className="flex justify-between border-b pb-1 text-slate-500 font-bold uppercase">
                  <span>Dispatch Receipt:</span>
                  <span className="text-emerald-600">DELIVERED</span>
                </div>
                <div><strong className="text-slate-800">Sender:</strong> {session.userName} ({session.role})</div>
                <div><strong className="text-slate-800">Recipient:</strong> {selectedRecipient.userName} ({selectedRecipient.department})</div>
                <div><strong className="text-slate-800">Barcode ID:</strong> {document.barcode}</div>
                <div><strong className="text-slate-800">SHA-256 Hash:</strong> {document.sha256Hash}</div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleDone}
                  className="px-6 py-2 rounded-lg text-xs font-bold uppercase text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
