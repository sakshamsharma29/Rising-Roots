import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getGlobalMarketStatus } from '../utils/marketHours';

// Institutional 7 Core Assets specified by Client + Major FX
const FEATURED_CHART_ASSETS = [
  {
    symbol: 'BTCUSDT',
    displayName: 'Bitcoin (BTC/USDT)',
    tvSymbol: 'BINANCE:BTCUSDT',
    category: 'crypto',
    badge: 'Crypto 24/7',
    icon: '₿',
    exchange: 'Delta / Binance',
    spot: 64650.00,
    changePct: 1.76,
    high: 65420.00,
    low: 63890.00,
    bias: 'Bullish Momentum',
    s1: '$63,800',
    s2: '$62,400',
    r1: '$65,800',
    r2: '$67,200',
    strategy: '15M Demand Zone Retest with 1:3.0 R:R',
  },
  {
    symbol: 'ETHUSDT',
    displayName: 'Ethereum (ETH/USDT)',
    tvSymbol: 'BINANCE:ETHUSDT',
    category: 'crypto',
    badge: 'Crypto 24/7',
    icon: 'Ξ',
    exchange: 'Delta / Binance',
    spot: 2680.40,
    changePct: 2.15,
    high: 2710.00,
    low: 2610.00,
    bias: 'Bullish Breakout',
    s1: '$2,620',
    s2: '$2,550',
    r1: '$2,740',
    r2: '$2,850',
    strategy: 'Continuation Long above $2,650 Resistance',
  },
  {
    symbol: 'SOLUSDT',
    displayName: 'Solana (SOL/USDT)',
    tvSymbol: 'BINANCE:SOLUSDT',
    category: 'crypto',
    badge: 'Crypto 24/7',
    icon: '◎',
    exchange: 'Delta / Binance',
    spot: 156.20,
    changePct: -0.85,
    high: 159.80,
    low: 152.40,
    bias: 'Range Accumulation',
    s1: '$150.00',
    s2: '$144.50',
    r1: '$162.00',
    r2: '$170.00',
    strategy: 'Range Low Sweep & Reclaim Play',
  },
  {
    symbol: 'XAUUSD',
    displayName: 'Spot Gold (XAU/USD)',
    tvSymbol: 'TVC:GOLD',
    category: 'commodity',
    badge: 'Precious Metals',
    icon: '🥇',
    exchange: 'Global Spot',
    spot: 2688.50,
    changePct: 0.74,
    high: 2694.20,
    low: 2673.10,
    bias: 'Strong Bullish',
    s1: '$2,670',
    s2: '$2,652',
    r1: '$2,710',
    r2: '$2,735',
    strategy: 'Macro Yield Invalidation Dip Buying',
  },
  {
    symbol: 'XAGUSD',
    displayName: 'Spot Silver (XAG/USD)',
    tvSymbol: 'TVC:SILVER',
    category: 'commodity',
    badge: 'Precious Metals',
    icon: '🥈',
    exchange: 'Global Spot',
    spot: 31.55,
    changePct: 1.28,
    high: 31.95,
    low: 31.05,
    bias: 'Bullish Expansion',
    s1: '$31.10',
    s2: '$30.40',
    r1: '$32.40',
    r2: '$33.20',
    strategy: 'High Volume Trendline Breakout',
  },
  {
    symbol: 'NIFTY',
    displayName: 'NIFTY 50 Index (NSE)',
    tvSymbol: 'NSE:NIFTY',
    category: 'indices',
    badge: 'Indian Benchmark',
    icon: '🇮🇳',
    exchange: 'National Stock Exchange (NSE)',
    spot: 24385.00,
    changePct: 0.52,
    high: 24460.00,
    low: 24310.00,
    bias: 'Bullish Continuation',
    s1: '24,250',
    s2: '24,100',
    r1: '24,550',
    r2: '24,700',
    strategy: 'Intraday Call Buying on 20-EMA Pullback',
  },
  {
    symbol: 'SENSEX',
    displayName: 'BSE SENSEX Index',
    tvSymbol: 'BSE:SENSEX',
    category: 'indices',
    badge: 'Indian Benchmark',
    icon: '🇮🇳',
    exchange: 'Bombay Stock Exchange (BSE)',
    spot: 80280.00,
    changePct: 0.46,
    high: 80510.00,
    low: 80020.00,
    bias: 'Institutional Accumulation',
    s1: '79,800',
    s2: '79,200',
    r1: '80,800',
    r2: '81,500',
    strategy: 'Largecap Financial Momentum Setup',
  },
];

