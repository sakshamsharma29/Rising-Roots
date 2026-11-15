import React, { useState, useEffect, useMemo, useRef } from 'react';

// Default Watchlist Assets with realistic base Indian market prices
const INITIAL_ASSETS = [
  // Indices
  { symbol: 'NIFTY 50', type: 'index', spot: 24858.40, change: 118.20, changePct: 0.48, lotSize: 25, baseHigh: 24910.00, baseLow: 24790.00 },
  { symbol: 'BANKNIFTY', type: 'index', spot: 52240.80, change: 285.50, changePct: 0.55, lotSize: 15, baseHigh: 52450.00, baseLow: 51980.00 },
  { symbol: 'FINNIFTY', type: 'index', spot: 23410.60, change: -15.20, changePct: -0.06, lotSize: 25, baseHigh: 23490.00, baseLow: 23360.00 },

  // Equities
  { symbol: 'RELIANCE', type: 'equity', spot: 2982.50, change: 18.40, changePct: 0.62, lotSize: 1, baseHigh: 2995.00, baseLow: 2960.00 },
  { symbol: 'HDFCBANK', type: 'equity', spot: 1644.20, change: 12.80, changePct: 0.78, lotSize: 1, baseHigh: 1652.00, baseLow: 1630.00 },
  { symbol: 'TCS', type: 'equity', spot: 3892.10, change: 24.50, changePct: 0.63, lotSize: 1, baseHigh: 3910.00, baseLow: 3865.00 },
  { symbol: 'INFY', type: 'equity', spot: 1822.40, change: -6.80, changePct: -0.37, lotSize: 1, baseHigh: 1838.00, baseLow: 1815.00 },
  { symbol: 'TATAMOTORS', type: 'equity', spot: 968.10, change: 14.30, changePct: 1.50, lotSize: 1, baseHigh: 975.00, baseLow: 952.00 },
  { symbol: 'ICICIBANK', type: 'equity', spot: 1228.60, change: 8.20, changePct: 0.67, lotSize: 1, baseHigh: 1235.00, baseLow: 1218.00 },
  { symbol: 'SBIN', type: 'equity', spot: 818.50, change: -3.40, changePct: -0.41, lotSize: 1, baseHigh: 825.00, baseLow: 814.00 },
];

