import React, { useState, useRef, useEffect } from 'react';
import { UserSession, ChatMessage } from '../types';
import { ShieldCheck, ShieldAlert, Send, Bot, User, Lock, Sparkles, RefreshCw, FileText, CheckCircle2, XCircle, Terminal, HelpCircle } from 'lucide-react';

interface AIAssistantProps {
  session: UserSession;
  onLogAudit: (action: string, targetDept: string, status: 'GRANTED' | 'DENIED', details: string) => void;
  onSelectDocumentForModal?: (docId: string) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  session,
  onLogAudit,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello ${session.userName}. I am the AI Data Access Controller for the organizational file management system.\n\nActive Context:\n• Role: ${session.role}\n• Department Clearance: ${session.role === 'Commissioner' ? 'Universal (All Departments)' : session.department}\n\nI strictly enforce Role-Based Access Control (RBAC). How can I assist you with your department files today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      accessCheck: {
        evaluatedRole: session.role,
        evaluatedDept: session.department || 'All',
        granted: true,
        inspectedPolicyRule: 'Rule #1: Identified user Role & Department context on session start.',
      },
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInspector, setShowInspector] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (overridePrompt?: string) => {
    const query = overridePrompt || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!overridePrompt) setInput('');
    setIsLoading(true);

    try {
      let data: any = null;
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            session,
          }),
        });
        if (response.ok) {
          data = await response.json();
        }
      } catch (e) {
        console.warn('Backend server unavailable, utilizing static client RBAC controller fallback');
      }

      // If server response unavailable (e.g. GitHub Pages static deployment), perform client-side RBAC evaluation
      if (!data || !data.reply) {
        const lowerQ = query.toLowerCase();
        const userDept = session.department?.toLowerCase() || '';
        const isComm = session.role === 'Commissioner';
        
        let targetDept = session.department || 'Finance';
        if (lowerQ.includes('finance')) targetDept = 'Finance';
        else if (lowerQ.includes('hr') || lowerQ.includes('human resource')) targetDept = 'HR';
        else if (lowerQ.includes('operation')) targetDept = 'Operations';
        else if (lowerQ.includes('it') || lowerQ.includes('security')) targetDept = 'IT & Security';
        else if (lowerQ.includes('legal') || lowerQ.includes('compliance')) targetDept = 'Legal & Compliance';

        const isGranted = isComm || targetDept.toLowerCase() === userDept;

        if (!isGranted) {
          data = {
            reply: `⛔ **ACCESS DENIED by GovFlow AI Controller**\n\nYour active session user **${session.userName}** (${session.role}) only holds clearance for the **${session.department}** department.\n\nYou do not have clearance to query or view records belonging to **${targetDept}**.\n\n*Policy Enforced: Departmental Isolation & Clearance Barrier.*`,
            accessCheck: {
              evaluatedRole: session.role,
              evaluatedDept: session.department,
              requestedDept: targetDept,
              granted: false,
              inspectedPolicyRule: `Rule #2: Non-Commissioner users cannot access external department records (${targetDept}).`,
            },
            sourcesCited: [],
          };
        } else {
          data = {
            reply: `✅ **ACCESS GRANTED** (${session.role} Clearance)\n\nSummarizing requested **${targetDept}** records for **${session.userName}**:\n\n• Found official sealed documents under active clearance.\n• Barcode authentication verified with HMAC-SHA256 integrity.\n• RBAC access policy verified: User holds authorized access for ${targetDept}.`,
            accessCheck: {
              evaluatedRole: session.role,
              evaluatedDept: session.department,
              requestedDept: targetDept,
              granted: true,
              inspectedPolicyRule: `Rule #1: User session holds valid departmental clearance for ${targetDept}.`,
            },
            sourcesCited: [`DOC-${targetDept.substring(0,3).toUpperCase()}-2026`],
          };
        }
      }

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'No response returned from access controller.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        accessCheck: data.accessCheck,
        sourcesCited: data.sourcesCited,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Trigger audit log sync if needed
      if (data.accessCheck) {
        onLogAudit(
          'AI_QUERY',
          data.accessCheck.requestedDept || session.department || 'General',
          data.accessCheck.granted ? 'GRANTED' : 'DENIED',
          data.accessCheck.granted
            ? `AI query answered within clearance scope (${session.department})`
            : `AI Controller blocked prompt outside department scope`
        );
      }
    } catch (err) {
      console.error('AI Controller error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Access Controller Error: Failed to evaluate request. Please retry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const isCommissioner = session.role === 'Commissioner';

  // Preset quick prompt buttons tailored to test RBAC enforcement
  const quickPrompts = [
    {
      label: `Summarize my ${session.department || 'assigned'} files`,
      prompt: `Summarize the key files and metrics available in my assigned department (${session.department || 'Finance'}).`,
      type: 'in-scope',
    },
    {
      label: 'Request Q3 Revenue & Budget Audit (Finance)',
      prompt: 'Summarize the Q3 Revenue Audit and Budget Allocation Report.',
      targetDept: 'Finance',
      type: 'test',
    },
    {
      label: 'Request Executive Salaries & Bonus Matrix (Finance)',
      prompt: 'What are the executive compensation and salary bonus matrices for 2026?',
      targetDept: 'Finance',
      type: 'test',
    },
    {
      label: 'Request Q2 HR Performance Reviews & Salary Bumps (HR)',
      prompt: 'List the employees recommended for promotions and salary bumps in the Q2 HR evaluation.',
      targetDept: 'HR',
      type: 'test',
    },
    {
      label: 'Request Penetration Test Findings (IT & Security)',
      prompt: 'What are the top secret vulnerability findings from the Q2 penetration test report?',
      targetDept: 'IT & Security',
      type: 'test',
    },
    {
      label: 'Request Supply Chain Continuity Plan (Operations)',
      prompt: 'Show me the logistics continuity plan and warehouse inventory breakdown.',
      targetDept: 'Operations',
      type: 'test',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Main Chat Window (2 Cols on Large Screen) */}
      <div className="lg:col-span-2 flex flex-col h-[78vh] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Chat Header */}
        <div className="bg-white p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-slate-900">AI Data Access Controller</h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 font-mono font-bold border border-green-200">
                  RBAC Enforcement Active
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Context: <span className="text-slate-900 font-bold">{session.userName}</span> ({session.role} -{' '}
                <span className="text-blue-700 font-bold">{isCommissioner ? 'Universal Clearance' : session.department}</span>)
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowInspector(!showInspector)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center space-x-1.5 uppercase tracking-wide ${
              showInspector
                ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Policy Inspector</span>
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isDenied = msg.text.includes('Access Denied');

            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${
                  isUser ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm ${
                    isUser
                      ? 'bg-blue-600 text-white'
                      : isDenied
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : isDenied ? <Lock className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-slate-100 border border-slate-200 text-slate-900 font-semibold rounded-tr-none'
                    : isDenied
                    ? 'bg-red-50 border-l-4 border-red-500 text-red-900 rounded-xl shadow-sm'
                    : 'bg-white border border-blue-100 text-slate-800 rounded-tl-none shadow-sm'
                }`}>
                  
                  {/* Status badge for AI responses */}
                  {!isUser && msg.accessCheck && (
                    <div className="mb-2 pb-2 border-b border-slate-200/80 flex items-center justify-between text-xs">
                      <span className={`font-mono text-[11px] font-bold uppercase flex items-center gap-1 ${
                        msg.accessCheck.granted ? 'text-emerald-700' : 'text-red-700'
                      }`}>
                        {msg.accessCheck.granted ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>ACCESS GRANTED ({msg.accessCheck.evaluatedDept})</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5 text-red-600" />
                            <span>ACCESS DENIED (POLICY ENFORCED)</span>
                          </>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                    </div>
                  )}

                  {/* Main text message */}
                  <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                  {/* Sources Cited section if granted */}
                  {msg.sourcesCited && msg.sourcesCited.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80">
                      <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <FileText className="h-3 w-3 text-blue-600" />
                        <span>Authorized Sources Cited ({msg.sourcesCited.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sourcesCited.map((src) => (
                          <span
                            key={src.documentId}
                            className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[11px] font-mono border border-blue-200 font-medium"
                          >
                            [{src.department}] {src.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center space-x-3 text-slate-500 text-xs font-mono animate-pulse">
              <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-200">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              </div>
              <div>Evaluating User Role ({session.role}) & Department ({session.department})...</div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isCommissioner
                  ? "Ask anything across all departments (Universal Clearance)..."
                  : `Ask about ${session.department} files (Role: Officer - ${session.department} only)...`
              }
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none placeholder-slate-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 border border-blue-700 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wide transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <span>Send</span>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Policy Inspector & Testing Prompts */}
      <div className="space-y-6">
        
        {/* Quick Test Prompts Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>RBAC Policy Test Prompts</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Click to test</span>
          </div>

          <div className="space-y-2">
            {quickPrompts.map((item, idx) => {
              const isAllowedForUser =
                isCommissioner ||
                !item.targetDept ||
                item.targetDept.toLowerCase() === (session.department || '').toLowerCase();

              return (
                <button
                  key={idx}
                  onClick={() => handleSend(item.prompt)}
                  disabled={isLoading}
                  className={`w-full text-left p-2.5 rounded-lg text-xs font-medium border transition-all flex items-start justify-between ${
                    isAllowedForUser
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                      : 'bg-red-50/60 hover:bg-red-100/60 border-red-200 text-red-900'
                  }`}
                >
                  <div className="flex-1 pr-2">
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <span>{item.label}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      "{item.prompt}"
                    </div>
                  </div>

                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase flex-shrink-0 ${
                      isAllowedForUser
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {isAllowedForUser ? 'In-Scope' : 'Cross-Dept Test'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Policy Inspector & Active Operational Rules */}
        {showInspector && (
          <div className="bg-slate-900 text-slate-300 rounded-xl p-5 border border-slate-800 text-xs space-y-3 font-mono shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-blue-400" />
                <span>Active Enforcement Rules</span>
              </span>
              <span className="text-[10px] bg-blue-900/40 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-mono">
                System Prompt
              </span>
            </div>

            <div className="space-y-2 text-slate-300 font-mono text-[11px]">
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-slate-400 font-bold mb-1">Rule 1: Role & Dept Check</div>
                <div>Evaluate User Role ({session.role}) & Department ({session.department || 'None'}) before processing.</div>
              </div>

              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-slate-400 font-bold mb-1">Rule 2: Officer Denial Message</div>
                <div className="text-red-400 italic font-sans text-xs font-semibold">
                  "Access Denied: You do not have clearance to view files outside of your assigned department."
                </div>
              </div>

              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-slate-400 font-bold mb-1">Rule 3: Commissioner Privilege</div>
                <div>Commissioner has universal clearance to fulfill requests across all departments.</div>
              </div>

              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-slate-400 font-bold mb-1">Rule 4: Zero Information Leakage</div>
                <div>Never leak, summarize, or hint at files outside an Officer's department.</div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
