import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Bell, Plus, Trash2, Calendar, CreditCard, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const Subscriptions: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [serviceName, setServiceName] = useState('');
  const [amount, setAmount] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [frequency, setFrequency] = useState('monthly');

  useEffect(() => {
    async function loadSubs() {
      try {
        if (isAuthenticated) {
          const list = await api.getSubscriptions();
          setSubscriptions(list);
        } else {
          // Default mock list
          setSubscriptions([
            {
              id: '1',
              serviceName: 'Netflix Premium',
              amount: 649,
              currency: 'INR',
              renewalDate: '2026-09-28',
              billingFrequency: 'monthly',
            },
            {
              id: '2',
              serviceName: 'Spotify Duo',
              amount: 149,
              currency: 'INR',
              renewalDate: '2026-10-04',
              billingFrequency: 'monthly',
            },
            {
              id: '3',
              serviceName: 'Amazon Prime',
              amount: 1499,
              currency: 'INR',
              renewalDate: '2026-12-15',
              billingFrequency: 'annual',
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to load subscriptions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSubs();
  }, [isAuthenticated]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName || !amount || !renewalDate) return;

    try {
      const newSub = {
        serviceName,
        amount: Number(amount),
        currency: 'INR',
        renewalDate,
        billingFrequency: frequency,
      };

      if (isAuthenticated) {
        const saved = await api.addSubscription(newSub);
        setSubscriptions((prev) => [...prev, saved]);
      } else {
        setSubscriptions((prev) => [...prev, { id: String(Date.now()), ...newSub }]);
      }

      toast.success('Subscription tracked!');
      setShowAddModal(false);
      setServiceName('');
      setAmount('');
      setRenewalDate('');
    } catch {
      toast.error('Could not save subscription');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (isAuthenticated) {
        await api.deleteSubscription(id);
      }
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      toast.success('Subscription removed');
    } catch {
      toast.error('Could not delete');
    }
  };

  const getDaysUntil = (dateStr: string) => {
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Expired';
    if (diff === 0) return 'Renews today';
    if (diff === 1) return 'Renews tomorrow';
    return `Renews in ${diff} days`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-700" />
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              My Subscriptions
            </h1>
          </div>
          <p className="text-sm text-stone-500 mt-0.5">
            Voluntary tracker for recurring services to prevent unexpected auto-debit charges.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Subscription Cards */}
      <div className="space-y-3">
        {subscriptions.map((sub) => {
          const daysText = getDaysUntil(sub.renewalDate);
          const isUrgent = daysText.includes('today') || daysText.includes('tomorrow') || daysText.includes('in 2') || daysText.includes('in 3');

          return (
            <div
              key={sub.id}
              className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-xs flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-lg">
                  {sub.serviceName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-900">{sub.serviceName}</h3>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                    <span className="font-bold text-stone-800">₹{sub.amount}</span>
                    <span>/ {sub.billingFrequency}</span>
                    <span>•</span>
                    <span>Date: {new Date(sub.renewalDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isUrgent
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {daysText}
                </span>

                <button
                  onClick={() => handleDelete(sub.id)}
                  className="p-2 rounded-xl text-stone-300 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Remove subscription"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900">Track New Subscription</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. Netflix, Gym Membership, VPN"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="499"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Next Renewal Date
                </label>
                <input
                  type="date"
                  required
                  value={renewalDate}
                  onChange={(e) => setRenewalDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition"
              >
                Save Subscription
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
