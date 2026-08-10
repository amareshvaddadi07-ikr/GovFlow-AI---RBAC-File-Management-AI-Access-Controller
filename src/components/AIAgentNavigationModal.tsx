import React, { useState } from 'react';
import { UserSession, DocumentItem } from '../types';
import {
  Bot,
  Send,
  Sparkles,
  X,
  Compass,
  FileText,
  Scan,
  Building,
  ArrowRight,
  RefreshCw,
  Search,
  ShieldCheck,
  Zap,
  Filter
} from 'lucide-react';

export interface SuggestedAction {
  label: string;
  actionType: 'FILTER_DEPT' | 'OPEN_DOC' | 'SCAN_BARCODE' | 'SWITCH_TAB';
  targetValue: string;
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  actions?: SuggestedAction[];
  timestamp: string;
}

interface AIAgentNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  documents: DocumentItem[];
  onFilterDept: (dept: string) => void;
  onOpenDoc: (doc: DocumentItem) => void;
  onOpenScanBarcode: (doc: DocumentItem) => void;
  onSwitchTab: (tab: string) => void;
}

export const AIAgentNavigationModal: React.FC<AIAgentNavigationModalProps> = ({
  isOpen,
  onClose,
  session,
  documents,
  onFilterDept,
  onOpenDoc,
  onOpenScanBarcode,
  onSwitchTab,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'agent',
      text: `Hello Officer ${session.userName}. I am the Core Cryptographic Ledger & eOffice AI Navigation Engine. Ask me to locate files, verify barcodes, or query the Blockchain Audit Trail.

- **Block ID & Hash:** Block #0 | Genesis Hash: 0000a1f893c2001e
- **Previous Block Hash:** [Genesis Root]
- **Current Barcode:** BC-SYS-INIT-2026
- **Chain Status:** Verified Intact
- **Current Holder / Viewer:** ${session.userName} (${session.department})
- **Telemetry Log:** Views: Active Session | Copied Text: No
- **Smart Contract Action:** Normal Ledger Update`,
      actions: [
        { label: '📬 Pending Barcode Dispatches', actionType: 'SWITCH_TAB', targetValue: 'files' },
        { label: '📊 Finance Department Files', actionType: 'FILTER_DEPT', targetValue: 'Finance' },
        { label: '🛡️ Department Access Matrix', actionType: 'SWITCH_TAB', targetValue: 'departments' }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  if (!isOpen) return null;

  const handleSendQuery = async (customQuery?: string) => {
    const textToSend = customQuery || query;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/agent/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, session })
      });

      const data = await res.json();

      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: data.reply || 'Query processed.',
        actions: data.suggestedActions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'agent',
          text: 'Error contacting AI Navigation Agent service.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = (action: SuggestedAction) => {
    onClose();
    if (action.actionType === 'FILTER_DEPT') {
      onSwitchTab('files');
      onFilterDept(action.targetValue);
    } else if (action.actionType === 'SWITCH_TAB') {
      onSwitchTab(action.targetValue);
    } else if (action.actionType === 'OPEN_DOC') {
      const doc = documents.find((d) => d.id === action.targetValue || d.barcode === action.targetValue);
      if (doc) onOpenDoc(doc);
    } else if (action.actionType === 'SCAN_BARCODE') {
      const doc = documents.find((d) => d.id === action.targetValue || d.barcode === action.targetValue);
      if (doc) onOpenScanBarcode(doc);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/40">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-base tracking-tight text-white">AI Navigation & Search Agent</h2>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold rounded border border-blue-400/30 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  Gemini 3.6
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Intelligent portal navigation, file lookup & barcode match assistant
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

        {/* Quick Search Chips */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 flex gap-2 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => handleSendQuery('Find my pending barcode verification files')}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-400 text-slate-700 hover:text-blue-600 rounded-lg whitespace-nowrap shadow-xs transition-all flex items-center space-x-1"
          >
            <Scan className="h-3.5 w-3.5 text-amber-500" />
            <span>Pending Barcode Scans</span>
          </button>

          <button
            onClick={() => handleSendQuery('Where are the Finance department documents?')}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-400 text-slate-700 hover:text-blue-600 rounded-lg whitespace-nowrap shadow-xs transition-all flex items-center space-x-1"
          >
            <Building className="h-3.5 w-3.5 text-blue-500" />
            <span>Finance Files</span>
          </button>

          <button
            onClick={() => handleSendQuery('Show classified security audit logs')}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-400 text-slate-700 hover:text-blue-600 rounded-lg whitespace-nowrap shadow-xs transition-all flex items-center space-x-1"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Security Logs</span>
          </button>
        </div>

        {/* Chat Messages Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 px-1">
                <span>{msg.sender === 'user' ? session.userName : 'AI Navigation Agent'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed font-sans ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs shadow-md'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-sm font-mono'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Suggested Action Buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                    {msg.actions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => executeAction(act)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold font-mono transition-all flex items-center space-x-1.5 shadow-2xs group"
                      >
                        <Zap className="h-3.5 w-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                        <span>{act.label}</span>
                        <ArrowRight className="h-3 w-3 text-blue-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 p-3 bg-white border border-slate-200 rounded-2xl w-max">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <span>Analyzing portal catalog & routing query...</span>
            </div>
          )}
        </div>

        {/* Query Input Footer */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="flex items-center space-x-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask AI to find a file, barcode, or department..."
                className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className={`p-2.5 rounded-xl text-white transition-all shadow-md ${
                query.trim() && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
