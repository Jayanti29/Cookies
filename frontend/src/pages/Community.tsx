import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Users, TrendingUp, AlertTriangle, ExternalLink, Calendar, ThumbsUp } from 'lucide-react';
import toast from 'react-hot-toast';

export const Community: React.FC = () => {
  const [trends, setTrends] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [totalReports, setTotalReports] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCommunity() {
      try {
        const [trendData, reportsData] = await Promise.all([
          api.getTrending(),
          api.getCommunityReports(),
        ]);
        setTrends(trendData.trends || []);
        setTotalReports(trendData.totalReports || 0);
        setRecentReports(reportsData || []);
      } catch (err) {
        console.error('Community load failed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCommunity();
  }, []);

  const handleVote = async (reportId: string, vote: string) => {
    try {
      await api.voteReport(reportId, vote);
      toast.success('Vote recorded');
      setRecentReports((prev) =>
        prev.map((r) => {
          if (r.id === reportId) {
            const current = r.communityVotes || { experienced: 0, possibly: 0, does_not_match: 0 };
            return {
              ...r,
              communityVotes: { ...current, [vote]: (current[vote] || 0) + 1 },
            };
          }
          return r;
        })
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Vote failed or already voted');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <Users className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Community Safety Intelligence
        </h1>
        <p className="text-sm text-stone-500 max-w-md mx-auto">
          Real-time reports and verified experiences submitted by everyday users to warn the community.
        </p>
      </div>

      {/* Trending Threats Category Breakdown */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-base">
          <TrendingUp className="w-5 h-5 text-amber-700" />
          <h3>Trending Safety Patterns</h3>
        </div>

        {trends.length === 0 ? (
          <p className="text-xs text-stone-400 py-2">No reports yet in database.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {trends.map((t) => (
              <div key={t.category} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-150">
                <span className="text-2xl font-black text-stone-900 block">{t.count}</span>
                <span className="text-xs font-semibold text-stone-600 capitalize">
                  {t.category.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Community Submissions */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 px-1">
          Recent Community Reports
        </h3>

        {recentReports.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-stone-200 text-center text-xs text-stone-400">
            No community reports recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="rounded-3xl bg-white border border-stone-200 p-5 sm:p-6 space-y-3.5 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                      {report.category?.replace(/_/g, ' ')}
                    </span>
                    <h4 className="text-base font-bold text-stone-900 mt-1">{report.title}</h4>
                  </div>
                  <span className="text-xs text-stone-400 font-medium shrink-0">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">{report.description}</p>

                {report.url && (
                  <div className="text-xs font-mono text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200 break-all">
                    {report.url}
                  </div>
                )}

                {/* Verification Vote Bar */}
                <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <span className="text-stone-500 font-medium">Does this match your experience?</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVote(report.id, 'experienced')}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 font-semibold transition"
                    >
                      Yes, experienced ({report.communityVotes?.experienced || 0})
                    </button>
                    <button
                      onClick={() => handleVote(report.id, 'possibly')}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-amber-50 hover:text-amber-800 text-stone-700 font-semibold transition"
                    >
                      Possibly ({report.communityVotes?.possibly || 0})
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
