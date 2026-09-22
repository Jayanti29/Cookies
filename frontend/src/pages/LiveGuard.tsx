import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCamera } from '../hooks/useCamera';
import { useAnalysis } from '../hooks/useAnalysis';
import { Shield, ShieldAlert, ArrowLeft, StopCircle, QrCode } from 'lucide-react';

export const LiveGuard: React.FC = () => {
  const navigate = useNavigate();
  const { videoRef, isActive, startCamera, stopCamera, captureFrame } = useCamera();
  const { analyzeFile } = useAnalysis();

  const [scanPulse, setScanPulse] = useState(false);
  const [detectedItem, setDetectedItem] = useState<{ type: string; preview: string } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startCamera();

    // Throttled frame sampling (every 5 seconds)
    intervalRef.current = setInterval(() => {
      setScanPulse(true);
      setTimeout(() => setScanPulse(false), 800);

      // Simulate client-side light optical trigger
      const frame = captureFrame();
      if (frame && Math.random() > 0.7) {
        setDetectedItem({
          type: 'QR / Link',
          preview: 'pay-quick-verify.com',
        });
      }
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopCamera();
    };
  }, [startCamera, stopCamera, captureFrame]);

  const handleInspectDetected = () => {
    const frame = captureFrame();
    if (frame) {
      fetch(frame)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], 'live-guard-frame.jpg', { type: 'image/jpeg' });
          analyzeFile(file, 'image');
        });
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 py-2 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/camera')}
          className="flex items-center gap-1 text-sm font-semibold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Live Guard</span>
        </button>

        {/* Live Guard Active Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>LIVE GUARD ON</span>
        </div>
      </div>

      {/* Video Viewport */}
      <div className="relative aspect-3/4 w-full bg-stone-900 rounded-3xl overflow-hidden shadow-xl border-2 border-emerald-500/50">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Scanning Sweep Effect */}
        {scanPulse && (
          <div className="absolute inset-0 bg-emerald-500/10 border-t-2 border-emerald-400 animate-pulse pointer-events-none" />
        )}

        {/* Detected Item Popup Overlay */}
        {detectedItem && (
          <div className="absolute bottom-6 inset-x-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-2xl space-y-2 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <QrCode className="w-4 h-4 text-amber-700" />
              <span>Pattern Detected: {detectedItem.type}</span>
            </div>
            <p className="font-mono text-xs text-stone-700 truncate bg-stone-100 p-2 rounded-lg">
              {detectedItem.preview}
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleInspectDetected}
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition"
              >
                Inspect Now
              </button>
              <button
                onClick={() => setDetectedItem(null)}
                className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold text-xs transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stop Button */}
      <div className="pt-2 text-center">
        <button
          onClick={() => navigate('/camera')}
          className="w-full py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
        >
          <StopCircle className="w-5 h-5 text-rose-500" />
          <span>Stop Live Guard</span>
        </button>
        <p className="text-[11px] text-stone-400 mt-2">
          Camera automatically deactivates upon leaving this view.
        </p>
      </div>
    </div>
  );
};
