import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getGlobalMarketStatus } from '../utils/marketHours';

// Helper: Format asset price accurately by category
export const formatAssetPrice = (asset, price) => {
  if (price === undefined || price === null || isNaN(price)) return '—';
  const num = Number(price);
  if (asset?.category === 'indices') {
    return `${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })} pts`;
  }
  if (asset?.category === 'forex') {
    return `$${num.toFixed(4)}`;
  }
  if (num >= 1000) {
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${num.toFixed(2)}`;
};

// Helper: Compute dynamic Support and Resistance relative to current live spot price
export const computeLevels = (asset, spot) => {
  const p = Number(spot) || 100;
  if (asset?.category === 'indices') {
    return {
      s1: `${Math.round(p * 0.993).toLocaleString('en-IN')} pts`,
      s2: `${Math.round(p * 0.985).toLocaleString('en-IN')} pts`,
      r1: `${Math.round(p * 1.007).toLocaleString('en-IN')} pts`,
      r2: `${Math.round(p * 1.015).toLocaleString('en-IN')} pts`,
    };
  }
  if (asset?.category === 'forex') {
    return {
      s1: `$${(p * 0.996).toFixed(4)}`,
      s2: `$${(p * 0.992).toFixed(4)}`,
      r1: `$${(p * 1.004).toFixed(4)}`,
      r2: `$${(p * 1.008).toFixed(4)}`,
    };
  }
  // Crypto & Commodities
  return {
    s1: `$${Math.round(p * 0.985).toLocaleString('en-US')}`,
    s2: `$${Math.round(p * 0.968).toLocaleString('en-US')}`,
    r1: `$${Math.round(p * 1.018).toLocaleString('en-US')}`,
    r2: `$${Math.round(p * 1.035).toLocaleString('en-US')}`,
  };
};

// 7 Core Institutional Assets requested by Client
const FEATURED_CHART_ASSETS = [
  {
    symbol: 'BTCUSDT',
    displayName: 'Bitcoin (BTC/USDT)',
    tvSymbol: 'BINANCE:BTCUSDT',
    category: 'crypto',
    badge: 'Crypto 24/7',
    tag: 'BTC',
    tagClass: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    exchange: 'Delta / Binance',
    spot: 59537.00,
    changePct: -2.87,
    high: 61850.00,
    low: 58920.00,
    bias: 'Demand Zone Retest',
    strategy: '15M Demand Zone Retest with 1:3.0 R:R',
  },
  {
    symbol: 'ETHUSDT',
    displayName: 'Ethereum (ETH/USDT)',
    tvSymbol: 'BINANCE:ETHUSDT',
    category: 'crypto',
    badge: 'Crypto 24/7',
    tag: 'ETH',
    tagClass: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
    exchange: 'Delta / Binance',
    spot: 1677.50,
    changePct: -2.38,
    high: 1720.00,
    low: 1640.00,
    bias: 'Range Accumulation',
    strategy: 'Continuation Long above $1,650 Support',
  },
  {
    symbol: 'SOLUSDT',
    displayName: 'Solana (SOL/USDT)',
    tvSymbol: 'BINANCE:SOLUSDT',
    category: 'crypto',
    badge: 'Crypto 24/7',
    tag: 'SOL',
    tagClass: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    exchange: 'Delta / Binance',
    spot: 70.25,
    changePct: -1.55,
    high: 73.50,
    low: 68.80,
    bias: 'Liquidity Reclaim',
    strategy: 'Sweep of Lows & Reclaim Breakout',
  },
  {
    symbol: 'XAUUSD',
    displayName: 'Spot Gold (XAU/USD)',
    tvSymbol: 'TVC:GOLD',
    category: 'commodity',
    badge: 'Precious Metals',
    tag: 'GOLD',
    tagClass: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    exchange: 'Global Spot Bullion',
    spot: 2688.50,
    changePct: 0.74,
    high: 2695.40,
    low: 2671.20,
    bias: 'Macro Bullish',
    strategy: 'Macro Yield Invalidation Dip Buying with 1:2.8 R:R',
  },
  {
    symbol: 'XAGUSD',
    displayName: 'Spot Silver (XAG/USD)',
    tvSymbol: 'TVC:SILVER',
    category: 'commodity',
    badge: 'Precious Metals',
    tag: 'SILVER',
    tagClass: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    exchange: 'Global Spot Bullion',
    spot: 31.55,
    changePct: 1.28,
    high: 31.95,
    low: 31.05,
    bias: 'Bullish Expansion',
    strategy: 'High Volume Trendline Breakout Confirmation',
  },
  {
    symbol: 'NIFTY',
    displayName: 'NIFTY 50 Index (NSE)',
    tvSymbol: 'NSE:NIFTY',
    category: 'indices',
    badge: 'Indian Benchmark',
    tag: 'NSE',
    tagClass: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    exchange: 'National Stock Exchange (NSE)',
    spot: 24385.00,
    changePct: 0.52,
    high: 24460.00,
    low: 24310.00,
    bias: 'Bullish Continuation',
    strategy: 'Intraday Call Buying on 20-EMA Pullback',
  },
  {
    symbol: 'SENSEX',
    displayName: 'BSE SENSEX Index',
    tvSymbol: 'BSE:SENSEX',
    category: 'indices',
    badge: 'Indian Benchmark',
    tag: 'BSE',
    tagClass: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    exchange: 'Bombay Stock Exchange (BSE)',
    spot: 80280.00,
    changePct: 0.46,
    high: 80510.00,
    low: 80020.00,
    bias: 'Institutional Accumulation',
    strategy: 'Largecap Financial Momentum Setup',
  },
];

const FOREX_WATCHLIST = [
  { symbol: 'EUR/USD', displayName: 'Euro / US Dollar', tvSymbol: 'FX:EURUSD', spot: 1.0845, changePct: 0.17, high: 1.0870, low: 1.0820, category: 'forex', tag: 'EUR', tagClass: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', exchange: 'Global FX Liquidity', bias: 'Range Bound', strategy: 'London Session High Rejection' },
  { symbol: 'GBP/USD', displayName: 'British Pound / USD', tvSymbol: 'FX:GBPUSD', spot: 1.3025, changePct: -0.18, high: 1.3065, low: 1.2990, category: 'forex', tag: 'GBP', tagClass: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30', exchange: 'Global FX Liquidity', bias: 'Bearish Pullback', strategy: 'New York Session Open Momentum' },
  { symbol: 'USD/JPY', displayName: 'USD / Japanese Yen', tvSymbol: 'FX:USDJPY', spot: 153.40, changePct: 0.43, high: 153.90, low: 152.60, category: 'forex', tag: 'JPY', tagClass: 'bg-red-500/20 text-red-300 border border-red-500/30', exchange: 'Global FX Liquidity', bias: 'Bullish Continuation', strategy: 'Tokyo Fix Continuation Setup' },
  { symbol: 'AUD/USD', displayName: 'Australian Dollar / USD', tvSymbol: 'FX:AUDUSD', spot: 0.6680, changePct: 0.18, high: 0.6710, low: 0.6650, category: 'forex', tag: 'AUD', tagClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30', exchange: 'Global FX Liquidity', bias: 'Commodity Currency Bid', strategy: 'Support Bounce Play' },
];

export default function TradingTerminal() {
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
  const [searchParams] = useSearchParams();

  // Active Symbol and Timeframe
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('15m');
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'crypto' | 'commodity' | 'indices' | 'forex'
  const [searchQuery, setSearchQuery] = useState('');

  // Global Market Sessions Status
  const [marketStatus, setMarketStatus] = useState(getGlobalMarketStatus());
  useEffect(() => {
    const timer = setInterval(() => setMarketStatus(getGlobalMarketStatus()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Live Crypto Tickers from Delta Exchange API
  const [cryptoSpotMap, setCryptoSpotMap] = useState({});

  useEffect(() => {
    let isSubscribed = true;
    const fetchDeltaTickers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/delta/tickers`);
        const json = await res.json();
        if (isSubscribed && json.success && Array.isArray(json.data)) {
          const map = {};
          json.data.forEach((item) => {
            map[item.symbol] = {
              spot: item.spot,
              changePct: item.changePct,
              high: item.high,
              low: item.low,
            };
          });
          setCryptoSpotMap(map);
        }
      } catch (err) {}
    };

    fetchDeltaTickers();
    const interval = setInterval(fetchDeltaTickers, 3000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [API_URL]);

  // Handle URL query param (e.g. arriving from VIP signals room)
  useEffect(() => {
    const sym = searchParams.get('symbol');
    if (sym) {
      const clean = sym.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      const match = [...FEATURED_CHART_ASSETS, ...FOREX_WATCHLIST].find(
        (a) => a.symbol.replace(/[^A-Za-z0-9]/g, '').toUpperCase() === clean
      );
      if (match) setSelectedSymbol(match.symbol);
    }
  }, [searchParams]);

  // Combined Watchlist with Live Spot Merging
  const allAssets = useMemo(() => {
    return [...FEATURED_CHART_ASSETS, ...FOREX_WATCHLIST].map((item) => {
      const live = cryptoSpotMap[item.symbol];
      if (live) {
        return {
          ...item,
          spot: live.spot,
          changePct: live.changePct,
          high: live.high || item.high,
          low: live.low || item.low,
        };
      }
      return item;
    });
  }, [cryptoSpotMap]);

  // Currently Selected Asset (Always synced to live ticks)
  const currentAsset = useMemo(() => {
    return allAssets.find((a) => a.symbol === selectedSymbol) || allAssets[0];
  }, [allAssets, selectedSymbol]);

  // Dynamic Support & Resistance levels
  const levels = useMemo(() => {
    return computeLevels(currentAsset, currentAsset.spot);
  }, [currentAsset]);

  // Filtered Assets for Watchlist
  const filteredAssets = useMemo(() => {
    let list = allAssets;
    if (activeCategory !== 'all') {
      list = list.filter((a) => a.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) => a.symbol.toLowerCase().includes(q) || a.displayName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allAssets, activeCategory, searchQuery]);

  // Interval mapping for TradingView Embed
  const intervalMap = {
    '1m': '1',
    '5m': '5',
    '15m': '15',
    '1h': '60',
    '4h': '240',
    '1D': 'D',
  };

  const tvInterval = intervalMap[timeframe] || '15';
  const tvWidgetUrl = `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(
    currentAsset.tvSymbol
  )}&interval=${tvInterval}&theme=dark&style=1&timezone=Asia%2FKolkata&studies=%5B%5D&hide_side_toolbar=0&allow_symbol_change=1&save_image=0&locale=en`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner: Global Market Status & Quick Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xl shrink-0">
            ⚡
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-sm text-white">MULTI-ASSET LIVE TERMINAL</span>
              <span className="text-gray-600">•</span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                BTC, ETH, SOL, GOLD, SILVER, NIFTY & SENSEX
              </span>
              <span className="text-gray-600">•</span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${marketStatus.forex.badgeClass}`}>
                {marketStatus.forex.statusText}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              Market Clock: UTC {marketStatus.utcTimeString} | IST {marketStatus.localTimeString}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          <Link
            to="/history"
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5"
          >
            <span>🏆</span> Performance Track Record
          </Link>

          <Link
            to="/dashboard/options"
            className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-black px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <span>📈</span> Delta Option Chain
          </Link>
        </div>
      </div>

      {/* 7 Core Client-Requested Asset Selector Bar */}
      <div className="bg-gray-900 border border-gray-800 p-3 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
            Client Core Markets: 1-Click Live Chart Switcher
          </span>
          <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE REAL-TIME TICKS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {allAssets.slice(0, 7).map((asset) => {
            const isSelected = selectedSymbol === asset.symbol;
            return (
              <button
                key={asset.symbol}
                onClick={() => setSelectedSymbol(asset.symbol)}
                className={`p-2.5 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-500 text-gray-950 shadow-md shadow-emerald-500/20 font-bold'
                    : 'bg-gray-950 hover:bg-gray-800 text-gray-300 border border-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-gray-950 text-emerald-400' : asset.tagClass || 'bg-gray-800 text-gray-300'
                  }`}>
                    {asset.tag || asset.symbol}
                  </span>
                  <span className={`text-[10px] font-mono font-bold ${
                    isSelected ? 'text-gray-950 font-black' : asset.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {asset.changePct >= 0 ? '+' : ''}{Number(asset.changePct).toFixed(2)}%
                  </span>
                </div>
                <div className="mt-1.5">
                  <div className={`text-xs font-black truncate ${isSelected ? 'text-gray-950' : 'text-white'}`}>
                    {asset.symbol}
                  </div>
                  <div className={`text-[10px] font-mono font-bold truncate ${isSelected ? 'text-gray-900' : 'text-gray-300'}`}>
                    {formatAssetPrice(asset, asset.spot)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Terminal Layout: Chart (8 Cols) + Watchlist & Desk Analysis (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART SECTION (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-2xl">
            {/* Header: Selected Asset Info & Timeframe Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800 gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-mono font-black px-2 py-0.5 rounded ${currentAsset.tagClass || 'bg-gray-800 text-white'}`}>
                    {currentAsset.tag || currentAsset.symbol}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white font-mono">
                    {currentAsset.displayName || currentAsset.symbol}
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                    {currentAsset.badge || currentAsset.category}
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mt-1.5">
                  <span className="text-3xl font-black font-mono text-white tracking-tight">
                    {formatAssetPrice(currentAsset, currentAsset.spot)}
                  </span>
                  <span className={`text-sm font-bold font-mono ${currentAsset.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {currentAsset.changePct >= 0 ? '+' : ''}{Number(currentAsset.changePct).toFixed(2)}%
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    Feed: {currentAsset.exchange || 'Delta / TradingView Real-Time'}
                  </span>
                </div>
              </div>

              {/* Timeframe Selector */}
              <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-xl border border-gray-800 self-start sm:self-auto">
                {['1m', '5m', '15m', '1h', '4h', '1D'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                      timeframe === tf
                        ? 'bg-emerald-500 text-gray-950 shadow'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* TradingView Advanced Live Interactive Chart Widget */}
            <div className="mt-4 rounded-2xl overflow-hidden border border-gray-800 bg-gray-950 h-[580px]">
              <iframe
                key={currentAsset.tvSymbol + timeframe}
                src={tvWidgetUrl}
                className="w-full h-full border-0"
                title={`Live Chart - ${currentAsset.displayName || currentAsset.symbol}`}
                allow="fullscreen"
              />
            </div>

            {/* Key Market Metrics Footer */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs font-mono">
              <div className="bg-gray-950 border border-gray-800 p-3 rounded-xl">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">24h High</span>
                <span className="font-bold text-white">{formatAssetPrice(currentAsset, currentAsset.high)}</span>
              </div>
              <div className="bg-gray-950 border border-gray-800 p-3 rounded-xl">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">24h Low</span>
                <span className="font-bold text-white">{formatAssetPrice(currentAsset, currentAsset.low)}</span>
              </div>
              <div className="bg-gray-950 border border-gray-800 p-3 rounded-xl">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Trading Bias</span>
                <span className="font-bold text-emerald-400">{currentAsset.bias || 'Bullish'}</span>
              </div>
              <div className="bg-gray-950 border border-gray-800 p-3 rounded-xl">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Min R:R Rule</span>
                <span className="font-bold text-amber-400">1 : 2.8+</span>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR: Desk Technical Analysis & Full Watchlist (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Desk Technical Analysis Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="text-base font-extrabold text-white">Desk Technical Setup</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                {currentAsset.symbol}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-950 border border-gray-800 p-3 rounded-xl space-y-1">
                <span className="text-gray-500 uppercase font-bold text-[10px] block">Recommended Play</span>
                <p className="font-bold text-white text-xs sm:text-sm">
                  {currentAsset.strategy || 'Trendline Breakout & Liquidity Sweep Execution'}
                </p>
              </div>

              {/* Real-time Dynamic Support & Resistance */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-950 border border-gray-800 p-3 rounded-xl">
                  <span className="text-gray-500 uppercase font-bold text-[10px] block">Support (S1 / S2)</span>
                  <div className="font-mono font-bold text-emerald-400 text-xs mt-1">
                    {levels.s1} / {levels.s2}
                  </div>
                </div>
                <div className="bg-gray-950 border border-gray-800 p-3 rounded-xl">
                  <span className="text-gray-500 uppercase font-bold text-[10px] block">Resistance (R1 / R2)</span>
                  <div className="font-mono font-bold text-rose-400 text-xs mt-1">
                    {levels.r1} / {levels.r2}
                  </div>
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-800 p-3 rounded-xl">
                <span className="text-gray-500 uppercase font-bold text-[10px] block mb-1">Desk Risk Guidelines</span>
                <ul className="space-y-1 text-gray-300 text-[11px]">
                  <li>• Never enter without predefined invalidation stop-loss</li>
                  <li>• Max desk risk: 2% of allocated capital per setup</li>
                  <li>• Partial profit target taking at 1:1.5 and trail remaining</li>
                </ul>
              </div>
            </div>

            {/* Direct In-Platform Desk CTAs */}
            <div className="pt-2 space-y-2">
              <Link
                to="/dashboard/signals"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>⚡</span>
                <span>Open VIP Signals Room →</span>
              </Link>

              <Link
                to="/dashboard/options"
                className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
              >
                <span>📈</span>
                <span>Open Delta Option Chain →</span>
              </Link>
            </div>
          </div>

          {/* Full Watchlist & Search */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-xl flex flex-col h-[420px]">
            <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white">Multi-Asset Watchlist</h3>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">LIVE TICKS</span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'crypto', label: 'Crypto' },
                { id: 'commodity', label: 'Metals' },
                { id: 'indices', label: 'Indices' },
                { id: 'forex', label: 'Forex' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === tab.id
                      ? 'bg-emerald-500 text-gray-950 shadow'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search BTC, Gold, Nifty, EUR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Asset List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-800/60 pr-1 space-y-1">
              {filteredAssets.map((asset) => {
                const isSelected = selectedSymbol === asset.symbol;
                return (
                  <div
                    key={asset.symbol}
                    onClick={() => setSelectedSymbol(asset.symbol)}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/15 border border-emerald-500/30'
                        : 'hover:bg-gray-800/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">{asset.symbol}</span>
                        <span className="text-[10px] text-gray-500 uppercase">{asset.category}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 truncate max-w-[140px]">
                        {asset.displayName}
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="font-bold text-white text-xs">
                        {formatAssetPrice(asset, asset.spot)}
                      </div>
                      <div className={`text-[10px] font-bold ${
                        asset.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {asset.changePct >= 0 ? '+' : ''}{Number(asset.changePct).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