function TradingTerminal() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('rr_token');
  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }),
    [token]
  );

  // Market Watchlist state
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [watchlistFilter, setWatchlistFilter] = useState('all'); // 'all', 'index', 'equity'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(INITIAL_ASSETS[0]);
  const [tickDirection, setTickDirection] = useState({}); // symbol -> 'up' | 'down'

  // Timeframe & Chart
  const [timeframe, setTimeframe] = useState('5m');
  const [chartData, setChartData] = useState([]);

  // Order Execution Form State
  const [orderCategory, setOrderCategory] = useState('options'); // 'options' | 'equity'
  const [orderSide, setOrderSide] = useState('long'); // 'long' (BUY) | 'short' (SELL)
  const [orderType, setOrderType] = useState('market'); // 'market' | 'limit'
  const [limitPrice, setLimitPrice] = useState('');

  // Equity specific
  const [equityShares, setEquityShares] = useState(10);

  // Options specific
  const [optionsUnderlying, setOptionsUnderlying] = useState('NIFTY 50');
  const [strikePrice, setStrikePrice] = useState(24800);
  const [optionType, setOptionType] = useState('CE'); // 'CE' | 'PE'
  const [numLots, setNumLots] = useState(2);
  const [targetPrice, setTargetPrice] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');

  // Order feedback & notifications
  const [orderStatusToast, setOrderStatusToast] = useState(null);
  const [orderSubmitting, setOrderSubmitting] = useState(false);

  // Database Trades & Positions
  const [openPositions, setOpenPositions] = useState([]);
  const [closedTrades, setClosedTrades] = useState([]);
  const [activeBottomTab, setActiveBottomTab] = useState('positions'); // 'positions' | 'orders' | 'stats'
  const [loadingTrades, setLoadingTrades] = useState(false);

  // Paper Margin Balance
  const [availableMargin, setAvailableMargin] = useState(() => {
    const saved = localStorage.getItem('rr_paper_margin');
    return saved !== null ? Number(saved) : 500000;
  });

  // Calculate Option Premium dynamically based on strike distance & underlying spot
  const calculateOptionPremium = (underlyingSpot, strike, type) => {
    const diff = underlyingSpot - strike;
    let intrinsic = 0;
    if (type === 'CE') {
      intrinsic = Math.max(0, diff);
    } else {
      intrinsic = Math.max(0, -diff);
    }
    // Time value based on index level
    const timeValue = underlyingSpot > 40000 ? 185.50 : 92.40;
    const premium = intrinsic + timeValue;
    return parseFloat(premium.toFixed(2));
  };

  const currentOptionPremium = useMemo(() => {
    const underlying = assets.find((a) => a.symbol === optionsUnderlying) || assets[0];
    return calculateOptionPremium(underlying.spot, strikePrice, optionType);
  }, [assets, optionsUnderlying, strikePrice, optionType]);

  // Available strikes for selected index
  const availableStrikes = useMemo(() => {
    const underlying = assets.find((a) => a.symbol === optionsUnderlying) || assets[0];
    const spot = underlying.spot;
    const step = optionsUnderlying === 'BANKNIFTY' ? 100 : 50;
    const center = Math.round(spot / step) * step;
    const strikes = [];
    for (let i = -4; i <= 4; i++) {
      strikes.push(center + i * step);
    }
    return strikes;
  }, [assets, optionsUnderlying]);

  // Lot size for current option
  const currentLotSize = optionsUnderlying === 'BANKNIFTY' ? 15 : 25;
  const totalOptionQuantity = numLots * currentLotSize;
  const optionMarginRequired = Math.round(currentOptionPremium * totalOptionQuantity);

  // Total margin required for current order form
  const totalMarginRequired =
    orderCategory === 'options'
      ? optionMarginRequired
      : Math.round(
          (orderType === 'limit' && limitPrice ? Number(limitPrice) : selectedAsset.spot) * equityShares
        );

  // Generate simulated chart candles
  useEffect(() => {
    const base = selectedAsset.spot;
    const points = [];
    let current = base - (base * 0.008);
    for (let i = 0; i < 28; i++) {
      const delta = (Math.random() - 0.48) * (base * 0.002);
      current = Math.max(base * 0.95, current + delta);
      points.push({
        idx: i,
        price: parseFloat(current.toFixed(2)),
      });
    }
    points.push({ idx: 28, price: selectedAsset.spot });
    setChartData(points);
  }, [selectedAsset.symbol]);

  // Real-time market tick engine
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets((prev) =>
        prev.map((item) => {
          // Small realistic random tick
          const tickPct = (Math.random() - 0.49) * 0.0018;
          const oldSpot = item.spot;
          const newSpot = parseFloat((oldSpot * (1 + tickPct)).toFixed(2));
          const diff = parseFloat((newSpot - oldSpot).toFixed(2));
          const direction = diff >= 0 ? 'up' : 'down';

          setTickDirection((prevDir) => ({ ...prevDir, [item.symbol]: direction }));

          return {
            ...item,
            spot: newSpot,
            change: parseFloat((item.change + diff).toFixed(2)),
            changePct: parseFloat((((item.change + diff) / (item.spot - item.change)) * 100).toFixed(2)),
          };
        })
      );
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  // Update selected asset when tick changes
  useEffect(() => {
    const updated = assets.find((a) => a.symbol === selectedAsset.symbol);
    if (updated) setSelectedAsset(updated);
  }, [assets]);

  // Fetch trades from MongoDB backend
  const fetchTrades = () => {
    setLoadingTrades(true);
    fetch(`${API_URL}/api/trades`, { headers })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          const open = resData.data.filter((t) => t.exitPrice === null);
          const closed = resData.data.filter((t) => t.exitPrice !== null);
          setOpenPositions(open);
          setClosedTrades(closed);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTrades(false));
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  // Dynamic P&L calculation for open positions with live ticks
  const calculatePositionMetrics = (pos) => {
    let currentPrice = pos.entryPrice;

    if (pos.assetType === 'options') {
      const underlying = assets.find((a) => pos.symbol.includes(a.symbol)) || assets[0];
      currentPrice = calculateOptionPremium(underlying.spot, pos.strikePrice || 24800, pos.optionType || 'CE');
    } else {
      const match = assets.find((a) => a.symbol === pos.symbol);
      if (match) currentPrice = match.spot;
    }

    const isLong = pos.tradeType === 'long';
    const priceDiff = isLong ? currentPrice - pos.entryPrice : pos.entryPrice - currentPrice;
    const pnl = Math.round(priceDiff * pos.quantity);
    const pnlPercent = parseFloat(((priceDiff / pos.entryPrice) * 100).toFixed(2));

    return { currentPrice, pnl, pnlPercent };
  };

  // Execute Trade Handler
  const handleExecuteOrder = async (e) => {
    e.preventDefault();
    if (orderSubmitting) return;

    if (availableMargin < totalMarginRequired) {
      setOrderStatusToast({
        type: 'error',
        message: `Insufficient Margin! Required: ₹${totalMarginRequired.toLocaleString()}, Available: ₹${availableMargin.toLocaleString()}`,
      });
      setTimeout(() => setOrderStatusToast(null), 4000);
      return;
    }

    setOrderSubmitting(true);

    const isOptions = orderCategory === 'options';
    const symbol = isOptions
      ? `${optionsUnderlying} ${strikePrice} ${optionType}`
      : selectedAsset.symbol;
    const entryPrice = isOptions
      ? currentOptionPremium
      : orderType === 'limit' && limitPrice
      ? Number(limitPrice)
      : selectedAsset.spot;
    const quantity = isOptions ? totalOptionQuantity : Number(equityShares);

    const payload = {
      symbol: symbol.toUpperCase(),
      assetType: isOptions ? 'options' : 'equity',
      tradeType: orderSide,
      entryPrice: Number(entryPrice),
      quantity: Number(quantity),
      ...(isOptions && {
        strikePrice: Number(strikePrice),
        optionType: optionType,
        expiryDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // Next weekly expiry
      }),
      ...(targetPrice && { target: Number(targetPrice) }),
      ...(stopLossPrice && { stopLoss: Number(stopLossPrice) }),
      notes: `Paper Trade Order via Live Terminal (${orderType.toUpperCase()})`,
      tags: [orderCategory, orderSide, 'LiveTerminal'],
    };

    try {
      const res = await fetch(`${API_URL}/api/trades`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        // Deduct margin
        const newMargin = availableMargin - totalMarginRequired;
        setAvailableMargin(newMargin);
        localStorage.setItem('rr_paper_margin', String(newMargin));

        setOrderStatusToast({
          type: 'success',
          message: `Order Filled! ${orderSide.toUpperCase()} ${quantity}x ${symbol} @ ₹${entryPrice}`,
        });

        fetchTrades();
      } else {
        setOrderStatusToast({
          type: 'error',
          message: data.message || 'Failed to place order.',
        });
      }
    } catch (err) {
      // Local fallback simulation if server fails
      const fallbackTrade = {
        id: 'pos_' + Date.now(),
        symbol: payload.symbol,
        assetType: payload.assetType,
        tradeType: payload.tradeType,
        entryPrice: payload.entryPrice,
        exitPrice: null,
        quantity: payload.quantity,
        strikePrice: payload.strikePrice,
        optionType: payload.optionType,
        entryDate: new Date(),
      };
      setOpenPositions((prev) => [fallbackTrade, ...prev]);
      const newMargin = availableMargin - totalMarginRequired;
      setAvailableMargin(newMargin);
      localStorage.setItem('rr_paper_margin', String(newMargin));

      setOrderStatusToast({
        type: 'success',
        message: `Order Filled (Local)! ${orderSide.toUpperCase()} ${quantity}x ${symbol} @ ₹${entryPrice}`,
      });
    } finally {
      setOrderSubmitting(false);
      setTimeout(() => setOrderStatusToast(null), 4000);
    }
  };

  // Square Off / Exit Position
  const handleSquareOff = async (pos) => {
    const { currentPrice, pnl } = calculatePositionMetrics(pos);

    try {
      const res = await fetch(`${API_URL}/api/trades/${pos.id}/close`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ exitPrice: currentPrice }),
      });
      const data = await res.json();

      if (data.success) {
        // Refund margin + PnL
        const investedMargin = pos.entryPrice * pos.quantity;
        const newMargin = availableMargin + investedMargin + pnl;
        setAvailableMargin(newMargin);
        localStorage.setItem('rr_paper_margin', String(newMargin));

        setOrderStatusToast({
          type: 'success',
          message: `Squared Off ${pos.symbol}! Realized P&L: ${pnl >= 0 ? '+' : ''}₹${pnl.toLocaleString()}`,
        });

        fetchTrades();
      }
    } catch (err) {
      // Local square-off fallback
      const investedMargin = pos.entryPrice * pos.quantity;
      const newMargin = availableMargin + investedMargin + pnl;
      setAvailableMargin(newMargin);
      localStorage.setItem('rr_paper_margin', String(newMargin));

      setOpenPositions((prev) => prev.filter((p) => p.id !== pos.id));
      setClosedTrades((prev) => [
        {
          ...pos,
          exitPrice: currentPrice,
          pnl,
          outcome: pnl >= 0 ? 'win' : 'loss',
          exitDate: new Date(),
        },
        ...prev,
      ]);

      setOrderStatusToast({
        type: 'success',
        message: `Squared Off ${pos.symbol}! Realized P&L: ${pnl >= 0 ? '+' : ''}₹${pnl.toLocaleString()}`,
      });
    }

    setTimeout(() => setOrderStatusToast(null), 4000);
  };

  // Reset Paper Trading Account Margin
  const handleResetPaperAccount = () => {
    if (window.confirm('Reset Paper Trading Balance back to ₹5,00,000 demo capital?')) {
      setAvailableMargin(500000);
      localStorage.setItem('rr_paper_margin', '500000');
      setOrderStatusToast({
        type: 'info',
        message: 'Trading margin reset to ₹5,00,000 demo funds.',
      });
      setTimeout(() => setOrderStatusToast(null), 3000);
    }
  };

  // Filtered Watchlist items
  const filteredAssets = assets.filter((item) => {
    if (watchlistFilter !== 'all' && item.type !== watchlistFilter) return false;
    if (searchQuery && !item.symbol.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Calculate stats from closed trades
  const totalRealizedPnl = closedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const winCount = closedTrades.filter((t) => t.outcome === 'win').length;
  const winRate = closedTrades.length > 0 ? ((winCount / closedTrades.length) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-4 max-w-[1700px] mx-auto text-gray-100">
      {/* 🚀 Top Live Market Header & Balance Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        {/* Indices Tickers */}
        <div className="flex items-center gap-6 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-2 pr-4 border-r border-gray-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              NSE LIVE
            </span>
          </div>

          {assets.slice(0, 3).map((idx) => {
            const isUp = idx.change >= 0;
            return (
              <div
                key={idx.symbol}
                onClick={() => setSelectedAsset(idx)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-gray-400">{idx.symbol}</span>
                  <span className="text-sm font-black font-mono text-white">
                    {idx.spot.toLocaleString()}
                  </span>
                  <span
                    className={`text-xs font-bold font-mono ${
                      isUp ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isUp ? '+' : ''}
                    {idx.change.toFixed(2)} ({isUp ? '+' : ''}
                    {idx.changePct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Paper Account Balances */}
        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-gray-500 block">Available Margin</span>
            <span className="font-extrabold text-sm text-white font-mono">
              ₹{availableMargin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="hidden sm:block">
            <span className="text-gray-500 block">Total Realized P&L</span>
            <span
              className={`font-extrabold text-sm font-mono ${
                totalRealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {totalRealizedPnl >= 0 ? '+' : ''}₹
              {totalRealizedPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={handleResetPaperAccount}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-700 transition-colors cursor-pointer"
            title="Reset Paper Account to ₹5,00,000"
          >
            ↻ Reset Capital
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {orderStatusToast && (
        <div
          className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between border animate-in slide-in-from-top-2 ${
            orderStatusToast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : orderStatusToast.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
          }`}
        >
          <span>{orderStatusToast.message}</span>
          <button
            onClick={() => setOrderStatusToast(null)}
            className="text-gray-400 hover:text-white cursor-pointer ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* 📊 Main Terminal Grid: Watchlist (Left) | Chart (Center) | Execution Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ========================================================= */}
        {/* 1. Left Column: Watchlist (3 cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📋</span> Market Watchlist
              </h2>
              <span className="text-[10px] text-gray-500 font-mono">
                {filteredAssets.length} symbols
              </span>
            </div>

            {/* Watchlist Filter Buttons */}
            <div className="grid grid-cols-3 gap-1 bg-gray-950 p-1 rounded-xl mb-3 border border-gray-800">
              {[
                { id: 'all', label: 'All' },
                { id: 'index', label: 'Indices' },
                { id: 'equity', label: 'Stocks' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setWatchlistFilter(btn.id)}
                  className={`text-xs font-semibold py-1 rounded-lg transition-all cursor-pointer ${
                    watchlistFilter === btn.id
                      ? 'bg-gray-800 text-white font-bold shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symbol (e.g. NIFTY, RELIANCE)"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 mb-3"
            />

            {/* Watchlist Items */}
            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredAssets.map((asset) => {
                const isSelected = selectedAsset.symbol === asset.symbol;
                const isUp = asset.change >= 0;
                const isTickUp = tickDirection[asset.symbol] === 'up';

                return (
                  <div
                    key={asset.symbol}
                    onClick={() => {
                      setSelectedAsset(asset);
                      if (asset.type === 'index') {
                        setOptionsUnderlying(asset.symbol);
                        const step = asset.symbol === 'BANKNIFTY' ? 100 : 50;
                        setStrikePrice(Math.round(asset.spot / step) * step);
                      }
                    }}
                    className={`p-3 rounded-xl flex items-center justify-between border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-md shadow-emerald-500/5'
                        : 'bg-gray-950/70 border-gray-800/80 hover:border-gray-700 text-gray-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-white">{asset.symbol}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-400 uppercase font-mono">
                          {asset.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-500 block mt-0.5">
                        Vol: {(asset.spot * 14.2).toFixed(0)}k
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-black font-mono transition-colors ${
                          isTickUp ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        ₹{asset.spot.toLocaleString()}
                      </span>
                      <div
                        className={`text-[11px] font-bold font-mono ${
                          isUp ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {asset.change.toFixed(2)} ({isUp ? '+' : ''}
                        {asset.changePct}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. Center Column: Interactive Chart & Market Depth (5 cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-4">
          <div>
            {/* Asset Header Info */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white">{selectedAsset.symbol}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                    NSE EQ/DERIVATIVES
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black font-mono text-white">
                    ₹{selectedAsset.spot.toLocaleString()}
                  </span>
                  <span
                    className={`text-xs font-bold font-mono ${
                      selectedAsset.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {selectedAsset.change >= 0 ? '+' : ''}
                    {selectedAsset.change.toFixed(2)} ({selectedAsset.change >= 0 ? '+' : ''}
                    {selectedAsset.changePct}%)
                  </span>
                </div>
              </div>

              {/* Timeframe Buttons */}
              <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-xl border border-gray-800">
                {['1m', '5m', '15m', '1H', '1D'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      timeframe === tf
                        ? 'bg-emerald-500 text-gray-950 shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Interactive Chart Area */}
            <div className="relative mt-4 bg-gray-950 rounded-xl p-4 border border-gray-800/80 overflow-hidden">
              <div className="h-56 w-full flex items-end relative">
                {/* SVG Area Chart */}
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 120">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Area fill */}
                  {chartData.length > 1 && (
                    <polygon
                      points={`0,120 ${chartData
                        .map(
                          (d, idx) =>
                            `${(idx / (chartData.length - 1)) * 300},${
                              120 -
                              ((d.price - selectedAsset.baseLow) /
                                (selectedAsset.baseHigh - selectedAsset.baseLow || 1)) *
                                100
                            }`
                        )
                        .join(' ')} 300,120`}
                      fill="url(#chartGradient)"
                    />
                  )}

                  {/* Line stroke */}
                  {chartData.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      points={chartData
                        .map(
                          (d, idx) =>
                            `${(idx / (chartData.length - 1)) * 300},${
                              120 -
                              ((d.price - selectedAsset.baseLow) /
                                (selectedAsset.baseHigh - selectedAsset.baseLow || 1)) *
                                100
                            }`
                        )
                        .join(' ')}
                    />
                  )}

                  {/* Current Price Dot */}
                  {chartData.length > 0 && (
                    <circle
                      cx="300"
                      cy={
                        120 -
                        ((selectedAsset.spot - selectedAsset.baseLow) /
                          (selectedAsset.baseHigh - selectedAsset.baseLow || 1)) *
                          100
                      }
                      r="4.5"
                      fill="#34d399"
                      className="animate-pulse"
                    />
                  )}
                </svg>

                {/* Ambient Grid Lines */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between border-b border-gray-800/40">
                  <div className="border-b border-gray-800/30 w-full text-[10px] text-gray-600 font-mono text-right pr-1">
                    ₹{selectedAsset.baseHigh.toLocaleString()}
                  </div>
                  <div className="border-b border-gray-800/20 w-full text-[10px] text-gray-600 font-mono text-right pr-1">
                    ₹{((selectedAsset.baseHigh + selectedAsset.baseLow) / 2).toLocaleString()}
                  </div>
                  <div className="w-full text-[10px] text-gray-600 font-mono text-right pr-1">
                    ₹{selectedAsset.baseLow.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Market Depth Summary (Bids vs Asks) */}
            <div className="mt-4 pt-3 border-t border-gray-800">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 mb-2">
                <span>ORDER DEPTH</span>
                <span className="text-emerald-400">Total Bids: 64.2%</span>
                <span className="text-rose-400">Total Asks: 35.8%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-gray-950 p-2 rounded-lg border border-emerald-500/20">
                  <span className="text-[10px] text-gray-500 block mb-1">Top Bid (Buyers)</span>
                  <div className="flex justify-between font-bold text-emerald-400">
                    <span>₹{(selectedAsset.spot - 0.25).toFixed(2)}</span>
                    <span className="text-gray-400">1,250 qty</span>
                  </div>
                </div>
                <div className="bg-gray-950 p-2 rounded-lg border border-rose-500/20">
                  <span className="text-[10px] text-gray-500 block mb-1">Top Ask (Sellers)</span>
                  <div className="flex justify-between font-bold text-rose-400">
                    <span>₹{(selectedAsset.spot + 0.25).toFixed(2)}</span>
                    <span className="text-gray-400">840 qty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. Right Column: High-Fidelity Execution Panel (4 cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>⚡</span> Fast Order Terminal
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              PAPER TRADING
            </span>
          </div>

          <form onSubmit={handleExecuteOrder} className="space-y-4">
            {/* Category Toggle: Options (F&O) vs Equity (Stocks) */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                Asset Class
              </label>
              <div className="grid grid-cols-2 gap-2 bg-gray-950 p-1 rounded-xl border border-gray-800">
                <button
                  type="button"
                  onClick={() => setOrderCategory('options')}
                  className={`text-xs py-2 rounded-lg font-bold transition-all cursor-pointer ${
                    orderCategory === 'options'
                      ? 'bg-emerald-500 text-gray-950 shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Options (F&O Calls/Puts)
                </button>
                <button
                  type="button"
                  onClick={() => setOrderCategory('equity')}
                  className={`text-xs py-2 rounded-lg font-bold transition-all cursor-pointer ${
                    orderCategory === 'equity'
                      ? 'bg-emerald-500 text-gray-950 shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Cash Equity (Stocks)
                </button>
              </div>
            </div>

            {/* OPTIONS (F&O) SPECIFIC CONTROLS */}
            {orderCategory === 'options' ? (
              <div className="space-y-3 bg-gray-950/80 p-3.5 rounded-xl border border-gray-800/80">
                {/* Underlying Index */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Underlying Index
                  </label>
                  <select
                    value={optionsUnderlying}
                    onChange={(e) => {
                      setOptionsUnderlying(e.target.value);
                      const selected = assets.find((a) => a.symbol === e.target.value);
                      if (selected) {
                        const step = selected.symbol === 'BANKNIFTY' ? 100 : 50;
                        setStrikePrice(Math.round(selected.spot / step) * step);
                      }
                    }}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="NIFTY 50">NIFTY 50 (Lot: 25)</option>
                    <option value="BANKNIFTY">BANKNIFTY (Lot: 15)</option>
                    <option value="FINNIFTY">FINNIFTY (Lot: 25)</option>
                  </select>
                </div>

                {/* Strike Price & CE / PE Toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Strike Price
                    </label>
                    <select
                      value={strikePrice}
                      onChange={(e) => setStrikePrice(Number(e.target.value))}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                    >
                      {availableStrikes.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Option Type
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-gray-900 p-0.5 rounded-xl border border-gray-800">
                      <button
                        type="button"
                        onClick={() => setOptionType('CE')}
                        className={`text-xs py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                          optionType === 'CE'
                            ? 'bg-emerald-500 text-gray-950 shadow'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        CE (Call)
                      </button>
                      <button
                        type="button"
                        onClick={() => setOptionType('PE')}
                        className={`text-xs py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                          optionType === 'PE'
                            ? 'bg-rose-500 text-white shadow'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        PE (Put)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lots Stepper */}
                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase mb-1">
                    <span>Number of Lots</span>
                    <span className="text-emerald-400 font-mono">
                      {totalOptionQuantity} contracts ({currentLotSize}/lot)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNumLots((n) => Math.max(1, n - 1))}
                      className="w-10 h-9 rounded-xl bg-gray-900 border border-gray-800 text-white font-bold hover:bg-gray-800 cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={numLots}
                      onChange={(e) => setNumLots(Math.max(1, Number(e.target.value) || 1))}
                      className="flex-1 bg-gray-900 border border-gray-800 rounded-xl py-2 text-center text-xs text-white font-mono font-bold focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setNumLots((n) => n + 1)}
                      className="w-10 h-9 rounded-xl bg-gray-900 border border-gray-800 text-white font-bold hover:bg-gray-800 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Live Premium Display */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 block">Current Premium (LTP)</span>
                    <span className="text-base font-black text-emerald-400 font-mono">
                      ₹{currentOptionPremium.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 block">Total Contract Margin</span>
                    <span className="text-sm font-black text-white font-mono">
                      ₹{optionMarginRequired.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* CASH EQUITY SPECIFIC CONTROLS */
              <div className="space-y-3 bg-gray-950/80 p-3.5 rounded-xl border border-gray-800/80">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Side
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-gray-900 p-0.5 rounded-xl border border-gray-800">
                      <button
                        type="button"
                        onClick={() => setOrderSide('long')}
                        className={`text-xs py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                          orderSide === 'long'
                            ? 'bg-emerald-500 text-gray-950'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        BUY
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderSide('short')}
                        className={`text-xs py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                          orderSide === 'short'
                            ? 'bg-rose-500 text-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        SELL
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Order Type
                    </label>
                    <select
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none"
                    >
                      <option value="market">Market (Instant)</option>
                      <option value="limit">Limit Order</option>
                    </select>
                  </div>
                </div>

                {orderType === 'limit' && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Limit Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      placeholder={selectedAsset.spot.toString()}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                <div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-1">
                    <span>Quantity (Shares)</span>
                    <span className="text-gray-500 font-mono">CMP: ₹{selectedAsset.spot}</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={equityShares}
                    onChange={(e) => setEquityShares(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex gap-1.5 mt-2">
                    {[10, 25, 50, 100].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setEquityShares(qty)}
                        className="flex-1 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 text-[10px] font-bold text-gray-400 cursor-pointer"
                      >
                        +{qty}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Target & Stop Loss Optional Inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Target Price (Optional)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="Target (₹)"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Stop Loss (Optional)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(e.target.value)}
                  placeholder="SL (₹)"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Margin Required vs Available Info */}
            <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-gray-950 border border-gray-800">
              <span className="text-gray-400">Margin Required:</span>
              <span className="font-mono font-black text-white">
                ₹{totalMarginRequired.toLocaleString()}
              </span>
            </div>

            {/* Execute Order CTA */}
            <button
              type="submit"
              disabled={orderSubmitting}
              className={`w-full font-black py-4 rounded-xl text-sm transition-all shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${
                orderCategory === 'options'
                  ? optionType === 'CE'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-gray-950 shadow-emerald-500/20'
                    : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                  : orderSide === 'long'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-gray-950 shadow-emerald-500/20'
                  : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
              }`}
            >
              <span>⚡</span>
              {orderSubmitting
                ? 'Routing to Exchange...'
                : orderCategory === 'options'
                ? `BUY ${optionsUnderlying} ${strikePrice} ${optionType} (₹${optionMarginRequired.toLocaleString()})`
                : `${orderSide.toUpperCase()} ${selectedAsset.symbol} (₹${totalMarginRequired.toLocaleString()})`}
            </button>
          </form>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. Bottom Section: Active Positions & Executed Orders Tabs */}
      {/* ========================================================= */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveBottomTab('positions')}
              className={`text-sm font-bold pb-2 -mb-4 transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeBottomTab === 'positions'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <span>📍</span> Active Positions ({openPositions.length})
            </button>
            <button
              onClick={() => setActiveBottomTab('orders')}
              className={`text-sm font-bold pb-2 -mb-4 transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeBottomTab === 'orders'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <span>📜</span> Closed Trades / History ({closedTrades.length})
            </button>
            <button
              onClick={() => setActiveBottomTab('stats')}
              className={`text-sm font-bold pb-2 -mb-4 transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeBottomTab === 'stats'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <span>📊</span> Desk Analytics
            </button>
          </div>

          <button
            onClick={fetchTrades}
            className="text-xs text-gray-400 hover:text-white cursor-pointer flex items-center gap-1 font-mono"
          >
            ↻ Refresh Ledger
          </button>
        </div>

        {/* TAB 1: ACTIVE POSITIONS */}
        {activeBottomTab === 'positions' && (
          <div>
            {openPositions.length === 0 ? (
              <div className="p-12 text-center text-gray-500 space-y-2">
                <span className="text-3xl block">📉</span>
                <p className="text-sm font-medium">No open positions in your terminal.</p>
                <p className="text-xs text-gray-600">
                  Select an Equity or Options contract from the order terminal above to execute a trade.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-950 text-gray-400 border-b border-gray-800">
                    <tr>
                      <th className="py-3 px-4">Instrument</th>
                      <th className="py-3 px-4">Side</th>
                      <th className="py-3 px-4">Quantity</th>
                      <th className="py-3 px-4">Avg Entry Price</th>
                      <th className="py-3 px-4">Live CMP</th>
                      <th className="py-3 px-4">Floating P&L</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 font-mono">
                    {openPositions.map((pos) => {
                      const { currentPrice, pnl, pnlPercent } = calculatePositionMetrics(pos);
                      const isProfit = pnl >= 0;

                      return (
                        <tr key={pos.id} className="hover:bg-gray-950/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                            <span>{pos.symbol}</span>
                            {pos.optionType && (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                                  pos.optionType === 'CE'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {pos.optionType}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                                pos.tradeType === 'long'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-400'
                              }`}
                            >
                              {pos.tradeType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-200">{pos.quantity}</td>
                          <td className="py-3.5 px-4 text-gray-200">₹{pos.entryPrice.toFixed(2)}</td>
                          <td className="py-3.5 px-4 text-white font-bold">
                            ₹{currentPrice.toFixed(2)}
                          </td>
                          <td
                            className={`py-3.5 px-4 font-black text-sm ${
                              isProfit ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isProfit ? '+' : ''}₹{pnl.toLocaleString()} ({isProfit ? '+' : ''}
                            {pnlPercent}%)
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleSquareOff(pos)}
                              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                            >
                              Square Off
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CLOSED TRADES */}
        {activeBottomTab === 'orders' && (
          <div>
            {closedTrades.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-sm">No closed trades yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-gray-950 text-gray-400 border-b border-gray-800">
                    <tr>
                      <th className="py-3 px-4">Instrument</th>
                      <th className="py-3 px-4">Side</th>
                      <th className="py-3 px-4">Qty</th>
                      <th className="py-3 px-4">Entry</th>
                      <th className="py-3 px-4">Exit</th>
                      <th className="py-3 px-4">Realized P&L</th>
                      <th className="py-3 px-4">Outcome</th>
                      <th className="py-3 px-4 text-right">Closed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {closedTrades.map((t) => {
                      const isProfit = (t.pnl || 0) >= 0;
                      return (
                        <tr key={t.id} className="hover:bg-gray-950/40">
                          <td className="py-3.5 px-4 font-bold text-white">{t.symbol}</td>
                          <td className="py-3.5 px-4 text-gray-300 uppercase">{t.tradeType}</td>
                          <td className="py-3.5 px-4 text-gray-300">{t.quantity}</td>
                          <td className="py-3.5 px-4 text-gray-300">₹{t.entryPrice?.toFixed(2)}</td>
                          <td className="py-3.5 px-4 text-gray-300">₹{t.exitPrice?.toFixed(2)}</td>
                          <td
                            className={`py-3.5 px-4 font-black ${
                              isProfit ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isProfit ? '+' : ''}₹{t.pnl?.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                t.outcome === 'win'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {t.outcome}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right text-gray-500">
                            {t.exitDate ? new Date(t.exitDate).toLocaleTimeString() : 'Just now'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STATS */}
        {activeBottomTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-950 rounded-xl border border-gray-800">
            <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
              <span className="text-xs text-gray-500 block">Total Realized P&L</span>
              <h4
                className={`text-2xl font-black font-mono mt-1 ${
                  totalRealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {totalRealizedPnl >= 0 ? '+' : ''}₹{totalRealizedPnl.toLocaleString()}
              </h4>
            </div>

            <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
              <span className="text-xs text-gray-500 block">Win Rate</span>
              <h4 className="text-2xl font-black font-mono text-emerald-400 mt-1">
                {winRate}%
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {winCount} Wins / {closedTrades.length - winCount} Losses
              </p>
            </div>

            <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
              <span className="text-xs text-gray-500 block">Total Executed Trades</span>
              <h4 className="text-2xl font-black font-mono text-white mt-1">
                {closedTrades.length + openPositions.length}
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {openPositions.length} Open • {closedTrades.length} Closed
              </p>
            </div>

            <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
              <span className="text-xs text-gray-500 block">Trading Terminal Status</span>
              <h4 className="text-2xl font-black font-mono text-emerald-400 mt-1">
                ACTIVE
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Real-time NSE/BSE Simulator</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TradingTerminal;
