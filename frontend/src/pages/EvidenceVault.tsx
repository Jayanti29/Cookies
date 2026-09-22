import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { PrivacyIndicator } from '../components/PrivacyIndicator';
import { Lock, Plus, Trash2, ExternalLink, Calendar, FileText, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export const EvidenceVault: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvidence() {
      try {
        if (isAuthenticated) {
          const items = await api.getEvidence();
          setEvidenceList(items);
        }
      } catch (err) {
        console.error('Failed to load evidence vault:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvidence();
  }, [isAuthenticated]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this evidence?')) return;
    try {
      await api.deleteEvidence(id);
      setEvidenceList((prev) => prev.filter((item) => item.id !== id));
      toast.success('Evidence removed from your vault');
    } catch {
      toast.error('Could not delete item');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-700" />
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              My Evidence Vault
            </h1>
          </div>
          <p className="text-sm text-stone-500 mt-0.5">
            Encrypted private storage for your screenshots, messages, and fraud records.
          </p>
        </div>

        <button
          onClick={() => navigate('/check')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Evidence</span>
        </button>
      </div>

      <PrivacyIndicator type="vault" />

      {/* Main Content */}
      {loading ? (
        <div className="py-16 text-center text-stone-400 text-sm">Loading your evidence vault…</div>
      ) : evidenceList.length === 0 ? (
        <div className="rounded-3xl bg-white border border-stone-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-stone-800">Your evidence vault is empty.</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            When you scan websites or check suspicious messages, click "Save Evidence" to keep a permanent private record.
          </p>
          <button
            onClick={() => navigate('/check')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition"
          >
            <span>Check Something</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {evidenceList.map((item, idx) => (
            <div
              key={item.id}
              className="rounded-3xl bg-white border border-stone-200 p-5 space-y-3 shadow-xs hover:border-amber-300 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                    Case #{String(idx + 1).padStart(3, '0')}
                  </span>
                  <h3 className="text-base font-bold text-stone-900 mt-1">{item.title}</h3>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete evidence"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-stone-600 line-clamp-2">{item.description}</p>

              <div className="flex items-center gap-3 text-xs text-stone-500 pt-2 border-t border-stone-100">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </span>
                <span className="capitalize text-stone-600 font-medium">{item.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
