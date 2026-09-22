import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalysis } from '../hooks/useAnalysis';
import { AnalysisProgress } from '../components/AnalysisProgress';
import { Link2, Image, FileText, Type, Camera, ArrowLeft } from 'lucide-react';

export const UniversalChecker: React.FC = () => {
  const navigate = useNavigate();
  const { loading, analyzeWebsite, analyzeMessage, analyzeFile } = useAnalysis();

  const [mode, setMode] = useState<'options' | 'link' | 'text' | 'image' | 'doc'>('options');
  const [inputValue, setInputValue] = useState('');

  if (loading) {
    return <AnalysisProgress title="Analyzing your content…" />;
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 py-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-3">
        {mode !== 'options' && (
          <button
            onClick={() => setMode('options')}
            className="p-2 rounded-full hover:bg-stone-200/60 text-stone-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            {mode === 'options' ? 'What do you want to check?' : 'Enter details to check'}
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {mode === 'options'
              ? 'Choose any format. We will detect what it is automatically.'
              : 'Our Google AI models will verify indicators without making assumptions.'}
          </p>
        </div>
      </div>

      {/* 5 Main Touch Cards */}
      {mode === 'options' && (
        <div className="space-y-3 pt-2">
          {/* 1. Paste a link */}
          <button
            type="button"
            onClick={() => setMode('link')}
            className="w-full flex items-center justify-between p-5 rounded-3xl bg-white border border-stone-200 hover:border-amber-400 shadow-xs hover:shadow-sm text-left transition group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Link2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">Paste a link</h3>
                <p className="text-xs text-stone-500">Website, online store, or destination URL</p>
              </div>
            </div>
            <span className="text-stone-400 group-hover:text-amber-700 font-bold text-lg">→</span>
          </button>

          {/* 2. Upload an image */}
          <button
            type="button"
            onClick={() => setMode('image')}
            className="w-full flex items-center justify-between p-5 rounded-3xl bg-white border border-stone-200 hover:border-amber-400 shadow-xs hover:shadow-sm text-left transition group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Image className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">Upload an image</h3>
                <p className="text-xs text-stone-500">Screenshot of checkout, message, payment, or ad</p>
              </div>
            </div>
            <span className="text-stone-400 group-hover:text-amber-700 font-bold text-lg">→</span>
          </button>

          {/* 3. Upload a document */}
          <button
            type="button"
            onClick={() => setMode('doc')}
            className="w-full flex items-center justify-between p-5 rounded-3xl bg-white border border-stone-200 hover:border-amber-400 shadow-xs hover:shadow-sm text-left transition group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">Upload a document</h3>
                <p className="text-xs text-stone-500">Offer letter, contract, or PDF invoice</p>
              </div>
            </div>
            <span className="text-stone-400 group-hover:text-amber-700 font-bold text-lg">→</span>
          </button>

          {/* 4. Paste text */}
          <button
            type="button"
            onClick={() => setMode('text')}
            className="w-full flex items-center justify-between p-5 rounded-3xl bg-white border border-stone-200 hover:border-amber-400 shadow-xs hover:shadow-sm text-left transition group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Type className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">Paste text</h3>
                <p className="text-xs text-stone-500">Suspicious SMS, WhatsApp, email, or social DM</p>
              </div>
            </div>
            <span className="text-stone-400 group-hover:text-amber-700 font-bold text-lg">→</span>
          </button>

          {/* 5. Use camera */}
          <button
            type="button"
            onClick={() => navigate('/camera')}
            className="w-full flex items-center justify-between p-5 rounded-3xl bg-white border border-stone-200 hover:border-amber-400 shadow-xs hover:shadow-sm text-left transition group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">Use camera</h3>
                <p className="text-xs text-stone-500">Point phone at another screen, paper, or QR code</p>
              </div>
            </div>
            <span className="text-stone-400 group-hover:text-amber-700 font-bold text-lg">→</span>
          </button>
        </div>
      )}

      {/* Mode: Link Input */}
      {mode === 'link' && (
        <div className="rounded-3xl bg-white border border-stone-200 p-6 space-y-4 shadow-xs">
          <label className="block text-sm font-bold text-stone-900">Website or destination link</label>
          <input
            type="url"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="https://example.com/checkout"
            className="w-full px-4 py-3.5 rounded-2xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm"
          />
          <button
            onClick={() => analyzeWebsite(inputValue)}
            disabled={!inputValue.trim()}
            className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm transition"
          >
            🔍 Check Website Now
          </button>
        </div>
      )}

      {/* Mode: Text Input */}
      {mode === 'text' && (
        <div className="rounded-3xl bg-white border border-stone-200 p-6 space-y-4 shadow-xs">
          <label className="block text-sm font-bold text-stone-900">Paste the suspicious message</label>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            rows={5}
            placeholder="E.g.: 'Dear customer, your electricity will be disconnected tonight at 9:30 PM. Click here to update KYC...'"
            className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm"
          />
          <button
            onClick={() => analyzeMessage(inputValue)}
            disabled={!inputValue.trim()}
            className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm transition"
          >
            💬 Check Message Now
          </button>
        </div>
      )}

      {/* Mode: Image / Doc file upload */}
      {(mode === 'image' || mode === 'doc') && (
        <div className="rounded-3xl bg-white border border-stone-200 p-6 space-y-4 shadow-xs">
          <input
            type="file"
            accept={mode === 'image' ? 'image/*' : 'application/pdf,image/*'}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                analyzeFile(e.target.files[0], mode === 'image' ? 'image' : 'document');
              }
            }}
            className="w-full p-6 border-2 border-dashed border-stone-300 rounded-2xl text-center text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
          />
        </div>
      )}
    </div>
  );
};
