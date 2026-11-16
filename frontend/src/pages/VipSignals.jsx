import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function VipSignals() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
  const authData = JSON.parse(localStorage.getItem('rr_auth') || '{}');
  const isAdmin = authData.role === 'admin';

  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');

  // Admin New Signal Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('signal');
  const [asset, setAsset] = useState('BTC/USDT');
  const [signalType, setSignalType] = useState('BUY');
  const [entryPrice, setEntryPrice] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Sound chime toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Fetch broadcasts from backend
  const fetchBroadcasts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/broadcasts`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBroadcasts(data.data);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
    const interval = setInterval(fetchBroadcasts, 4000); // Live poll every 4s
    return () => clearInterval(interval);
  }, []);

  // Handle Admin Publish Signal
  const handlePublish = async (e) => {
    e.preventDefault();
    if (!message.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || `${signalType} ${asset}`,
          message: message.trim(),
          category,
          asset,
          signalType,
          entryPrice: entryPrice ? Number(entryPrice) : null,
          targetPrice: targetPrice ? Number(targetPrice) : null,
          stopLoss: stopLoss ? Number(stopLoss) : null,
          pinned,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setToast({ type: 'success', message: 'VIP Signal published instantly to all members!' });
        setTitle('');
        setMessage('');
        setEntryPrice('');
        setTargetPrice('');
        setStopLoss('');
        setPinned(false);
        setShowCreateForm(false);
        fetchBroadcasts();
      } else {
        setToast({ type: 'error', message: data.message || 'Failed to publish signal.' });
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Network error connecting to broadcast server.' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  // Handle Delete (Admin Only)
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this signal from the VIP feed?')) return;
    try {
      const res = await fetch(`${API_URL}/api/broadcasts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBroadcasts((prev) => prev.filter((b) => b.id !== id && b._id !== id));
      }
    } catch (e) {}
  };

  // Filtered broadcast items
  const filteredBroadcasts = useMemo(() => {
    if (filterCategory === 'all') return broadcasts;
    return broadcasts.filter((b) => b.category === filterCategory);
  }, [broadcasts, filterCategory]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 border border-emerald-500/30 p-6 rounded-3xl shadow-xl shadow-emerald-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              IN-PLATFORM VIP SIGNAL ROOM • REAL-TIME
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>🔥 VIP Signals & Desk Broadcasts</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
              Live Feed
            </span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Official trade setups, momentum breakouts, and options scalping signals directly from desk analysts. No external apps required.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
          {isAdmin && (
            <button
              onClick={() => setShowCreateForm((prev) => !prev)}
              className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
            >
              <span>{showCreateForm ? '✕ Close Form' : '📢 Post New Signal'}</span>
            </button>
          )}

          <Link
            to="/dashboard/terminal"
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all border border-gray-700 flex items-center gap-1.5 cursor-pointer"
          >
            <span>📊</span> Open Terminal
          </Link>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-4 rounded-xl border text-sm font-semibold flex items-center justify-between shadow-xl ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Admin Broadcast Publisher Form */}
      {isAdmin && showCreateForm && (
        <div className="bg-gray-900 border-2 border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📢</span>
              <h3 className="font-extrabold text-white text-base">Broadcast Live VIP Signal to Members</h3>
            </div>
            <span className="text-xs text-emerald-400 font-mono">Publishes directly to in-platform feed</span>
          </div>

          <form onSubmit={handlePublish} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Asset Symbol</label>
                <select
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                >
                  <option value="BTC/USDT">BTC/USDT (Bitcoin)</option>
                  <option value="ETH/USDT">ETH/USDT (Ethereum)</option>
                  <option value="SOL/USDT">SOL/USDT (Solana)</option>
                  <option value="BNB/USDT">BNB/USDT (Binance Coin)</option>
                  <option value="EUR/USD">EUR/USD (Forex)</option>
                  <option value="GBP/USD">GBP/USD (Forex)</option>
                  <option value="USD/JPY">USD/JPY (Forex)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Signal Direction</label>
                <select
                  value={signalType}
                  onChange={(e) => setSignalType(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                >
                  <option value="BUY">🟢 BUY / LONG</option>
                  <option value="SELL">🔴 SELL / SHORT</option>
                  <option value="ALERT">🟡 BREAKOUT ALERT</option>
                  <option value="INFO">🔵 MARKET INTEL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="signal">Trade Signal</option>
                  <option value="breakout">Momentum Breakout</option>
                  <option value="announcement">Desk Announcement</option>
                  <option value="urgent">Urgent Risk Update</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Entry Price ($)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 64500"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Target Price ($)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 67000"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Stop Loss ($)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 63200"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Signal Headline / Title (Optional)</label>
              <input
                type="text"
                placeholder="e.g. BTC Bullish Falling Wedge Breakout on 4H Chart"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Analysis & Execution Notes *</label>
              <textarea
                rows="3"
                required
                placeholder="High volume breakout confirmed above $64,800. Strong call open interest building up. Recommend 2-3% risk allocation."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              ></textarea>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="rounded bg-gray-950 border-gray-800 text-emerald-500 focus:ring-0"
                />
                <span>📌 Pin this signal to the top of member feed</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Publishing...' : 'Publish to VIP Members'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-900/60 border border-gray-800 p-3 rounded-2xl">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'All Updates' },
            { id: 'signal', label: 'Trade Signals' },
            { id: 'breakout', label: 'Breakouts' },
            { id: 'announcement', label: 'Announcements' },
            { id: 'urgent', label: 'Urgent' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterCategory === tab.id
                  ? 'bg-emerald-500 text-gray-950 shadow'
                  : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Real-time polling active (every 4s)</span>
          </span>
          <span className="text-gray-600">•</span>
          <span className="font-mono text-emerald-400 font-bold">{filteredBroadcasts.length} Posts</span>
        </div>
      </div>

      {/* Signals Feed Stream */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-gray-500 text-xs">
            <span className="w-6 h-6 border-2 border-emerald-500/40 border-t-emerald-400 rounded-full animate-spin inline-block mb-3"></span>
            <p>Loading real-time VIP signals...</p>
          </div>
        ) : filteredBroadcasts.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-12 text-center space-y-3">
            <span className="text-4xl block">📡</span>
            <h3 className="text-lg font-bold text-white">No signals in this category yet</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Our desk analysts post real-time high-conviction trade setups when momentum confirms. Check back shortly!
            </p>
          </div>
        ) : (
          filteredBroadcasts.map((item) => {
            const isBuy = item.signalType === 'BUY';
            const isSell = item.signalType === 'SELL';
            const isAlert = item.signalType === 'ALERT';

            return (
              <div
                key={item.id || item._id}
                className={`bg-gray-900 border rounded-3xl p-6 transition-all hover:border-gray-700 shadow-xl relative overflow-hidden ${
                  item.pinned
                    ? 'border-amber-500/50 bg-gradient-to-r from-gray-900 via-gray-900 to-amber-950/20'
                    : 'border-gray-800'
                }`}
              >
                {/* Pinned Ribbon */}
                {item.pinned && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-gray-950 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow">
                    📌 PINNED SIGNAL
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {/* Signal Direction Badge */}
                      <span
                        className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                          isBuy
                            ? 'bg-emerald-500 text-gray-950 shadow-md shadow-emerald-500/20'
                            : isSell
                            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {item.signalType || 'ALERT'}
                      </span>

                      {/* Asset Symbol */}
                      <span className="text-sm font-black text-white font-mono bg-gray-950 border border-gray-800 px-2.5 py-1 rounded-xl">
                        {item.asset || 'BTC/USDT'}
                      </span>

                      {/* Category Tag */}
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                        {item.category || 'signal'}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                      {item.title || `${item.signalType} ${item.asset}`}
                    </h2>
                  </div>

                  <div className="text-right text-xs text-gray-500 font-mono self-start sm:self-auto">
                    {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    <span className="text-gray-600 ml-1">
                      • {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Today'}
                    </span>
                  </div>
                </div>

                {/* Key Execution Metrics Grid (If Entry/TP/SL present) */}
                {(item.entryPrice || item.targetPrice || item.stopLoss) && (
                  <div className="grid grid-cols-3 gap-3 bg-gray-950 border border-gray-800/80 rounded-2xl p-4 my-4 text-xs font-mono">
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase font-bold">Entry Price</span>
                      <span className="font-extrabold text-white text-sm sm:text-base mt-0.5 block">
                        ${item.entryPrice ? item.entryPrice.toLocaleString() : 'Market'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase font-bold">Target Profit</span>
                      <span className="font-extrabold text-emerald-400 text-sm sm:text-base mt-0.5 block">
                        ${item.targetPrice ? item.targetPrice.toLocaleString() : 'Open'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase font-bold">Stop Loss</span>
                      <span className="font-extrabold text-rose-400 text-sm sm:text-base mt-0.5 block">
                        ${item.stopLoss ? item.stopLoss.toLocaleString() : 'Discretionary'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Analysis Body Message */}
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line bg-gray-950/40 p-4 rounded-xl border border-gray-800/40">
                  {item.message}
                </p>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-800/60">
                  <button
                    onClick={() => navigate('/dashboard/terminal')}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>⚡ Trade on Paper Desk →</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(item.id || item._id)}
                      className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
