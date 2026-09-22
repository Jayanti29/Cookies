import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { FileDropzone } from '../components/FileDropzone';
import { ArrowLeft, CheckCircle2, ShieldAlert, Sparkles, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export const ReportWizard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [summary, setSummary] = useState('');

  const categories = [
    { id: 'phishing', label: 'Phishing', icon: '🎣' },
    { id: 'fake_job', label: 'Fake Job Offer', icon: '💼' },
    { id: 'hidden_fee', label: 'Hidden Fee', icon: '💰' },
    { id: 'hidden_subscription', label: 'Hidden Subscription', icon: '🔄' },
    { id: 'fake_account', label: 'Fake Account / Impersonation', icon: '🎭' },
    { id: 'payment_request', label: 'Suspicious Payment Request', icon: '💳' },
    { id: 'suspicious_link', label: 'Suspicious Link', icon: '🔗' },
    { id: 'qr_scam', label: 'QR Scam', icon: '📱' },
    { id: 'social_media', label: 'Social Media Scam', icon: '💬' },
    { id: 'other', label: 'Other Deception', icon: '⚠️' },
  ];

  const handleNextToSummary = () => {
    // Generate simple structured summary for step 4
    const generated = `Report regarding ${category.replace(/_/g, ' ')}: "${description.slice(0, 100)}..."`;
    setSummary(generated);
    setStep(4);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await api.submitReport({
        category,
        description,
        url: url || null,
        title: summary,
        isPublic: true,
      });
      toast.success('Report submitted to community! Thank you.');
      navigate('/reports');
    } catch (err: any) {
      toast.error('Failed to submit report. Please sign in first.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 py-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
          className="flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 px-3 py-1.5 rounded-full transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{step > 1 ? 'Previous Step' : 'Cancel'}</span>
        </button>
        <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full">
          Step {step} of 4
        </span>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Report Something Suspicious
        </h1>
        <p className="text-sm text-stone-500">
          Help warn others in the community before they fall victim.
        </p>
      </div>

      {/* Step 1: Category Selection */}
      {step === 1 && (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500 text-center">
            What type of threat did you observe?
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategory(cat.id);
                  setStep(2);
                }}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition ${
                  category === cat.id
                    ? 'border-amber-500 bg-amber-50 shadow-xs'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-bold text-stone-900">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: What happened? */}
      {step === 2 && (
        <div className="rounded-3xl bg-white border border-stone-200 p-6 space-y-4 shadow-xs">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
            Describe what happened
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Explain what the message or website asked you to do, how much money was requested, etc."
            className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm"
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Related URL (optional)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://suspicious-site.com"
              className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm"
            />
          </div>

          <button
            onClick={() => setStep(3)}
            disabled={!description.trim()}
            className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm transition"
          >
            Next: Add Evidence →
          </button>
        </div>
      )}

      {/* Step 3: Add Evidence */}
      {step === 3 && (
        <div className="space-y-4">
          <FileDropzone
            onFileSelect={(file) => setEvidenceFile(file)}
            label={evidenceFile ? `Selected: ${evidenceFile.name}` : 'Drop screenshot, document, or evidence'}
            sublabel="Evidence helps verify the incident"
          />

          <div className="flex gap-3">
            <button
              onClick={() => handleNextToSummary()}
              className="flex-1 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition shadow-sm"
            >
              Next: Review & Submit →
            </button>
            <button
              onClick={() => handleNextToSummary()}
              className="px-5 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition"
            >
              Skip Evidence
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review and Submit */}
      {step === 4 && (
        <div className="rounded-3xl bg-white border border-stone-200 p-6 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-400">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span>Generated Report Summary</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Headline / Summary</label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold text-stone-900"
            />
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs text-stone-600">
            <div>
              <span className="font-bold text-stone-500">Category: </span>
              <span className="capitalize font-semibold text-stone-800">{category.replace(/_/g, ' ')}</span>
            </div>
            {url && (
              <div>
                <span className="font-bold text-stone-500">URL: </span>
                <span className="font-mono text-stone-800">{url}</span>
              </div>
            )}
            <div>
              <span className="font-bold text-stone-500">Details: </span>
              <span className="text-stone-800">{description}</span>
            </div>
            {evidenceFile && (
              <div>
                <span className="font-bold text-stone-500">Attached File: </span>
                <span className="text-stone-800">{evidenceFile.name}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-stone-400">
            By submitting, you agree to share this non-confidential description to warn others.
          </p>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-md"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Submitting…' : 'Submit Community Report'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
