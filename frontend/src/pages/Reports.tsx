import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { FileText, Plus, AlertCircle, ThumbsUp, Calendar, ExternalLink } from 'lucide-react';

export const Reports: React.FC = () => {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        if (currentUser) {
          const data = await api.getMyReports();
          setReports(data);
        } else {
          const communityData = await api.getCommunityReports();
          setReports(communityData);
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [currentUser]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            {currentUser ? 'My Reports' : 'Community Reports'}
          </h1>
          <p className="text-sm text-stone-500">
            {currentUser
              ? 'Safety reports you have contributed to the community.'
              : 'Recent deceptive patterns reported by verified users.'}
          </p>
        </div>

        <Link
          to="/reports/new"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Report Something</span>
        </Link>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="py-16 text-center text-stone-400 text-sm">Loading reports…</div>
      ) : reports.length === 0 ? (
        <div className="rounded-3xl bg-white border border-stone-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-stone-800">No reports yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Reports you submit to warn others about suspicious links or scams will appear here.
          </p>
          <Link
            to="/reports/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Report Something</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-2xl bg-white border border-stone-200 p-5 space-y-3 shadow-xs hover:border-amber-300 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    {report.category?.replace(/_/g, ' ')}
                  </span>
                  <h3 className="text-base font-bold text-stone-900 mt-1">{report.title}</h3>
                </div>
                <div className="flex items-center gap-1 text-xs text-stone-500 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                {report.description}
              </p>

              {report.url && (
                <div className="text-xs font-mono text-stone-500 truncate bg-stone-50 p-2 rounded-xl border border-stone-150">
                  {report.url}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-500">
                <span className="capitalize font-semibold text-emerald-700">Status: {report.status}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-semibold text-stone-600">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{report.communityVotes?.experienced || 0} experienced</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
