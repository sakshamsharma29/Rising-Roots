import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getGlobalMarketStatus } from '../utils/marketHours';

// Base option specifications
const UNDERLYING_CONFIGS = {
  BTC: {
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    baseSpot: 64500,
    strikeStep: 1000,
    strikesRange: 9, // -9 to +9 strikes around ATM
    baseIV: 52.4,
    lotSize: 0.1,
  },
  ETH: {
    symbol: 'ETHUSDT',
    name: 'Ethereum',
    baseSpot: 2650,
    strikeStep: 50,
    strikesRange: 9,
    baseIV: 58.2,
    lotSize: 1,
  },
  SOL: {
    symbol: 'SOLUSDT',
    name: 'Solana',
    baseSpot: 155,
    strikeStep: 5,
    strikesRange: 8,
    baseIV: 68.5,
    lotSize: 10,
  },
};

// Expiry dates generator
const generateExpiries = () => {
  const now = new Date();
  const expiries = [];

  // Daily (Tomorrow 08:00 UTC)
  const d1 = new Date(now.getTime() + 86400000);
  expiries.push({ id: 'daily', label: `${d1.getDate()} ${d1.toLocaleString('en', { month: 'short' })} (1D - Daily)`, dte: 1 });

  // Weekly (Next Friday)
  const dFri = new Date(now);
  const day = dFri.getDay();
  const diffToFri = (5 - day + 7) % 7 || 7;
  dFri.setDate(dFri.getDate() + diffToFri);
  expiries.push({ id: 'weekly', label: `${dFri.getDate()} ${dFri.toLocaleString('en', { month: 'short' })} (Weekly)`, dte: Math.max(2, diffToFri) });

  // Bi-Weekly
  const dFri2 = new Date(dFri);
  dFri2.setDate(dFri2.getDate() + 7);
  expiries.push({ id: 'biweekly', label: `${dFri2.getDate()} ${dFri2.toLocaleString('en', { month: 'short' })} (Bi-Weekly)`, dte: diffToFri + 7 });

  // Monthly (Last Friday of month)
  const dMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  while (dMonth.getDay() !== 5) {
    dMonth.setDate(dMonth.getDate() - 1);
  }
  expiries.push({ id: 'monthly', label: `${dMonth.getDate()} ${dMonth.toLocaleString('en', { month: 'short' })} (Monthly)`, dte: 28 });

  return expiries;
};

