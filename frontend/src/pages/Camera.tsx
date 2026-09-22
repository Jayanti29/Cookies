import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCamera } from '../hooks/useCamera';
import { useAnalysis } from '../hooks/useAnalysis';
import { AnalysisProgress } from '../components/AnalysisProgress';
import { PrivacyIndicator } from '../components/PrivacyIndicator';
import { ArrowLeft, Camera as CameraIcon, Image, Shield, Zap } from 'lucide-react';

export const Camera: React.FC = () => {
  const navigate = useNavigate();
  const { videoRef, isActive, hasPermission, error, startCamera, stopCamera, captureFrame } = useCamera();
  const { loading, analyzeFile } = useAnalysis();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    if (isActive) {
      const frameBase64 = captureFrame();
      if (frameBase64) {
        // Convert base64 data URL to Blob/File
        fetch(frameBase64)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            analyzeFile(file, 'image');
          });
        return;
      }
    }
    // Fallback directly to native device camera app
    nativeCameraRef.current?.click();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      analyzeFile(e.target.files[0], 'image');
    }
  };

  if (loading) {
    return <AnalysisProgress title="Processing camera frame with OCR & Gemini…" />;
  }

  return (
    <div className="max-w-md mx-auto space-y-4 py-2 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm font-semibold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-sm font-bold text-stone-900">Scan anything</span>
        <button
          onClick={() => navigate('/camera/live')}
          className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-full transition"
        >
          Live Guard
        </button>
      </div>

      {/* Privacy Notice */}
      <div className="flex justify-center">
        <PrivacyIndicator type="camera" />
      </div>

      {/* Camera Viewfinder */}
      <div className="relative aspect-3/4 w-full bg-stone-900 rounded-3xl overflow-hidden shadow-xl border-2 border-stone-800 flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Framing Guide Overlay */}
        <div className="absolute inset-8 border-2 border-white/40 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
          <div className="flex justify-between">
            <div className="w-4 h-4 border-t-2 border-l-2 border-amber-400" />
            <div className="w-4 h-4 border-t-2 border-r-2 border-amber-400" />
          </div>
          <p className="text-center text-xs text-white/80 font-medium drop-shadow-md">
            Point at suspicious message, screen, or QR
          </p>
          <div className="flex justify-between">
            <div className="w-4 h-4 border-b-2 border-l-2 border-amber-400" />
            <div className="w-4 h-4 border-b-2 border-r-2 border-amber-400" />
          </div>
        </div>

        {/* Fallback if camera not permitted */}
        {hasPermission === false && (
          <div className="absolute inset-0 bg-stone-900/95 flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
            <CameraIcon className="w-12 h-12 text-stone-500" />
            <p className="text-sm font-medium text-stone-300">
              {error || 'Camera permission required to scan.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
              <button
                type="button"
                onClick={() => nativeCameraRef.current?.click()}
                className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <CameraIcon className="w-4 h-4" />
                <span>Open Device Camera</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold transition"
              >
                Choose Photo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls: Gallery | Capture | Flash */}
      <div className="flex items-center justify-around py-4">
        {/* Gallery button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-1 text-stone-600 hover:text-stone-900"
        >
          <div className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center shadow-xs">
            <Image className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold">Gallery</span>
        </button>

        {/* Capture button */}
        <button
          type="button"
          onClick={handleCapture}
          className="w-18 h-18 rounded-full border-4 border-amber-600 p-1 flex items-center justify-center active:scale-95 transition-transform shadow-lg"
          aria-label="Capture"
        >
          <div className="w-full h-full rounded-full bg-amber-600 hover:bg-amber-700 transition-colors" />
        </button>

        {/* Flash / Help */}
        <button
          type="button"
          onClick={() => navigate('/camera/live')}
          className="flex flex-col items-center gap-1 text-stone-600 hover:text-stone-900"
        >
          <div className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center shadow-xs">
            <Shield className="w-5 h-5 text-amber-700" />
          </div>
          <span className="text-[11px] font-semibold">Live Guard</span>
        </button>
      </div>

      {/* Native Hardware Camera capture input */}
      <input
        ref={nativeCameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Hidden file input for gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />
    </div>
  );
};
