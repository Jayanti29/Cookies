import React, { useState } from 'react';
import { useAnalysis } from '../hooks/useAnalysis';
import { AnalysisProgress } from '../components/AnalysisProgress';
import { FileDropzone } from '../components/FileDropzone';
import { Briefcase, Upload, FileText, Type, Globe, Sparkles } from 'lucide-react';

export const JobGuard: React.FC = () => {
  const { loading, analyzeJob, analyzeFile, analyzeWebsite } = useAnalysis();
  const [tab, setTab] = useState<'upload' | 'text' | 'website'>('upload');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const sampleScamText = `Congratulations! You have been shortlisted for Remote Data Entry Specialist at Google India. Salary: ₹85,000/month. To finalize your employment kit and laptop dispatch, please deposit a refundable security fee of ₹3,500 to HR account...`;

  if (loading) {
    return <AnalysisProgress title="JobGuard verifying offer letter & payment clauses…" />;
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 py-4 animate-in fade-in duration-200">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <Briefcase className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Check a Job Offer
        </h1>
        <p className="text-sm text-stone-500 max-w-md mx-auto">
          Upload an offer letter, recruitment message or job advertisement to check for fake recruitment patterns.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-stone-200/60 p-1 rounded-2xl">
        <button
          onClick={() => setTab('upload')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
            tab === 'upload' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          📄 Offer Letter / PDF
        </button>
        <button
          onClick={() => setTab('text')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
            tab === 'text' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          💬 Message / Email
        </button>
        <button
          onClick={() => setTab('website')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
            tab === 'website' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          🌐 Career Portal
        </button>
      </div>

      {/* Tab: Upload */}
      {tab === 'upload' && (
        <FileDropzone
          onFileSelect={(file) => analyzeFile(file, 'job_offer')}
          label="Drop your offer letter or recruitment screenshot"
          sublabel="PDF or image (PNG, JPG) up to 50MB"
        />
      )}

      {/* Tab: Text */}
      {tab === 'text' && (
        <div className="rounded-3xl bg-white border border-stone-200 p-6 space-y-4 shadow-xs">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
            Paste recruiter message or email content
          </label>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={6}
            placeholder="Paste Telegram message, WhatsApp offer, or email text..."
            className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm"
          />
          <button
            onClick={() => analyzeJob(textInput)}
            disabled={!textInput.trim()}
            className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm transition"
          >
            💼 Analyze Recruitment Message
          </button>
        </div>
      )}

      {/* Tab: Website */}
      {tab === 'website' && (
        <div className="rounded-3xl bg-white border border-stone-200 p-6 space-y-4 shadow-xs">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
            Recruitment portal or application link
          </label>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://company-careers-apply.com"
            className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm"
          />
          <button
            onClick={() => analyzeWebsite(urlInput)}
            disabled={!urlInput.trim()}
            className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm transition"
          >
            🌐 Check Job Site
          </button>
        </div>
      )}

      {/* Demo sample test */}
      <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Test with a suspicious offer pattern</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setTextInput(sampleScamText);
            setTab('text');
            analyzeJob(sampleScamText);
          }}
          className="text-left w-full p-2.5 rounded-xl bg-white hover:bg-amber-50/50 border border-stone-200 text-xs text-stone-600 transition font-mono line-clamp-2"
        >
          {sampleScamText}
        </button>
      </div>
    </div>
  );
};