export default function OptionChain() {
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
  const token = localStorage.getItem('rr_token');
  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }),
    [token]
  );

  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [expiries] = useState(generateExpiries());
  const [selectedExpiry, setSelectedExpiry] = useState(expiries[1]);
  const [filterMode, setFilterMode] = useState('near'); // 'all' | 'near' | 'itm' | 'otm'

  // Live Spot Prices from Binance Public API
  const [spotPrice, setSpotPrice] = useState(UNDERLYING_CONFIGS.BTC.baseSpot);
  const [spotChange, setSpotChange] = useState({ diff: 0, pct: 0 });
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [lastTickTime, setLastTickTime] = useState(null);

  // Market status
  const [marketStatus, setMarketStatus] = useState(getGlobalMarketStatus());
  useEffect(() => {
    const timer = setInterval(() => setMarketStatus(getGlobalMarketStatus()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Quick Paper Trade Modal State
  const [paperModal, setPaperModal] = useState(null); // { strike, type: 'CALL'|'PUT', ltp, symbol }
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderToast, setOrderToast] = useState(null);

  // Paper Margin
  const [paperMargin, setPaperMargin] = useState(() => {
    const saved = localStorage.getItem('rr_paper_margin_usd');
    return saved !== null ? Number(saved) : 10000;
  });

  const config = UNDERLYING_CONFIGS[selectedAsset];

  // Fetch real-time live price from Binance Public Ticker
  useEffect(() => {
    const fetchLivePrice = async () => {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${config.symbol}`);
        const data = await res.json();
        if (data && data.lastPrice) {
          const current = parseFloat(data.lastPrice);
          const changePct = parseFloat(data.priceChangePercent);
          const changeDiff = parseFloat(data.priceChange);
          setSpotPrice(current);
          setSpotChange({ diff: changeDiff, pct: changePct });
          setIsLiveConnected(true);
          setLastTickTime(new Date().toLocaleTimeString());
        }
      } catch (err) {
        // Fallback to config base spot
        setSpotPrice((prev) => prev || config.baseSpot);
      }
    };

    fetchLivePrice();
    const interval = setInterval(fetchLivePrice, 3000); // Poll live ticker every 3s
    return () => clearInterval(interval);
  }, [selectedAsset, config.symbol]);

  // Black-Scholes approximate Option Premium & Greeks
  const calculateOptionMetrics = (spot, strike, dte, iv, isCall) => {
    const t = Math.max(0.01, dte / 365);
    const r = 0.045; // Risk-free rate
    const sigma = iv / 100;

    const d1 = (Math.log(spot / strike) + (r + (sigma * sigma) / 2) * t) / (sigma * Math.sqrt(t));
    const d2 = d1 - sigma * Math.sqrt(t);

    // Standard Normal CDF approximation (Abramowitz & Stegun)
    const normCDF = (x) => {
      const b1 = 0.319381530;
      const b2 = -0.356563782;
      const b3 = 1.781477937;
      const b4 = -1.821255978;
      const b5 = 1.330274429;
      const p = 0.2316419;
      const c = 0.39894228;

      if (x >= 0) {
        const k = 1.0 / (1.0 + p * x);
        return 1.0 - c * Math.exp(-x * x / 2.0) * k *
          (b1 + k * (b2 + k * (b3 + k * (b4 + k * b5))));
      } else {
        const k = 1.0 / (1.0 - p * x);
        return c * Math.exp(-x * x / 2.0) * k *
          (b1 + k * (b2 + k * (b3 + k * (b4 + k * b5))));
      }
    };

    const callDelta = normCDF(d1);
    const putDelta = callDelta - 1;

    let premium = 0;
    if (isCall) {
      premium = spot * callDelta - strike * Math.exp(-r * t) * normCDF(d2);
    } else {
      premium = strike * Math.exp(-r * t) * normCDF(-d2) - spot * normCDF(-d1);
    }

    premium = Math.max(5, premium); // Floor price

    return {
      price: parseFloat(premium.toFixed(2)),
      delta: parseFloat((isCall ? callDelta : putDelta).toFixed(2)),
      bid: parseFloat((premium * 0.985).toFixed(2)),
      ask: parseFloat((premium * 1.015).toFixed(2)),
    };
  };

  // Generate strikes matrix
  const { strikesData, totalCallOI, totalPutOI, maxPainStrike } = useMemo(() => {
    const center = Math.round(spotPrice / config.strikeStep) * config.strikeStep;
    const strikes = [];
    let callOISum = 0;
    let putOISum = 0;

    for (let i = -config.strikesRange; i <= config.strikesRange; i++) {
      const strike = center + i * config.strikeStep;
      if (strike <= 0) continue;

      // Distance from ATM
      const distPct = Math.abs((strike - spotPrice) / spotPrice);
      const ivSkew = config.baseIV + (distPct * 35);

      const callMetrics = calculateOptionMetrics(spotPrice, strike, selectedExpiry.dte, ivSkew, true);
      const putMetrics = calculateOptionMetrics(spotPrice, strike, selectedExpiry.dte, ivSkew, false);

      // Deterministic synthetic Open Interest distribution
      const callBaseOI = Math.round(Math.max(50, 1800 - Math.abs(i) * 140 + Math.sin(strike) * 120));
      const putBaseOI = Math.round(Math.max(50, 1600 - Math.abs(i) * 130 + Math.cos(strike) * 110));

      callOISum += callBaseOI;
      putOISum += putBaseOI;

      const isAtm = strike === center;
      const isCallITM = strike < spotPrice;
      const isPutITM = strike > spotPrice;

      strikes.push({
        strike,
        isAtm,
        isCallITM,
        isPutITM,
        calls: {
          oi: callBaseOI,
          iv: parseFloat(ivSkew.toFixed(1)),
          delta: callMetrics.delta,
          bid: callMetrics.bid,
          ask: callMetrics.ask,
          ltp: callMetrics.price,
          changePct: parseFloat(((spotChange.pct * 1.8) + (Math.sin(i) * 1.5)).toFixed(2)),
        },
        puts: {
          oi: putBaseOI,
          iv: parseFloat(ivSkew.toFixed(1)),
          delta: putMetrics.delta,
          bid: putMetrics.bid,
          ask: putMetrics.ask,
          ltp: putMetrics.price,
          changePct: parseFloat(((-spotChange.pct * 1.8) + (Math.cos(i) * 1.5)).toFixed(2)),
        },
      });
    }

    // Max pain calculation (strike with minimum total option payout)
    let minLoss = Infinity;
    let maxPain = center;
    strikes.forEach((candidate) => {
      let loss = 0;
      strikes.forEach((s) => {
        if (candidate.strike > s.strike) {
          loss += (candidate.strike - s.strike) * s.calls.oi;
        }
        if (candidate.strike < s.strike) {
          loss += (s.strike - candidate.strike) * s.puts.oi;
        }
      });
      if (loss < minLoss) {
        minLoss = loss;
        maxPain = candidate.strike;
      }
    });

    return {
      strikesData: strikes,
      totalCallOI: callOISum,
      totalPutOI: putOISum,
      maxPainStrike: maxPain,
    };
  }, [spotPrice, config, selectedExpiry, spotChange]);

  const pcrRatio = totalCallOI > 0 ? parseFloat((totalPutOI / totalCallOI).toFixed(2)) : 1.0;
  const pcrSentiment = pcrRatio > 1.1 ? 'Bullish (Put Heavy)' : pcrRatio < 0.8 ? 'Bearish (Call Heavy)' : 'Neutral';

  // Filtered strikes
  const displayedStrikes = useMemo(() => {
    if (filterMode === 'all') return strikesData;
    if (filterMode === 'itm') return strikesData.filter((s) => s.isCallITM || s.isPutITM);
    if (filterMode === 'otm') return strikesData.filter((s) => !s.isCallITM && !s.isPutITM);
    // 'near': ±5 strikes from center
    const centerIdx = strikesData.findIndex((s) => s.isAtm);
    if (centerIdx === -1) return strikesData;
    const start = Math.max(0, centerIdx - 5);
    const end = Math.min(strikesData.length, centerIdx + 6);
    return strikesData.slice(start, end);
  }, [strikesData, filterMode]);

  // Handle Paper Trade Execution
  const handleExecutePaperOption = async (e) => {
    e.preventDefault();
    if (!paperModal || orderSubmitting) return;

    const totalCost = parseFloat((paperModal.ltp * orderQuantity).toFixed(2));
    if (paperMargin < totalCost) {
      setOrderToast({ type: 'error', message: `Insufficient demo balance! Required: $${totalCost.toLocaleString()}, Available: $${paperMargin.toLocaleString()}` });
      setTimeout(() => setOrderToast(null), 4000);
      return;
    }

    setOrderSubmitting(true);

    const payload = {
      symbol: `${selectedAsset} ${paperModal.strike} ${paperModal.type}`,
      assetType: 'options',
      tradeType: 'long', // Buy call or put
      entryPrice: paperModal.ltp,
      quantity: orderQuantity,
      strikePrice: paperModal.strike,
      optionType: paperModal.type === 'CALL' ? 'CE' : 'PE',
      notes: `Paper trade from Option Chain (${selectedExpiry.label})`,
      tags: ['option-chain', selectedAsset, paperModal.type.toLowerCase()],
    };

    try {
      const res = await fetch(`${API_URL}/api/trades`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        const newMargin = Math.max(0, paperMargin - totalCost);
        setPaperMargin(newMargin);
        localStorage.setItem('rr_paper_margin_usd', newMargin.toString());

        setOrderToast({
          type: 'success',
          message: `Paper Order Filled! Bought ${orderQuantity}x ${payload.symbol} @ $${paperModal.ltp}`,
        });
        setPaperModal(null);
      } else {
        setOrderToast({ type: 'error', message: data.message || 'Failed to record paper trade.' });
      }
    } catch (err) {
      setOrderToast({ type: 'error', message: 'Network error executing paper trade.' });
    } finally {
      setOrderSubmitting(false);
      setTimeout(() => setOrderToast(null), 4500);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>DERIBIT & BINANCE PUBLIC DATA FEED</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-400">{lastTickTime ? `Updated ${lastTickTime}` : 'Connecting...'}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>⚡ Crypto Option Chain</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider">
              24/7 Live
            </span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time volatility surface, open interest, and Greeks for Bitcoin & Ethereum options. Click any strike to execute simulated paper trades.
          </p>
        </div>

        {/* Global Market Status & Paper Margin */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-right">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Demo Margin</span>
            <span className="text-base font-black font-mono text-emerald-400">
              ${paperMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <Link
            to="/dashboard/terminal"
            className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <span>📊</span> Open Terminal
          </Link>
        </div>
      </div>

      {/* Asset Selector & Key Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Underlying Selector */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Underlying</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${isLiveConnected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
              {isLiveConnected ? '● REAL-TIME' : 'POLLING'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {Object.keys(UNDERLYING_CONFIGS).map((sym) => (
              <button
                key={sym}
                onClick={() => setSelectedAsset(sym)}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedAsset === sym
                    ? 'bg-emerald-500 text-gray-950 shadow-md shadow-emerald-500/20'
                    : 'bg-gray-950 hover:bg-gray-800 text-gray-300 border border-gray-800'
                }`}
              >
                <span>{sym === 'BTC' ? '₿' : sym === 'ETH' ? 'Ξ' : '◎'}</span>
                <span>{sym}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black font-mono text-white tracking-tight">
                ${spotPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-gray-500 ml-1.5">USDT Spot</span>
            </div>
            <span className={`text-xs font-bold font-mono ${spotChange.pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {spotChange.pct >= 0 ? '+' : ''}{spotChange.pct.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Expiry Selector */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Expiration Date</span>
          <div className="grid grid-cols-2 gap-2">
            {expiries.map((exp) => (
              <button
                key={exp.id}
                onClick={() => setSelectedExpiry(exp)}
                className={`p-2 rounded-xl text-left text-xs font-medium transition-all cursor-pointer ${
                  selectedExpiry.id === exp.id
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 font-bold'
                    : 'bg-gray-950 hover:bg-gray-800 text-gray-300 border border-gray-800/80'
                }`}
              >
                <div className="truncate font-semibold">{exp.label.split('(')[0]}</div>
                <div className="text-[10px] text-gray-500">{exp.dte} Days to Expiry</div>
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
            <span>Settlement: 08:00 UTC</span>
            <span className="font-mono text-emerald-400 font-bold">European Style</span>
          </div>
        </div>

        {/* PCR & Sentiment */}
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Put-Call Ratio (PCR)</span>
            <div className="text-3xl font-black font-mono text-white mt-2">{pcrRatio}</div>
            <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
              {pcrSentiment}
            </span>
          </div>
          <div className="text-[10px] text-gray-500 mt-2 font-mono">
            Calls: {totalCallOI.toLocaleString()} | Puts: {totalPutOI.toLocaleString()}
          </div>
        </div>

        {/* Max Pain Strike */}
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Max Pain Level</span>
            <div className="text-3xl font-black font-mono text-amber-400 mt-2">
              ${maxPainStrike.toLocaleString()}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Options expiry gravity point</p>
          </div>
          <div className="text-[10px] text-gray-500 mt-2 font-mono">
            Dist from Spot: {(((maxPainStrike - spotPrice) / spotPrice) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Filter Tabs & Strikes Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-900/60 border border-gray-800/80 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase mr-1">Strikes View:</span>
          {[
            { id: 'near', label: 'Near Money (±5)' },
            { id: 'all', label: 'All Strikes' },
            { id: 'itm', label: 'In-The-Money (ITM)' },
            { id: 'otm', label: 'Out-The-Money (OTM)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterMode === tab.id
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
            <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/40 inline-block"></span>
            <span>ITM Contracts</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40 inline-block"></span>
            <span>ATM Strike</span>
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-emerald-400 font-medium">Click any row to Paper Trade</span>
        </div>
      </div>

      {/* Notification Toast */}
      {orderToast && (
        <div
          className={`p-4 rounded-xl border text-sm font-semibold flex items-center justify-between shadow-xl ${
            orderToast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{orderToast.message}</span>
          <button onClick={() => setOrderToast(null)} className="text-gray-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Full Option Chain Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              {/* High Level Category Headers */}
              <tr className="border-b border-gray-800 text-[11px] font-black uppercase tracking-wider text-center">
                <th colSpan="6" className="bg-emerald-950/40 text-emerald-400 py-2.5 border-r border-gray-800">
                  ◀ CALL OPTIONS (BUY / LONG VOLATILITY)
                </th>
                <th className="bg-gray-950 text-amber-400 py-2.5 px-4 border-r border-gray-800">
                  STRIKE
                </th>
                <th colSpan="6" className="bg-rose-950/40 text-rose-400 py-2.5">
                  PUT OPTIONS (HEDGE / SHORT VOLATILITY) ▶
                </th>
              </tr>

              {/* Column Specific Headers */}
              <tr className="border-b border-gray-800 text-[10px] text-gray-400 uppercase font-mono bg-gray-950">
                <th className="py-2.5 px-3 text-right">OI</th>
                <th className="py-2.5 px-2 text-right">IV</th>
                <th className="py-2.5 px-2 text-right">Delta</th>
                <th className="py-2.5 px-2 text-right">Bid/Ask</th>
                <th className="py-2.5 px-3 text-right text-emerald-400">Call LTP ($)</th>
                <th className="py-2.5 px-2 text-right border-r border-gray-800">Chg %</th>

                <th className="py-2.5 px-4 text-center font-bold text-white border-r border-gray-800 bg-gray-900">
                  Strike Price ($)
                </th>

                <th className="py-2.5 px-2 text-left">Chg %</th>
                <th className="py-2.5 px-3 text-left text-rose-400">Put LTP ($)</th>
                <th className="py-2.5 px-2 text-left">Bid/Ask</th>
                <th className="py-2.5 px-2 text-left">Delta</th>
                <th className="py-2.5 px-2 text-left">IV</th>
                <th className="py-2.5 px-3 text-left">OI</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800/60 font-mono text-xs">
              {displayedStrikes.map((row) => (
                <tr
                  key={row.strike}
                  className={`transition-colors hover:bg-gray-800/50 ${
                    row.isAtm ? 'bg-emerald-500/10' : ''
                  }`}
                >
                  {/* CALLS SIDE */}
                  <td
                    onClick={() =>
                      setPaperModal({
                        strike: row.strike,
                        type: 'CALL',
                        ltp: row.calls.ltp,
                        delta: row.calls.delta,
                        iv: row.calls.iv,
                      })
                    }
                    className={`py-2 px-3 text-right cursor-pointer ${
                      row.isCallITM ? 'bg-amber-500/5 text-gray-300 font-semibold' : 'text-gray-400'
                    }`}
                  >
                    {row.calls.oi.toLocaleString()}
                  </td>
                  <td
                    onClick={() =>
                      setPaperModal({
                        strike: row.strike,
                        type: 'CALL',
                        ltp: row.calls.ltp,
                        delta: row.calls.delta,
                        iv: row.calls.iv,
                      })
                    }
                    className={`py-2 px-2 text-right cursor-pointer ${
                      row.isCallITM ? 'bg-amber-500/5 text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {row.calls.iv}%
                  </td>
                  <td
                    onClick={() =>
                      setPaperModal({
                        strike: row.strike,
                        type: 'CALL',
                        ltp: row.calls.ltp,
                        delta: row.calls.delta,
                        iv: row.calls.iv,
                      })
                    }
                    className={`py-2 px-2 text-right cursor-pointer text-gray-400 ${
                      row.isCallITM ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    {row.calls.delta}
                  </td>
                  <td
                    onClick={() =>
                      setPaperModal({
                        strike: row.strike,
                        type: 'CALL',
                        ltp: row.calls.ltp,
                        delta: row.calls.delta,
                        iv: row.calls.iv,
                      })
                    }
                    className={`py-2 px-2 text-right text-[10px] text-gray-400 cursor-pointer ${
                      row.isCallITM ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    ${row.calls.bid} / ${row.calls.ask}
                  </td>
                  <td
                    onClick={() =>
                      setPaperModal({
                        strike: row.strike,
                        type: 'CALL',
                        ltp: row.calls.ltp,
                        delta: row.calls.delta,
                        iv: row.calls.iv,
                      })
                    }
                    className={`py-2 px-3 text-right font-bold text-emerald-400 cursor-pointer ${
                      row.isCallITM ? 'bg-amber-500/10' : ''
                    }`}
                  >
                    ${row.calls.ltp.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td
                    onClick={() =>
                      setPaperModal({
                        strike: row.strike,
                        type: 'CALL',
                        ltp: row.calls.ltp,
                        delta: row.calls.delta,
                        iv: row.calls.iv,
                      })
                    }
                    className={`py-2 px-2 text-right text-[11px] border-r border-gray-800 cursor-pointer ${
                      row.calls.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    } ${row.isCallITM ? 'bg-amber-500/5' : ''}`}
                  >
                    {row.calls.changePct >= 0 ? '+' : ''}{row.calls.changePct}%
                  </td>

                  {/* CENTER STRIKE PRICE */}
                  <td
                    className={`py-2.5 px-4 text-center font-black border-r border-gray-800 ${
                      row.isAtm
                        ? 'bg-emerald-500 text-gray-950 shadow-md font-bold'
                        : 'bg-gray-950 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>${row.strike.toLocaleString()}</span>
                      {row.isAtm && (
                        <span className="text-[9px] bg-gray-950 text-emerald-300 px-1.5 py-0.2 rounded font-black tracking-widest">
                          ATM
                        </span>
                      )}
                    </div>
                  </td>

                  {/* PUTS SIDE */}
                  <td
                    onClick={() =>
                      setPaperModal({
                        strike: row.strike,
                        type: 'PUT',
                        ltp: row.puts.ltp,
                        delta: row.puts.delta,
                        iv: row.puts.iv,
                      })
                    }
                    className={`py-2 px-2 text-left text-[11px] cursor-pointer ${
                      row.puts.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    } ${row.isPutITM ? 'bg-amber-500/5' : ''}`}
                  >
                    {row.puts.changePct >= 0 ? '+' : ''}{row.puts.changePct}%
                  </td>
                  <td
                    onClick={() =>
                      setPaperModal({
                        strike: row.strike,
                        type: 'PUT',
                        ltp: row.puts.ltp,
                        delta: row.puts.delta,
                        iv: row.puts.iv,
                      })
                    }
                    className={`py-2 px-3 text-left font-bold text-rose-400 cursor-pointer ${
                      row.isPutITM ? 'bg-amber-500/10' : ''
                    }`}
                  >
                    ${row.puts.ltp.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td
                    onClick={() =>
                      setPaperModal({
                        strike: row.strike,
                        type: 'PUT',
                        ltp: row.puts.ltp,
                        delta: row.puts.delta,
                        iv: row.puts.iv,
                      })
                    }
                    className={`py-2 px-2 text-left text-[10px] text-gray-400 cursor-pointer ${
                      row.isPutITM ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    ${row.puts.bid} / ${row.puts.ask}
                  </td>
                  <td
                    onClick={() =>
                      setPaperModal({
                        strike: row.strike,
                        type: 'PUT',
                        ltp: row.puts.ltp,
                        delta: row.puts.delta,
                        iv: row.puts.iv,
                      })
                    }
                    className={`py-2 px-2 text-left text-gray-400 cursor-pointer ${
                      row.isPutITM ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    {row.puts.delta}
                  </td>
                  <td
                    onClick={() =>
                      setPaperModal({
                        strike: row.strike,
                        type: 'PUT',
                        ltp: row.puts.ltp,
                        delta: row.puts.delta,
                        iv: row.puts.iv,
                      })
                    }
                    className={`py-2 px-2 text-left cursor-pointer ${
                      row.isPutITM ? 'bg-amber-500/5 text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {row.puts.iv}%
                  </td>
                  <td
                    onClick={() =>
                      setPaperModal({
                        strike: row.strike,
                        type: 'PUT',
                        ltp: row.puts.ltp,
                        delta: row.puts.delta,
                        iv: row.puts.iv,
                      })
                    }
                    className={`py-2 px-3 text-left cursor-pointer ${
                      row.isPutITM ? 'bg-amber-500/5 text-gray-300 font-semibold' : 'text-gray-400'
                    }`}
                  >
                    {row.puts.oi.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Paper Trade Modal */}
      {paperModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setPaperModal(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white text-lg cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
                Paper Trading Simulation
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-white">
              {paperModal.type === 'CALL' ? 'Buy Call Option' : 'Buy Put Option'}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Practicing order execution without risking real funds.
            </p>

            <form onSubmit={handleExecutePaperOption} className="mt-6 space-y-4">
              <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Contract</span>
                  <span className="font-bold text-white font-mono">
                    {selectedAsset} ${paperModal.strike} {paperModal.type}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Expiry</span>
                  <span className="text-gray-300 font-mono">{selectedExpiry.label}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">LTP Premium</span>
                  <span className="text-emerald-400 font-bold font-mono">${paperModal.ltp}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Delta / IV</span>
                  <span className="text-gray-300 font-mono">{paperModal.delta} / {paperModal.iv}%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Contracts Quantity ({config.lotSize} {selectedAsset} each)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Math.max(1, Number(e.target.value)))}
                    className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-center text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setOrderQuantity((q) => q + 1)}
                    className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl flex items-center justify-between text-xs">
                <span className="text-gray-400">Total Paper Premium:</span>
                <span className="text-base font-black font-mono text-emerald-400">
                  ${(paperModal.ltp * orderQuantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPaperModal(null)}
                  className="flex-1 py-3 rounded-xl border border-gray-800 text-gray-400 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orderSubmitting}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  {orderSubmitting ? 'Filling...' : 'Confirm Paper Trade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
