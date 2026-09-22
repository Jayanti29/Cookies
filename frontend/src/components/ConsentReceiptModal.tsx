import React, { useState } from 'react';
import { ConsentReceipt } from '../types';
import { api } from '../services/api';
import { ShieldCheck, Download, Share2, Vault, AlertTriangle, Check, X, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  receipt: ConsentReceipt;
  onClose: () => void;
}

export const ConsentReceiptModal: React.FC<Props> = ({ receipt, onClose }) => {
  const [saving, setSaving] = useState(false);

  const handleDownload = () => {
    const textContent = `
========================================
🧾 DIGITAL CONSENT RECEIPT
COOKIES Platform — Consumer Safety Record
========================================
Receipt ID: ${receipt.receiptId}
Website: ${receipt.website}
Issued At: ${new Date(receipt.timestamp).toLocaleString()}

OBSERVED CONSENT CHOICES:
- Strictly Essential Cookies: ${receipt.observedChoices.essential ? 'YES (Functional)' : 'Not verified'}
- Analytics & Performance: ${receipt.observedChoices.analytics ? 'YES (Usage metrics collected)' : 'Not detected'}
- Advertising & Marketing: ${receipt.observedChoices.advertising ? 'YES (Partner profile building)' : 'Not detected'}
- Third-Party Cross-Tracking: ${receipt.observedChoices.thirdParty ? 'YES (External vendor integration)' : 'Not detected'}

OBSERVED INTERFACE PATTERNS:
${receipt.observedInterfaceFlags.map((f) => `• ${f}`).join('\n') || '• Standard consent modal structure.'}

POTENTIAL IMPACT:
${receipt.potentialImpact}

RECOMMENDED VERIFICATION:
${receipt.verificationAdvice}

----------------------------------------
Verified with COOKIES: Check Before You Trust
========================================
`.trim();

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `consent-receipt-${receipt.website}-${receipt.receiptId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Consent receipt downloaded!');
  };

  const handleSaveToVault = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      const textBlob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
      formData.append('file', textBlob, `receipt_${receipt.receiptId}.json`);
      formData.append('title', `Consent Receipt: ${receipt.website}`);
      formData.append('category', 'cookie_consent');
      formData.append('description', `Observed consent choices for ${receipt.website}.`);

      await api.uploadEvidence(formData);
      toast.success('Saved to Evidence Vault!');
    } catch {
      toast.error('Could not save to vault right now.');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Digital Consent Receipt for ${receipt.website}`,
        text: `Here is what ${receipt.website} asks you to agree to. Verified via COOKIES.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `Digital Consent Receipt for ${receipt.website} (Receipt #${receipt.receiptId}): ${receipt.potentialImpact}`
      );
      toast.success('Receipt summary copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold">
              🧾
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Digital Consent Receipt</h2>
              <p className="text-xs text-stone-400">Verifiable record of observed consent options</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-5 overflow-y-auto font-sans text-stone-800">
          {/* Metadata banner */}
          <div className="flex items-center justify-between pb-3 border-b border-dashed border-stone-200 text-xs">
            <div>
              <span className="text-stone-400 block font-semibold uppercase tracking-wider text-[10px]">Website</span>
              <span className="font-bold text-stone-900 text-sm">{receipt.website}</span>
            </div>
            <div className="text-right">
              <span className="text-stone-400 block font-semibold uppercase tracking-wider text-[10px]">Receipt ID</span>
              <span className="font-mono text-stone-600">{receipt.receiptId}</span>
            </div>
          </div>

          {/* Observable Choices */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Observed Consent Choices</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <span className="font-semibold text-stone-700">Essential</span>
                <span className="flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" /> Required
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <span className="font-semibold text-stone-700">Analytics</span>
                {receipt.observedChoices.analytics ? (
                  <span className="flex items-center gap-1 text-amber-700 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3" /> Included
                  </span>
                ) : (
                  <span className="text-stone-400 text-[11px]">Not observed</span>
                )}
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <span className="font-semibold text-stone-700">Advertising</span>
                {receipt.observedChoices.advertising ? (
                  <span className="flex items-center gap-1 text-amber-700 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3" /> Included
                  </span>
                ) : (
                  <span className="text-stone-400 text-[11px]">Not observed</span>
                )}
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <span className="font-semibold text-stone-700">3rd-Party Tracking</span>
                {receipt.observedChoices.thirdParty ? (
                  <span className="flex items-center gap-1 text-rose-700 font-bold text-[11px] bg-rose-50 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3" /> Included
                  </span>
                ) : (
                  <span className="text-stone-400 text-[11px]">Not observed</span>
                )}
              </div>
            </div>
          </div>

          {/* Observable Interface Patterns */}
          {receipt.observedInterfaceFlags.length > 0 && (
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide block">
                Observed Interface Notice
              </span>
              <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                {receipt.observedInterfaceFlags.map((flag, i) => (
                  <li key={i}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Potential Impact */}
          <div className="space-y-1 text-xs">
            <span className="font-bold text-stone-900 block">Potential Data Impact:</span>
            <p className="text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
              {receipt.potentialImpact}
            </p>
          </div>

          {/* Verification Advice */}
          <div className="space-y-1 text-xs">
            <span className="font-bold text-stone-900 block">What you can verify:</span>
            <p className="text-stone-600 leading-relaxed">
              {receipt.verificationAdvice}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap gap-2 justify-end">
          <button
            onClick={handleDownload}
            className="px-3.5 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
          <button
            onClick={handleSaveToVault}
            disabled={saving}
            className="px-3.5 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <Vault className="w-3.5 h-3.5" />
            <span>Save to Vault</span>
          </button>
          <button
            onClick={handleShare}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
