import React, { useState } from 'react';
import { useAnalysis } from '../hooks/useAnalysis';
import { AnalysisProgress } from '../components/AnalysisProgress';
import { FileDropzone } from '../components/FileDropzone';
import { QrCode, ExternalLink, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QRChecker: React.FC = () => {
  const navigate = useNavigate();
  const { loading, analyzeFile, analyzeWebsite } = useAnalysis();
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null);

  const handleFile = (file: File) => {
    // We can directly analyze the QR image file
    analyzeFile(file, 'qr');
  };

  if (loading) {
    return <AnalysisProgress title="Decoding QR code & analyzing destination safely…" />;
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 py-4 animate-in fade-in duration-200">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <QrCode className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Check a Link or QR Code
        </h1>
        <p className="text-sm text-stone-500 max-w-md mx-auto">
          Decode QR codes and check destination URLs before opening them on your phone.
        </p>
      </div>

      {detectedUrl ? (
        <div className="rounded-3xl bg-white border border-stone-200 p-6 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
            <QrCode className="w-4 h-4" />
            <span>QR Code Destination Detected</span>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Destination URL:
            </span>
            <p className="font-mono text-sm text-stone-800 break-all font-semibold select-all">
              {detectedUrl}
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => analyzeWebsite(detectedUrl)}
              className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition shadow-xs"
            >
              🔍 Check Destination Safety First
            </button>

            <button
              onClick={() => setDetectedUrl(null)}
              className="w-full py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <FileDropzone
            onFileSelect={handleFile}
            label="Upload a photo or screenshot containing a QR code"
            sublabel="PNG, JPG, or screenshot"
          />

          <div className="text-center">
            <span className="text-xs text-stone-400 font-medium">— or —</span>
          </div>

          <button
            onClick={() => navigate('/camera')}
            className="w-full py-3.5 rounded-2xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition"
          >
            <span>📷 Scan QR with Camera</span>
          </button>
        </div>
      )}

      {/* Advice Note */}
      <div className="rounded-2xl bg-stone-100/80 p-4 border border-stone-200 text-xs text-stone-600 space-y-1">
        <p className="font-bold text-stone-800">Why check before opening?</p>
        <p>
          QR codes in parking meters, restaurant bills, and emails are frequently replaced with phishing links or automatic payment prompts.
        </p>
      </div>
    </div>
  );
};
