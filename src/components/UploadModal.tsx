import React, { useState } from 'react';
import { UserSession, Department, Classification } from '../types';
import { X, Upload, Check, AlertCircle, FileText, Lock, Building } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  session: UserSession;
  onClose: () => void;
  onDocumentUploaded: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  session,
  onClose,
  onDocumentUploaded,
}) => {
  const isCommissioner = session.role === 'Commissioner';

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState<Department>(
    (session.department as Department) || 'Finance'
  );
  const [classification, setClassification] = useState<Classification>('Confidential');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError('Document title and content are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          fileName: `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
          department: isCommissioner ? department : session.department,
          classification,
          description: description.trim() || 'Uploaded organizational document',
          content: content.trim(),
          tags: tags.length > 0 ? tags : [department],
          session,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload document.');
      }

      onDocumentUploaded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during document upload.');
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Title */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Upload Department Document</h2>
            <p className="text-xs text-slate-500 font-mono">
              Role: <span className="text-slate-900 font-bold">{session.role}</span> • Target Dept Scope:{' '}
              <span className="text-blue-700 font-bold">{isCommissioner ? department : session.department}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex items-center space-x-2 mb-4">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block text-slate-700 font-bold mb-1">Document Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Q4 Operational Infrastructure Audit"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none placeholder-slate-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Target Department</label>
              {isCommissioner ? (
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none font-semibold"
                >
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Operations">Operations</option>
                  <option value="IT & Security">IT & Security</option>
                  <option value="Legal & Compliance">Legal & Compliance</option>
                </select>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-emerald-700 font-mono font-bold flex items-center justify-between">
                  <span>{session.department} (Locked to Assigned Dept)</span>
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Classification Level</label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value as Classification)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none font-semibold"
              >
                <option value="Internal">Internal</option>
                <option value="Confidential">Confidential</option>
                <option value="Restricted">Restricted</option>
                <option value="Top Secret">Top Secret</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Short Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of document purpose..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Tags (Comma Separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Audit, Q4, Procurement, Infrastructure"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none placeholder-slate-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Document Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste or write the document text content here..."
              rows={6}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg p-3 text-xs text-slate-900 font-mono focus:outline-none placeholder-slate-400"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wide text-white bg-blue-600 hover:bg-blue-700 border border-blue-700 transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <Upload className="h-4 w-4" />
              <span>{isSubmitting ? 'Uploading...' : 'Save & Publish File'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
