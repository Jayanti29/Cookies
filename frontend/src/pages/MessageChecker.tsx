import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalysis } from '../hooks/useAnalysis';
import { AnalysisProgress } from '../components/AnalysisProgress';
import { FileDropzone } from '../components/FileDropzone';
import { MessageSquare, Camera, Sparkles } from 'lucide-react';

export const MessageChecker: React.FC = () => {
  const navigate = useNavigate();
  const { loading, analyzeMessage, analyzeFile } = useAnalysis();
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'screenshot'>('text');

  const sampleMessages = [
    'Your bank account will be blocked within 24 hours. Update your PAN card immediately: https://sbi-kyc-update-portal.info',
    'Congratulations! You won an iPhone 15 in the Diwali Lucky Draw! Click to claim with ₹99 delivery fee: http://win-claim-now.xyz',
    'Parcel delivery failed: Address incomplete. Pay ₹25 re-delivery fee to release package today: http://india-post-track-fees.top',
  ];

  if (loading) {
    return <AnalysisProgress title="Classifying message intent & detecting deception…" />;
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 py-4 animate-in fade-in duration-200">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Check a Message
        </h1>
        <p className="text-sm text-stone-500 max-w-md mx-auto">
          Something suspicious? Show it to COOKIES. We'll automatically identify phishing, impersonation, and payment threats.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-stone-200/60 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'text' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          💬 Paste Message Text
        </button>
        <button
          onClick={() => setActiveTab('screenshot')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'screenshot' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          📷 Upload Screenshot
        </button>
      </div>

      {activeTab === 'text' ? (
        <div className="rounded-3xl bg-white border border-stone-200 p-6 space-y-4 shadow-xs">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="Paste SMS, WhatsApp message, email body, or Instagram DM here..."
            className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm"
          />

          <div className="flex gap-2">
            <button
              onClick={() => analyzeMessage(content)}
              disabled={!content.trim()}
              className="flex-1 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm transition"
            >
              Check Message
            </button>
            <button
              type="button"
              onClick={() => navigate('/camera')}
              className="px-4 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Camera className="w-4 h-4" />
              <span>Camera</span>
            </button>
          </div>
        </div>
      ) : (
        <FileDropzone
          onFileSelect={(file) => analyzeFile(file, 'screenshot')}
          label="Drop a screenshot of your chat, SMS, or email"
          sublabel="PNG, JPG, or WEBP up to 50MB"
        />
      )}

      {/* Quick Test Samples */}
      <div className="rounded-2xl bg-stone-100/70 p-4 border border-stone-200 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Try a real phishing pattern</span>
        </div>
        <div className="space-y-1.5">
          {sampleMessages.map((msg, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setContent(msg);
                setActiveTab('text');
                analyzeMessage(msg);
              }}
              className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-amber-50/50 border border-stone-200 text-xs text-stone-600 truncate transition font-mono block"
            >
              {msg}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
