import React, { useState } from 'react';
import { api } from '../services/api';
import { useStore } from '../store';
import { ChatResponse } from '../types';
import { Sparkles, MessageSquare, Send, X, ShieldAlert, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citedEvidence?: string[];
  uncertainties?: string[];
  recommendedVerifications?: string[];
}

export const CookiesAiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const currentResult = useStore((s) => s.currentResult);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am COOKIES AI, your digital safety assistant. Ask me to evaluate suspicious offers, translate consent terms, or explain why a website was flagged. What are you reviewing today?',
    },
  ]);

  const quickPrompts = [
    'What does this cookie banner mean?',
    'Why is the checkout price different?',
    'Is this job offer suspicious?',
    'What should I check before paying?',
    'Explain this in Hindi',
  ];

  const handleSend = async (userText: string) => {
    if (!userText.trim()) return;

    const newMsg: Message = { role: 'user', content: userText.trim() };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setLoading(true);

    try {
      const res: ChatResponse = await api.askCookiesAi(userText.trim(), {
        currentAnalysis: currentResult || undefined,
      });

      const aiMsg: Message = {
        role: 'assistant',
        content: res.reply,
        citedEvidence: res.citedEvidence,
        uncertainties: res.uncertainties,
        recommendedVerifications: res.recommendedVerifications,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      toast.error('AI assistant currently offline or busy.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I could not reach the Gemini safety engine right now. However, remember to always verify if unexpected advance fees or pre-selected checkboxes are present before proceeding.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-stone-900 hover:bg-black text-amber-400 shadow-xl flex items-center gap-2.5 transition transform hover:scale-105 border border-stone-800"
          title="Open COOKIES AI Safety Assistant"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="font-bold text-xs text-white tracking-wide pr-1">COOKIES AI</span>
        </button>
      )}

      {/* Slide-over / Modal Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col h-[580px] animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="bg-stone-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
                🍪
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                  <span>COOKIES AI</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold">
                    Google Gemini 2.5
                  </span>
                </h3>
                <p className="text-[11px] text-stone-400">Digital Safety & Consent Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3.5 rounded-2xl max-w-[88%] space-y-2 leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-amber-600 text-white font-medium rounded-tr-xs'
                      : 'bg-stone-100 text-stone-800 rounded-tl-xs border border-stone-200/70'
                  }`}
                >
                  <p>{m.content}</p>

                  {/* Evidence Citation */}
                  {m.citedEvidence && m.citedEvidence.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-white/80 border border-stone-200 text-[11px] space-y-1 text-stone-700">
                      <span className="font-bold text-stone-900 block">Observed Evidence Used:</span>
                      <ul className="list-disc list-inside space-y-0.5">
                        {m.citedEvidence.map((ev, i) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Uncertainties */}
                  {m.uncertainties && m.uncertainties.length > 0 && (
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/60 text-[11px] text-amber-900">
                      <span className="font-bold block">Honest Uncertainty:</span>
                      <span>{m.uncertainties.join(' ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-stone-500 text-xs p-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <span>COOKIES AI is inspecting the evidence…</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2 border-t border-stone-100 bg-stone-50 flex gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-stone-700 hover:border-amber-400 hover:text-amber-900 transition"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about safety or consent…"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
