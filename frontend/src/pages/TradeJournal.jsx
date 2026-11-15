import React, { useEffect, useState } from 'react';

function TradeJournal({ searchTerm }) {
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState({
    totalTrades: 0,
    openTrades: 0,
    closedTradesCount: 0,
    winRate: '0%',
    totalPnl: 0,
    avgPnl: 0,
    bestTrade: null,
    worstTrade: null,
    tradesByAssetType: { equity: 0, crypto: 0, options: 0, futures: 0 },
  });

  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [assetFilter, setAssetFilter] = useState('all');
  const [searchSymbol, setSearchSymbol] = useState('');

  const activeSymbolSearch = searchTerm !== undefined && searchTerm !== '' ? searchTerm : searchSymbol;

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [closingTrade, setClosingTrade] = useState(null); // trade object when closing

  // Add Trade Form State
  const [formSymbol, setFormSymbol] = useState('');
  const [formAssetType, setFormAssetType] = useState('equity');
  const [formTradeType, setFormTradeType] = useState('long');
  const [formEntryPrice, setFormEntryPrice] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formStopLoss, setFormStopLoss] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formTags, setFormTags] = useState('');

  // Options fields
  const [formStrikePrice, setFormStrikePrice] = useState('');
  const [formOptionType, setFormOptionType] = useState('CE');

  // Close Trade Form State
  const [closeExitPrice, setCloseExitPrice] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
  const token = localStorage.getItem('rr_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const fetchTrades = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.append('status', statusFilter);
    if (assetFilter !== 'all') params.append('assetType', assetFilter);
    if (activeSymbolSearch) params.append('symbol', activeSymbolSearch);

    fetch(`${API_URL}/api/trades?${params.toString()}`, { headers })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setTrades(resData.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchStats = () => {
    fetch(`${API_URL}/api/trades/stats`, { headers })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setStats(resData.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchTrades();
    fetchStats();
  }, [statusFilter, assetFilter, activeSymbolSearch]);

  const handleCreateTrade = (e) => {
    e.preventDefault();
    if (!formSymbol || !formEntryPrice || !formQuantity) return;

    const payload = {
      symbol: formSymbol,
      assetType: formAssetType,
      tradeType: formTradeType,
      entryPrice: Number(formEntryPrice),
      quantity: Number(formQuantity),
      stopLoss: formStopLoss ? Number(formStopLoss) : undefined,
      target: formTarget ? Number(formTarget) : undefined,
      notes: formNotes,
      tags: formTags ? formTags.split(',').map((t) => t.trim()) : [],
      ...(formAssetType === 'options' && {
        strikePrice: formStrikePrice ? Number(formStrikePrice) : undefined,
        optionType: formOptionType,
      }),
    };

    fetch(`${API_URL}/api/trades`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setShowAddModal(false);
          resetForm();
          fetchTrades();
          fetchStats();
        }
      })
      .catch(() => {});
  };

  const handleCloseTrade = (e) => {
    e.preventDefault();
    if (!closingTrade || !closeExitPrice) return;

    fetch(`${API_URL}/api/trades/${closingTrade.id}/close`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ exitPrice: Number(closeExitPrice) }),
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setClosingTrade(null);
          setCloseExitPrice('');
          fetchTrades();
          fetchStats();
        }
      })
      .catch(() => {});
  };

  const handleDeleteTrade = (id) => {
    if (!window.confirm('Are you sure you want to delete this trade log?')) return;

    fetch(`${API_URL}/api/trades/${id}`, {
      method: 'DELETE',
      headers,
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          fetchTrades();
          fetchStats();
        }
      })
      .catch(() => {});
  };

  const resetForm = () => {
    setFormSymbol('');
    setFormAssetType('equity');
    setFormTradeType('long');
    setFormEntryPrice('');
    setFormQuantity('');
    setFormStopLoss('');
    setFormTarget('');
    setFormNotes('');
    setFormTags('');
    setFormStrikePrice('');
    setFormOptionType('CE');
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '$0.00';
    const isNeg = val < 0;
    const absVal = Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${isNeg ? '-' : ''}$${absVal}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-3xl font-bold flex items-center gap-3">
            <span>📈</span> Trade Journal
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Log, track, and analyze your stock, crypto, options, and futures executions.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-500 hover:bg-green-400 text-gray-950 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-green-500/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Log New Trade
        </button>
      </div>

      {/* Performance Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total PnL */}
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Realized P&L</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                stats.totalPnl >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {stats.totalPnl >= 0 ? 'Profit' : 'Loss'}
            </span>
          </div>
          <div
            className={`text-2xl font-black mt-3 ${
              stats.totalPnl >= 0 ? 'text-green-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(stats.totalPnl)}
          </div>
          <p className="text-xs text-gray-500 mt-2">Avg PnL per trade: {formatCurrency(stats.avgPnl)}</p>
        </div>

        {/* Win Rate */}
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Win Rate</span>
            <span className="text-xs font-bold text-emerald-400">{stats.winRate}</span>
          </div>
          <div className="text-2xl font-black text-white mt-3">{stats.winRate}</div>
          <p className="text-xs text-gray-500 mt-2">
            Based on {stats.closedTradesCount} closed trades
          </p>
        </div>

        {/* Total Executions */}
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Trades</span>
            <span className="text-xs font-bold text-gray-400">{stats.totalTrades}</span>
          </div>
          <div className="text-2xl font-black text-white mt-3">{stats.totalTrades}</div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.openTrades} active open position{stats.openTrades !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Asset Breakdown */}
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Asset Breakdown</span>
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="flex justify-between bg-gray-950 px-2 py-1 rounded">
              <span className="text-gray-400">Stocks</span>
              <span className="text-white font-bold">{stats.tradesByAssetType?.equity || 0}</span>
            </div>
            <div className="flex justify-between bg-gray-950 px-2 py-1 rounded">
              <span className="text-gray-400">Crypto</span>
              <span className="text-white font-bold">{stats.tradesByAssetType?.crypto || 0}</span>
            </div>
            <div className="flex justify-between bg-gray-950 px-2 py-1 rounded">
              <span className="text-gray-400">Options</span>
              <span className="text-white font-bold">{stats.tradesByAssetType?.options || 0}</span>
            </div>
            <div className="flex justify-between bg-gray-950 px-2 py-1 rounded">
              <span className="text-gray-400">Futures</span>
              <span className="text-white font-bold">{stats.tradesByAssetType?.futures || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-xl border border-gray-800 text-xs">
            {['all', 'open', 'closed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                  statusFilter === st ? 'bg-green-500 text-gray-950 font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Asset Type Filter */}
          <select
            value={assetFilter}
            onChange={(e) => setAssetFilter(e.target.value)}
            className="bg-gray-950 border border-gray-800 text-white text-xs rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">All Asset Types</option>
            <option value="crypto">Crypto</option>
            <option value="forex">Forex</option>
            <option value="options">Options</option>
            <option value="futures">Futures</option>
            <option value="equity">Equity (Stocks)</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-xl px-3 py-1.5 w-full sm:w-64">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by Symbol (e.g. BTC, EUR/USD)"
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none w-full placeholder-gray-500 uppercase"
          />
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-950 text-gray-400 uppercase text-xs border-b border-gray-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Symbol & Type</th>
                <th className="py-3.5 px-4 font-semibold">Asset</th>
                <th className="py-3.5 px-4 font-semibold">Entry Price</th>
                <th className="py-3.5 px-4 font-semibold">Exit Price</th>
                <th className="py-3.5 px-4 font-semibold">Qty</th>
                <th className="py-3.5 px-4 font-semibold">P&L ($ / %)</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    Loading trades...
                  </td>
                </tr>
              ) : trades.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-gray-500">
                    <p className="text-lg">No trades logged yet.</p>
                    <p className="text-xs mt-1 text-gray-600">Click "Log New Trade" to start tracking your trading journal.</p>
                  </td>
                </tr>
              ) : (
                trades.map((t) => (
                  <tr key={t.id || t._id} className="hover:bg-gray-800/40 transition-colors">
                    {/* Symbol & Trade Type */}
                    <td className="py-4 px-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <span className="font-bold tracking-wide">{t.symbol}</span>
                        <span
                          className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-bold ${
                            t.tradeType === 'long'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {t.tradeType}
                        </span>
                        {t.assetType === 'options' && t.optionType && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-bold">
                            {t.strikePrice} {t.optionType}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-500">
                        {t.entryDate ? new Date(t.entryDate).toLocaleDateString() : ''}
                      </span>
                    </td>

                    {/* Asset Type */}
                    <td className="py-4 px-4 text-xs capitalize text-gray-400">{t.assetType}</td>

                    {/* Entry Price */}
                    <td className="py-4 px-4 font-mono text-xs text-gray-200">₹{t.entryPrice?.toLocaleString()}</td>

                    {/* Exit Price */}
                    <td className="py-4 px-4 font-mono text-xs">
                      {t.exitPrice !== null && t.exitPrice !== undefined ? (
                        <span className="text-gray-200">₹{t.exitPrice.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-600 italic">Open</span>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="py-4 px-4 font-mono text-xs text-gray-300">{t.quantity}</td>

                    {/* PnL */}
                    <td className="py-4 px-4 font-mono text-xs font-bold">
                      {t.exitPrice !== null && t.exitPrice !== undefined ? (
                        <div className={t.pnl >= 0 ? 'text-green-400' : 'text-rose-400'}>
                          <span>{formatCurrency(t.pnl)}</span>
                          <span className="text-[10px] ml-1 font-normal opacity-80">
                            ({t.pnlPercent > 0 ? '+' : ''}{t.pnlPercent}%)
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>

                    {/* Outcome Badge */}
                    <td className="py-4 px-4">
                      {t.exitPrice === null || t.exitPrice === undefined ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Open Position
                        </span>
                      ) : t.outcome === 'win' ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                          Win
                        </span>
                      ) : t.outcome === 'loss' ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Loss
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">
                          Breakeven
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right space-x-2">
                      {t.exitPrice === null || t.exitPrice === undefined ? (
                        <button
                          onClick={() => {
                            setClosingTrade(t);
                            setCloseExitPrice('');
                          }}
                          className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Close Trade
                        </button>
                      ) : null}

                      <button
                        onClick={() => handleDeleteTrade(t.id || t._id)}
                        className="text-xs text-rose-400 hover:text-rose-300 transition-colors p-1 cursor-pointer inline-block"
                        title="Delete Trade Log"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Trade Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Log New Trade Execution</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTrade} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Symbol */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Symbol *</label>
                  <input
                    type="text"
                    required
                    placeholder="RELIANCE, BTC, NIFTY"
                    value={formSymbol}
                    onChange={(e) => setFormSymbol(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none uppercase"
                  />
                </div>

                {/* Asset Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Asset Type</label>
                  <select
                    value={formAssetType}
                    onChange={(e) => setFormAssetType(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="crypto">Crypto</option>
                    <option value="forex">Forex</option>
                    <option value="options">Options</option>
                    <option value="futures">Futures</option>
                    <option value="equity">Equity (Stocks)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Trade Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Direction</label>
                  <select
                    value={formTradeType}
                    onChange={(e) => setFormTradeType(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none capitalize"
                  >
                    <option value="long">Long (Buy)</option>
                    <option value="short">Short (Sell)</option>
                  </select>
                </div>

                {/* Entry Price */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Entry Price ($) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="2450.00"
                    value={formEntryPrice}
                    onChange={(e) => setFormEntryPrice(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    placeholder="50"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Options fields */}
              {formAssetType === 'options' && (
                <div className="grid grid-cols-2 gap-4 bg-purple-950/20 p-3 rounded-xl border border-purple-500/20">
                  <div>
                    <label className="block text-xs font-semibold text-purple-300 mb-1">Strike Price</label>
                    <input
                      type="number"
                      placeholder="24500"
                      value={formStrikePrice}
                      onChange={(e) => setFormStrikePrice(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-purple-300 mb-1">Option Type</label>
                    <select
                      value={formOptionType}
                      onChange={(e) => setFormOptionType(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                    >
                      <option value="CE">CE (Call Option)</option>
                      <option value="PE">PE (Put Option)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* SL & Target */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Stop Loss (Optional)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="2400.00"
                    value={formStopLoss}
                    onChange={(e) => setFormStopLoss(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Target Price (Optional)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="2550.00"
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Trading Notes / Strategy</label>
                <textarea
                  rows="2"
                  placeholder="Entered on 15m support retest. RSI divergence."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-5 py-2 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Save Trade Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Trade Modal */}
      {closingTrade && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Close Open Position ({closingTrade.symbol})</h3>
              <button
                onClick={() => setClosingTrade(null)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCloseTrade} className="p-6 space-y-4">
              <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Entry Price:</span>
                  <span className="text-white font-mono font-bold">₹{closingTrade.entryPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantity:</span>
                  <span className="text-white font-mono font-bold">{closingTrade.quantity}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Exit Price (₹) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  autoFocus
                  placeholder="Enter exit price"
                  value={closeExitPrice}
                  onChange={(e) => setCloseExitPrice(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              {closeExitPrice && (
                <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 text-xs">
                  <span className="text-gray-400">Calculated P&L Preview: </span>
                  {(() => {
                    const diff =
                      closingTrade.tradeType === 'long'
                        ? Number(closeExitPrice) - closingTrade.entryPrice
                        : closingTrade.entryPrice - Number(closeExitPrice);
                    const pnl = diff * closingTrade.quantity;
                    return (
                      <span className={`font-mono font-bold ${pnl >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
                        {formatCurrency(pnl)}
                      </span>
                    );
                  })()}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setClosingTrade(null)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold px-5 py-2 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Confirm & Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TradeJournal;