const FOREX_WATCHLIST = [
  { symbol: 'EUR/USD', displayName: 'Euro / US Dollar', tvSymbol: 'FX:EURUSD', spot: 1.0845, changePct: 0.17, high: 1.0870, low: 1.0820, category: 'forex' },
  { symbol: 'GBP/USD', displayName: 'British Pound / USD', tvSymbol: 'FX:GBPUSD', spot: 1.3025, changePct: -0.18, high: 1.3065, low: 1.2990, category: 'forex' },
  { symbol: 'USD/JPY', displayName: 'USD / Japanese Yen', tvSymbol: 'FX:USDJPY', spot: 153.40, changePct: 0.43, high: 153.90, low: 152.60, category: 'forex' },
  { symbol: 'AUD/USD', displayName: 'Australian Dollar / USD', tvSymbol: 'FX:AUDUSD', spot: 0.6680, changePct: 0.18, high: 0.6710, low: 0.6650, category: 'forex' },
];

export default function TradingTerminal() {
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
  const [searchParams] = useSearchParams();

  // Selected asset & timeframe
  const [selectedAsset, setSelectedAsset] = useState(FEATURED_CHART_ASSETS[0]);
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
    const interval = setInterval(fetchDeltaTickers, 4000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [API_URL]);

  // Handle URL query param (e.g. arriving from VIP signals)
  useEffect(() => {
    const sym = searchParams.get('symbol');
    if (sym) {
      const clean = sym.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      const match = [...FEATURED_CHART_ASSETS, ...FOREX_WATCHLIST].find(
        (a) => a.symbol.replace(/[^A-Za-z0-9]/g, '').toUpperCase() === clean
      );
      if (match) setSelectedAsset(match);
    }
  }, [searchParams]);

  // Combined Watchlist
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

  // Filtered Assets
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
    selectedAsset.tvSymbol
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
          <span className="text-[10px] font-mono text-emerald-400 font-bold">
            TRADINGVIEW LIVE CANDLESTICKS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {FEATURED_CHART_ASSETS.map((asset) => {
            const isSelected = selectedAsset.symbol === asset.symbol;
            return (
              <button
                key={asset.symbol}
                onClick={() => setSelectedAsset(asset)}
                className={`p-2.5 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-500 text-gray-950 shadow-md shadow-emerald-500/20 font-bold'
                    : 'bg-gray-950 hover:bg-gray-800 text-gray-300 border border-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{asset.icon}</span>
                  <span className={`text-[10px] font-mono font-bold ${
                    isSelected ? 'text-gray-900' : asset.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {asset.changePct >= 0 ? '+' : ''}{asset.changePct.toFixed(2)}%
                  </span>
                </div>
                <div className="mt-1">
                  <div className={`text-xs font-black truncate ${isSelected ? 'text-gray-950' : 'text-white'}`}>
                    {asset.symbol}
                  </div>
                  <div className={`text-[10px] font-mono truncate ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}>
                    {asset.spot >= 1000 ? `$${asset.spot.toLocaleString()}` : `$${asset.spot}`}
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
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedAsset.icon || '📈'}</span>
                  <h2 className="text-xl sm:text-2xl font-black text-white font-mono">
                    {selectedAsset.displayName || selectedAsset.symbol}
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                    {selectedAsset.badge || selectedAsset.category}
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mt-1.5">
                  <span className="text-3xl font-black font-mono text-white tracking-tight">
                    {selectedAsset.spot >= 1000
                      ? `$${selectedAsset.spot.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                      : `$${selectedAsset.spot}`}
                  </span>
                  <span className={`text-sm font-bold font-mono ${selectedAsset.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedAsset.changePct >= 0 ? '+' : ''}{selectedAsset.changePct.toFixed(2)}%
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    Feed: {selectedAsset.exchange || 'TradingView Real-Time'}
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
                key={selectedAsset.tvSymbol + timeframe}
                src={tvWidgetUrl}
                className="w-full h-full border-0"
                title={`Live Chart - ${selectedAsset.displayName || selectedAsset.symbol}`}
                allow="fullscreen"
              />
            </div>

            {/* Key Market Metrics Footer */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
              <div className="bg-gray-950 border border-gray-800 p-3 rounded-xl">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">24h High</span>
                <span className="font-mono font-bold text-white">${selectedAsset.high?.toLocaleString() || '—'}</span>
              </div>
              <div className="bg-gray-950 border border-gray-800 p-3 rounded-xl">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">24h Low</span>
                <span className="font-mono font-bold text-white">${selectedAsset.low?.toLocaleString() || '—'}</span>
              </div>
              <div className="bg-gray-950 border border-gray-800 p-3 rounded-xl">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Trading Bias</span>
                <span className="font-mono font-bold text-emerald-400">{selectedAsset.bias || 'Bullish'}</span>
              </div>
              <div className="bg-gray-950 border border-gray-800 p-3 rounded-xl">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Min R:R Rule</span>
                <span className="font-mono font-bold text-amber-400">1 : 2.8+</span>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR: Desk Technical Analysis & Full Watchlist (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Desk Technical Analysis Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="text-base font-extrabold text-white">Desk Technical Setup</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                {selectedAsset.symbol}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-950 border border-gray-800 p-3.5 rounded-xl space-y-1.5">
                <span className="text-gray-500 uppercase font-bold text-[10px] block">Recommended Play</span>
                <p className="font-bold text-white text-sm">
                  {selectedAsset.strategy || 'Trendline Breakout & Liquidity Sweep Execution'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-950 border border-gray-800 p-3 rounded-xl">
                  <span className="text-gray-500 uppercase font-bold text-[10px] block">Support (S1 / S2)</span>
                  <div className="font-mono font-bold text-emerald-400 text-xs mt-1">
                    {selectedAsset.s1 || 'Key S1'} / {selectedAsset.s2 || 'Key S2'}
                  </div>
                </div>
                <div className="bg-gray-950 border border-gray-800 p-3 rounded-xl">
                  <span className="text-gray-500 uppercase font-bold text-[10px] block">Resistance (R1 / R2)</span>
                  <div className="font-mono font-bold text-rose-400 text-xs mt-1">
                    {selectedAsset.r1 || 'Key R1'} / {selectedAsset.r2 || 'Key R2'}
                  </div>
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-800 p-3.5 rounded-xl">
                <span className="text-gray-500 uppercase font-bold text-[10px] block mb-1">Desk Risk Guidelines</span>
                <ul className="space-y-1 text-gray-300 text-[11px]">
                  <li>• Never enter without predefined invalidation stop-loss</li>
                  <li>• Max desk risk: 2% of allocated capital per setup</li>
                  <li>• Partial profit target taking at 1:1.5 and trail remaining</li>
                </ul>
              </div>
            </div>

            {/* Direct CTA: Join VIP Room / Telegram */}
            <div className="pt-2 space-y-2">
              <Link
                to="/dashboard/signals"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>⚡</span>
                <span>Open VIP Signals Room</span>
              </Link>

              <a
                href="https://t.me/RisingRootsDesk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
              >
                <span>✈️</span>
                <span>Join Official Telegram VIP Desk</span>
              </a>
            </div>
          </div>

          {/* Full Watchlist & Search */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-xl flex flex-col h-[480px]">
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
                const isSelected = selectedAsset.symbol === asset.symbol;
                return (
                  <div
                    key={asset.symbol}
                    onClick={() => setSelectedAsset(asset)}
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
                      <div className="text-[11px] text-gray-400 truncate max-w-[130px]">
                        {asset.displayName}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-white text-xs">
                        {asset.spot >= 1000 ? `$${asset.spot.toLocaleString()}` : `$${asset.spot}`}
                      </div>
                      <div className={`text-[10px] font-mono font-bold ${
                        asset.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {asset.changePct >= 0 ? '+' : ''}{asset.changePct.toFixed(2)}%
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
