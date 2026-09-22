import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuthorityCase, CaseStatus, CasePriority, UserRole, AuditLog } from '../types';
import { ShieldAlert, CheckCircle2, Clock, AlertTriangle, FileText, Filter, Search, UserCheck, ChevronRight, X, Download, ShieldCheck, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [metrics, setMetrics] = useState<any>(null);
  const [cases, setCases] = useState<AuthorityCase[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cases' | 'audit' | 'metrics'>('cases');

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected case for details drawer
  const [selectedCase, setSelectedCase] = useState<AuthorityCase | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [officialReport, setOfficialReport] = useState<any | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewData, casesData, logsData] = await Promise.all([
        api.getAdminOverview(role),
        api.getAdminCases(statusFilter || undefined, priorityFilter || undefined, role),
        api.getAdminAuditLogs(role),
      ]);
      setMetrics(overviewData.metrics);
      setCases(casesData);
      setAuditLogs(logsData);
    } catch {
      toast.error('Failed to load administrative records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [role, statusFilter, priorityFilter]);

  const handleStatusChange = async (caseId: string, newStatus: CaseStatus) => {
    try {
      const updated = await api.updateAdminCaseStatus(
        caseId,
        newStatus,
        actionNote || `Status changed to ${newStatus}`,
        role
      );
      setSelectedCase(updated);
      toast.success(`Case updated to ${newStatus}`);
      setActionNote('');
      fetchDashboardData();
    } catch {
      toast.error('Could not update case status.');
    }
  };

  const handleRecordAction = async (caseId: string, actionType: string) => {
    try {
      const updated = await api.recordAdminAction(
        caseId,
        actionType,
        actionNote || `Action ${actionType} recorded by ${role}`,
        role
      );
      setSelectedCase(updated);
      toast.success(`Action "${actionType}" executed`);
      setActionNote('');
      fetchDashboardData();
    } catch {
      toast.error('Could not record action.');
    }
  };

  const handleAddNote = async (caseId: string) => {
    if (!actionNote.trim()) {
      toast.error('Please enter a note.');
      return;
    }
    try {
      const updated = await api.addAdminNote(caseId, actionNote.trim(), role);
      setSelectedCase(updated);
      toast.success('Internal note added');
      setActionNote('');
      fetchDashboardData();
    } catch {
      toast.error('Could not add note.');
    }
  };

  const handleGenerateReport = async (caseId: string) => {
    try {
      const report = await api.getAdminOfficialReport(caseId, role);
      setOfficialReport(report);
      toast.success('Official case dossier compiled!');
    } catch {
      toast.error('Failed to compile dossier.');
    }
  };

  const filteredCases = cases.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.id.toLowerCase().includes(q) ||
      c.websiteDomain.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6 font-sans text-stone-900 animate-in fade-in duration-200">
      {/* Top Authority Header & Role Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-stone-900 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight">Authority & Admin Center</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 uppercase tracking-wider">
                Restricted Access
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Consumer protection investigations, evidence verification & dossier management
            </p>
          </div>
        </div>

        {/* Active Role Selector */}
        <div className="flex items-center gap-2 text-xs bg-stone-800 p-1.5 rounded-2xl border border-stone-700">
          <span className="text-stone-400 pl-2 font-semibold text-[11px]">Role:</span>
          {(['ADMIN', 'SUPER_ADMIN', 'AUTHORITY_REVIEWER', 'MODERATOR'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-3 py-1.5 rounded-xl font-bold transition text-[11px] ${
                role === r ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
            <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px] block">Total Cases</span>
            <span className="text-2xl font-black text-stone-900">{metrics.totalCases}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
            <span className="text-amber-700 font-bold uppercase tracking-wider text-[10px] block">Pending Review</span>
            <span className="text-2xl font-black text-amber-800">{metrics.pendingReview}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
            <span className="text-blue-700 font-bold uppercase tracking-wider text-[10px] block">Investigating</span>
            <span className="text-2xl font-black text-blue-900">{metrics.underInvestigation}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
            <span className="text-emerald-700 font-bold uppercase tracking-wider text-[10px] block">Verified</span>
            <span className="text-2xl font-black text-emerald-800">{metrics.verifiedReports}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
            <span className="text-rose-700 font-bold uppercase tracking-wider text-[10px] block">High Priority</span>
            <span className="text-2xl font-black text-rose-800">{metrics.highPriority}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
            <span className="text-stone-500 font-bold uppercase tracking-wider text-[10px] block">Resolved</span>
            <span className="text-2xl font-black text-stone-700">{metrics.resolvedCases}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
            <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px] block">Rejected</span>
            <span className="text-2xl font-black text-stone-600">{metrics.rejectedReports}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('cases')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'cases' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Active Investigations ({cases.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'audit' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          System Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* Cases Table Tab */}
      {activeTab === 'cases' && (
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <div className="relative w-full max-w-xs">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter domain, case ID, title…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 text-xs"
              >
                <option value="">All Statuses</option>
                <option value="NEW">NEW</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="ESCALATED">ESCALATED</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 text-xs"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Cases List */}
          <div className="divide-y divide-stone-100">
            {filteredCases.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className="py-3.5 px-3 rounded-2xl hover:bg-stone-50 cursor-pointer transition flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-stone-900">{c.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        c.priority === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : c.priority === 'high'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {c.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-800">
                      {c.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-800">{c.title}</h4>
                  <div className="text-[11px] text-stone-400 flex items-center gap-2 font-mono">
                    <span>{c.websiteDomain}</span>
                    <span>•</span>
                    <span>{new Date(c.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div className="hidden sm:block text-[11px] text-stone-500">
                    <span className="font-bold text-stone-700">{c.communityVotes.experienced}</span> confirmed
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3 text-xs">
          <h3 className="font-bold text-sm text-stone-900">Immutable Administrative Action Audit Trail</h3>
          <div className="divide-y divide-stone-100 font-mono">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="font-bold text-stone-800">{log.action}</span>
                  <p className="text-[11px] text-stone-500 font-sans">{log.details}</p>
                </div>
                <div className="text-right text-[11px] text-stone-400 shrink-0">
                  <span className="block text-stone-700 font-semibold">{log.userId}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Case Details Drawer / Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Drawer Header */}
            <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-amber-400">{selectedCase.id}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-800 text-stone-300">
                    {selectedCase.status}
                  </span>
                </div>
                <h3 className="font-bold text-base mt-1">{selectedCase.title}</h3>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto text-xs text-stone-800">
              {/* Description */}
              <div className="space-y-1">
                <span className="font-bold uppercase tracking-wider text-stone-400 text-[10px] block">Observed Complaint</span>
                <p className="p-3 rounded-2xl bg-stone-50 border border-stone-200 leading-relaxed">
                  {selectedCase.description}
                </p>
              </div>

              {/* AI Findings Summary */}
              <div className="space-y-1">
                <span className="font-bold uppercase tracking-wider text-amber-800 text-[10px] block">
                  AI Model Assessment (Google Gemini 2.5 Flash)
                </span>
                <p className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 leading-relaxed">
                  {selectedCase.aiFindingsSummary}
                </p>
              </div>

              {/* Action History / Timeline */}
              <div className="space-y-2">
                <span className="font-bold uppercase tracking-wider text-stone-400 text-[10px] block">Investigation Timeline</span>
                <div className="space-y-2 font-mono text-[11px]">
                  {selectedCase.actionHistory?.map((act, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-stone-800">{act.actionType}</span>
                        <span className="text-stone-500 font-sans block">{act.notes}</span>
                      </div>
                      <span className="text-stone-400">{new Date(act.performedAt).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Center Controls */}
              <div className="space-y-3 p-4 rounded-2xl bg-stone-100 border border-stone-200">
                <span className="font-bold text-stone-900 block">⚡ Administrative Action Center</span>

                <input
                  type="text"
                  placeholder="Action rationale or internal note…"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs"
                />

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => handleStatusChange(selectedCase.id, 'UNDER_REVIEW')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 font-semibold text-xs"
                  >
                    Mark Reviewed
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedCase.id, 'VERIFIED')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                  >
                    Mark Verified
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedCase.id, 'ESCALATED')}
                    className="px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs"
                  >
                    Escalate Case
                  </button>
                  <button
                    onClick={() => handleRecordAction(selectedCase.id, 'REQUEST_EVIDENCE')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 font-semibold text-xs"
                  >
                    Request Evidence
                  </button>
                  <button
                    onClick={() => handleAddNote(selectedCase.id)}
                    className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center">
              <button
                onClick={() => handleGenerateReport(selectedCase.id)}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-amber-400 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Official Dossier</span>
              </button>

              <button
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Case Report Modal */}
      {officialReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Formal Consumer Safety Dossier</h3>
                <p className="text-xs text-amber-400 font-mono">Prepared for External Submission</p>
              </div>
              <button
                onClick={() => setOfficialReport(null)}
                className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto font-mono text-xs text-stone-800">
              <pre className="p-4 rounded-2xl bg-stone-50 border border-stone-200 overflow-x-auto text-[11px] leading-relaxed">
                {JSON.stringify(officialReport, null, 2)}
              </pre>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(officialReport, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `dossier_${officialReport.caseMetadata?.caseId}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  toast.success('Dossier downloaded');
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON Dossier</span>
              </button>
              <button
                onClick={() => setOfficialReport(null)}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
