import React, { useState, useEffect } from 'react';
import { DocumentItem, UserSession, Department, Classification } from '../types';
import { BarcodeDisplay } from './BarcodeDisplay';
import { Lock, Unlock, Search, Filter, Grid, List, FileText, Eye, ShieldAlert, Sparkles, Building, Scan, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface FileExplorerProps {
  documents: DocumentItem[];
  session: UserSession;
  onSelectDocument: (doc: DocumentItem) => void;
  onAttemptDeniedFile: (doc: DocumentItem) => void;
  onOpenScanModal: () => void;
  onOpenTransferModal: (doc: DocumentItem) => void;
  onOpenVerifyModal: (doc: DocumentItem) => void;
  onAskAIAboutDoc: (doc: DocumentItem) => void;
  activeDeptFilter?: string;
  onDeptFilterChange?: (dept: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  documents,
  session,
  onSelectDocument,
  onAttemptDeniedFile,
  onOpenScanModal,
  onOpenTransferModal,
  onOpenVerifyModal,
  onAskAIAboutDoc,
  activeDeptFilter,
  onDeptFilterChange,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>(activeDeptFilter || 'All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterMyDeptOnly, setFilterMyDeptOnly] = useState<boolean>(false);

  useEffect(() => {
    if (activeDeptFilter) {
      setSelectedDept(activeDeptFilter);
    }
  }, [activeDeptFilter]);

  const isCommissioner = session.role === 'Commissioner';

  // Incoming Dispatches Pending Barcode Verification for logged in user
  const pendingVerificationDocs = documents.filter(
    (doc) => doc.assignedToUser === session.userName && doc.isPendingVerification
  );

  const departmentsList: Array<Department | 'All'> = [
    'All',
    'Finance',
    'HR',
    'Operations',
    'IT & Security',
    'Legal & Compliance',
  ];

  // Filter documents
  const filteredDocs = documents.filter((doc) => {
    // Dept Tab filter
    if (selectedDept !== 'All' && doc.department.toLowerCase() !== selectedDept.toLowerCase()) {
      return false;
    }

    // Toggle filter "My Department Only"
    if (filterMyDeptOnly && !isCommissioner && doc.department.toLowerCase() !== (session.department || '').toLowerCase()) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchDept = doc.department.toLowerCase().includes(q);
      const matchBarcode = (doc.barcode || '').toLowerCase().includes(q);
      const matchTags = doc.tags.some((t) => t.toLowerCase().includes(q));
      const matchDesc = doc.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDept && !matchBarcode && !matchTags && !matchDesc) return false;
    }

    return true;
  });

  const getClassificationColor = (classification: Classification) => {
    switch (classification) {
      case 'Top Secret':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Restricted':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Confidential':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Internal':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Banner & Action Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Official Confidential Document Transfer Vault</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono font-bold border border-blue-200">
              {filteredDocs.length} Barcode-Sealed Documents
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Tamper-Proof Inter-Departmental Transfer Portal • {isCommissioner ? 'Universal Access Mode' : `Cleared for ${session.department} files`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* My Dept Toggle for Officer */}
          {!isCommissioner && (
            <button
              onClick={() => setFilterMyDeptOnly(!filterMyDeptOnly)}
              className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center space-x-2 uppercase tracking-wide ${
                filterMyDeptOnly
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>My Dept Only ({session.department})</span>
            </button>
          )}

          {/* Scan & Digitize Button */}
          <button
            id="scan-digitize-btn"
            onClick={onOpenScanModal}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-700 transition-colors shadow-sm uppercase tracking-wide flex items-center space-x-2"
          >
            <Scan className="h-4 w-4 text-emerald-200" />
            <span>Scan & Digitize Document</span>
          </button>
        </div>
      </div>

      {/* INCOMING DISPATCH PENDING BARCODE VERIFICATION BANNER */}
      {pendingVerificationDocs.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 shadow-sm space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm">
                <Scan className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-amber-950 uppercase tracking-tight flex items-center gap-2">
                  <span>📬 Incoming Dispatch Dispatched to {session.userName}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-mono">
                    {pendingVerificationDocs.length} Pending Scan
                  </span>
                </h2>
                <p className="text-xs text-amber-800 font-mono mt-0.5">
                  Scan the physical/printed document barcode to verify cryptographic seal & unseal document contents.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingVerificationDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-amber-300 rounded-xl p-3.5 font-mono text-xs flex items-center justify-between shadow-xs hover:border-amber-400 transition-all"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block truncate max-w-xs text-xs">{doc.title}</span>
                  <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                    <span>Sender: <strong>{doc.author}</strong></span>
                    <span>•</span>
                    <span className="text-amber-800 font-bold">{doc.barcode}</span>
                  </div>
                </div>
                <button
                  onClick={() => onOpenVerifyModal(doc)}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold uppercase transition-all shadow-sm flex items-center space-x-1.5 flex-shrink-0"
                >
                  <Scan className="h-3.5 w-3.5 text-amber-200" />
                  <span>Scan Barcode</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Controls */}
      <div className="space-y-4">
        
        {/* Department Tab Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {departmentsList.map((dept) => {
            const isSelected = selectedDept === dept;
            const isUserDepartment = !isCommissioner && dept.toLowerCase() === (session.department || '').toLowerCase();

            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center space-x-2 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{dept === 'All' ? '📁 All Departments' : dept}</span>
                {isUserDepartment && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-mono font-bold">
                    Mine
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, barcode ID, department, tags..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Grid vs List View Switcher */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center space-x-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Files Display Grid / List */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 space-y-3 shadow-sm">
          <FileText className="h-10 w-10 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No documents found in vault matching criteria.</p>
          <p className="text-xs text-slate-500">Scan a new document or adjust search filters.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => {
            const isAccessible =
              isCommissioner || doc.department.toLowerCase() === (session.department || '').toLowerCase();
            const isPendingForMe = doc.assignedToUser === session.userName && doc.isPendingVerification;

            return (
              <div
                key={doc.id}
                className={`bg-white border rounded-xl p-5 transition-all flex flex-col justify-between group relative shadow-sm hover:shadow-md ${
                  isPendingForMe
                    ? 'border-amber-300 bg-amber-50/10 hover:border-amber-400'
                    : isAccessible
                    ? 'border-slate-200 hover:border-blue-400'
                    : 'border-red-200 bg-red-50/20 hover:border-red-300'
                }`}
              >
                {/* Header Row: Classification & RBAC Badge */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold uppercase border ${getClassificationColor(
                        doc.classification
                      )}`}
                    >
                      {doc.classification}
                    </span>

                    {/* RBAC / Verification Badge */}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase flex items-center space-x-1 border ${
                        isPendingForMe
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : isAccessible
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {isPendingForMe ? (
                        <>
                          <Scan className="h-3 w-3 text-amber-600 animate-pulse" />
                          <span>Scan Required</span>
                        </>
                      ) : isAccessible ? (
                        <>
                          <Unlock className="h-3 w-3 text-emerald-600" />
                          <span>Cleared</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3 text-red-600" />
                          <span>Denied</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Title & Department */}
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                    {doc.title}
                  </h3>

                  <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono mb-2">
                    <Building className="h-3.5 w-3.5 text-blue-600" />
                    <span className="font-semibold">{doc.department} Department</span>
                  </div>

                  {/* Barcode Tag Render */}
                  <div className="mb-3">
                    <BarcodeDisplay barcode={doc.barcode} compact />
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {isPendingForMe
                      ? `🔒 Dispatched to ${session.userName}. Scan barcode to unlock contents.`
                      : isAccessible
                      ? doc.description
                      : '🔒 Restricted departmental file. Clearance required to preview contents.'}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {doc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Row: Metadata & Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>{doc.fileSize}</span>

                  <div className="flex items-center space-x-1.5">
                    {isPendingForMe ? (
                      <button
                        onClick={() => onOpenVerifyModal(doc)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-sm flex items-center space-x-1 uppercase"
                      >
                        <Scan className="h-3.5 w-3.5 text-amber-200" />
                        <span>Scan Barcode</span>
                      </button>
                    ) : isAccessible ? (
                      <>
                        <button
                          onClick={() => onOpenTransferModal(doc)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center space-x-1"
                          title="Securely transfer document to official recipient"
                        >
                          <Send className="h-3 w-3 text-blue-600" />
                          <span>Transfer</span>
                        </button>

                        <button
                          onClick={() => onSelectDocument(doc)}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm flex items-center space-x-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onAttemptDeniedFile(doc)}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors flex items-center space-x-1"
                      >
                        <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
                        <span>View Locked</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-mono border-b border-slate-200 uppercase text-[10px]">
                  <th className="p-3.5">Barcode ID</th>
                  <th className="p-3.5">Document Title</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Classification</th>
                  <th className="p-3.5">Clearance</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-sans">
                {filteredDocs.map((doc) => {
                  const isAccessible =
                    isCommissioner || doc.department.toLowerCase() === (session.department || '').toLowerCase();
                  const isPendingForMe = doc.assignedToUser === session.userName && doc.isPendingVerification;

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[11px] block w-max">
                          {doc.barcode}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span className="truncate max-w-xs">{doc.title}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600 font-semibold">{doc.department}</td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold uppercase border ${getClassificationColor(
                            doc.classification
                          )}`}
                        >
                          {doc.classification}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase flex items-center space-x-1 w-max border ${
                            isPendingForMe
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : isAccessible
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {isPendingForMe ? (
                            <>
                              <Scan className="h-3 w-3 text-amber-600 animate-pulse" />
                              <span>Scan Req</span>
                            </>
                          ) : isAccessible ? (
                            <>
                              <Unlock className="h-3 w-3" />
                              <span>Cleared</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3" />
                              <span>Denied</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {isPendingForMe ? (
                          <button
                            onClick={() => onOpenVerifyModal(doc)}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors uppercase"
                          >
                            Scan Barcode
                          </button>
                        ) : isAccessible ? (
                          <>
                            <button
                              onClick={() => onOpenTransferModal(doc)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                              Transfer
                            </button>
                            <button
                              onClick={() => onSelectDocument(doc)}
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                              Open
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => onAttemptDeniedFile(doc)}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                          >
                            Denied
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
