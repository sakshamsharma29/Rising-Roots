import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getGlobalMarketStatus } from '../utils/marketHours';

// Default initial asset lists
const DEFAULT_CRYPTO_ASSETS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', type: 'crypto', spot: 64520.00, change: 1120.40, changePct: 1.76, high: 65100.00, low: 63200.00, volume: '38,420 BTC', lotSize: 0.01 },
  { symbol: 'ETHUSDT', name: 'Ethereum', type: 'crypto', spot: 2655.40, change: 48.20, changePct: 1.85, high: 2690.00, low: 2580.00, volume: '240,110 ETH', lotSize: 0.1 },
  { symbol: 'SOLUSDT', name: 'Solana', type: 'crypto', spot: 154.80, change: -2.40, changePct: -1.53, high: 159.20, low: 151.00, volume: '1,420,000 SOL', lotSize: 1 },
  { symbol: 'BNBUSDT', name: 'Binance Coin', type: 'crypto', spot: 588.60, change: 8.90, changePct: 1.54, high: 595.00, low: 576.00, volume: '320,400 BNB', lotSize: 0.5 },
  { symbol: 'XRPUSDT', name: 'Ripple', type: 'crypto', spot: 0.5840, change: 0.0140, changePct: 2.45, high: 0.5980, low: 0.5650, volume: '45,000,000 XRP', lotSize: 50 },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', type: 'crypto', spot: 0.1245, change: 0.0042, changePct: 3.49, high: 0.1290, low: 0.1180, volume: '98,000,000 DOGE', lotSize: 100 },
  { symbol: 'ADAUSDT', name: 'Cardano', type: 'crypto', spot: 0.3540, change: -0.0060, changePct: -1.67, high: 0.3680, low: 0.3470, volume: '18,500,000 ADA', lotSize: 50 },
  { symbol: 'AVAXUSDT', name: 'Avalanche', type: 'crypto', spot: 28.40, change: 0.85, changePct: 3.09, high: 29.20, low: 27.10, volume: '840,000 AVAX', lotSize: 2 },
];

const DEFAULT_FOREX_ASSETS = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', type: 'forex', spot: 1.0845, change: 0.0018, changePct: 0.17, high: 1.0870, low: 1.0820, volume: 'Daily $5.1T', lotSize: 1000 },
  { symbol: 'GBP/USD', name: 'British Pound / USD', type: 'forex', spot: 1.3025, change: -0.0024, changePct: -0.18, high: 1.3065, low: 1.2990, volume: 'Daily $2.4T', lotSize: 1000 },
  { symbol: 'USD/JPY', name: 'USD / Japanese Yen', type: 'forex', spot: 153.40, change: 0.65, changePct: 0.43, high: 153.90, low: 152.60, volume: 'Daily $1.8T', lotSize: 1000 },
  { symbol: 'AUD/USD', name: 'Australian Dollar / USD', type: 'forex', spot: 0.6680, change: 0.0012, changePct: 0.18, high: 0.6710, low: 0.6650, volume: 'Daily $900B', lotSize: 1000 },
  { symbol: 'USD/CAD', name: 'USD / Canadian Dollar', type: 'forex', spot: 1.3850, change: -0.0015, changePct: -0.11, high: 1.3880, low: 1.3830, volume: 'Daily $750B', lotSize: 1000 },
  { symbol: 'USD/CHF', name: 'USD / Swiss Franc', type: 'forex', spot: 0.8650, change: 0.0008, changePct: 0.09, high: 0.8680, low: 0.8620, volume: 'Daily $520B', lotSize: 1000 },
  { symbol: 'GBP/JPY', name: 'British Pound / Yen', type: 'forex', spot: 199.80, change: 0.45, changePct: 0.23, high: 200.50, low: 199.10, volume: 'Daily $480B', lotSize: 1000 },
  { symbol: 'EUR/GBP', name: 'Euro / British Pound', type: 'forex', spot: 0.8325, change: 0.0022, changePct: 0.26, high: 0.8350, low: 0.8300, volume: 'Daily $410B', lotSize: 1000 },
];

export default function TradingTerminal() {
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
  const token = localStorage.getItem('rr_token');
  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }),
    [token]
  );

  // Global Market Status (24/7 Crypto + 24/5 Forex)
  const [marketStatus, setMarketStatus] = useState(getGlobalMarketStatus());
  useEffect(() => {
    const timer = setInterval(() => {
      setMarketStatus(getGlobalMarketStatus());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Watchlist state
  const [searchParams] = useSearchParams();
  const [cryptoAssets, setCryptoAssets] = useState(DEFAULT_CRYPTO_ASSETS);
  const [forexAssets, setForexAssets] = useState(DEFAULT_FOREX_ASSETS);
  const [activeTab, setActiveTab] = useState('crypto'); // 'crypto' | 'forex' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(DEFAULT_CRYPTO_ASSETS[0]);
  const [tickDirection, setTickDirection] = useState({});

  // Auto-select asset from URL query param if arriving from VIP Signals room
  useEffect(() => {
    const symbolParam = searchParams.get('symbol');
    if (symbolParam) {
      const cleanParam = symbolParam.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      const match = [...DEFAULT_CRYPTO_ASSETS, ...DEFAULT_FOREX_ASSETS].find(
        (a) => a.symbol.replace(/[^A-Za-z0-9]/g, '').toUpperCase() === cleanParam
      );
      if (match) {
        setSelectedAsset(match);
        setActiveTab(match.type);
      }
    }
  }, [searchParams]);

  // Chart Timeframe & Points
  const [timeframe, setTimeframe] = useState('15m');
  const [chartData, setChartData] = useState([]);

  // Paper Margin Balance ($10,000 USD virtual funds)
  const [paperMargin, setPaperMargin] = useState(() => {
    const saved = localStorage.getItem('rr_paper_margin_usd');
    return saved !== null ? Number(saved) : 10000;
  });

  const resetPaperMargin = () => {
    setPaperMargin(10000);
    localStorage.setItem('rr_paper_margin_usd', '10000');
    setOrderStatusToast({ type: 'success', message: 'Demo margin balance reset to $10,000.00 USD.' });
    setTimeout(() => setOrderStatusToast(null), 3000);
  };

  // Order Execution Form State
  const [orderSide, setOrderSide] = useState('long'); // 'long' (BUY) | 'short' (SELL)
  const [orderType, setOrderType] = useState('market'); // 'market' | 'limit'
  const [limitPrice, setLimitPrice] = useState('');
  const [quantity, setQuantity] = useState(0.1);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderStatusToast, setOrderStatusToast] = useState(null);

  // Database Trades & Positions
  const [openPositions, setOpenPositions] = useState([]);
  const [closedTrades, setClosedTrades] = useState([]);
  const [activeBottomTab, setActiveBottomTab] = useState('positions');
  const [loadingTrades, setLoadingTrades] = useState(false);

  // Combined Watchlist
  const allAssets = useMemo(() => {
    return [...cryptoAssets, ...forexAssets];
  }, [cryptoAssets, forexAssets]);

  const filteredAssets = useMemo(() => {
    let list = allAssets;
    if (activeTab === 'crypto') list = cryptoAssets;
    if (activeTab === 'forex') list = forexAssets;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q));
    }
    return list;
  }, [allAssets, cryptoAssets, forexAssets, activeTab, searchQuery]);

  // Adjust default quantity when switching between crypto and forex
  useEffect(() => {
    if (selectedAsset.type === 'crypto') {
      if (selectedAsset.symbol.startsWith('BTC')) setQuantity(0.1);
      else if (selectedAsset.symbol.startsWith('ETH')) setQuantity(1);
      else if (selectedAsset.symbol.startsWith('SOL')) setQuantity(5);
      else setQuantity(10);
    } else {
      setQuantity(1000); // Standard micro-lot in forex
    }
    if (orderType === 'limit') {
      setLimitPrice(selectedAsset.spot.toString());
    }
  }, [selectedAsset.symbol]);

  // Fetch real-time Crypto tickers from Binance Public API
  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT'];
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const data = await res.json();
        if (Array.isArray(data)) {
          const map = {};
          data.forEach((item) => {
            if (symbols.includes(item.symbol)) {
              map[item.symbol] = {
                spot: parseFloat(item.lastPrice),
                change: parseFloat(item.priceChange),
                changePct: parseFloat(item.priceChangePercent),
                high: parseFloat(item.highPrice),
                low: parseFloat(item.lowPrice),
                volume: `${Math.round(parseFloat(item.volume)).toLocaleString()} ${item.symbol.replace('USDT', '')}`,
              };
            }
          });

          setCryptoAssets((prev) =>
            prev.map((asset) => {
              const live = map[asset.symbol];
              if (!live) return asset;

              const diff = live.spot - asset.spot;
              if (diff !== 0) {
                setTickDirection((td) => ({ ...td, [asset.symbol]: diff > 0 ? 'up' : 'down' }));
              }

              return {
                ...asset,
                spot: live.spot,
                change: live.change,
                changePct: live.changePct,
                high: live.high,
                low: live.low,
                volume: live.volume,
              };
            })
          );
        }
      } catch (err) {
        // Silent fallback to standard intervals
      }
    };

    fetchCrypto();
    const interval = setInterval(fetchCrypto, 3500); // Live poll every 3.5s
    return () => clearInterval(interval);
  }, []);

  // Fetch real-time Forex exchange rates
  useEffect(() => {
    const fetchForex = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        if (data && data.rates) {
          const rates = data.rates;
          const eurusd = rates.EUR ? parseFloat((1 / rates.EUR).toFixed(4)) : 1.0845;
          const gbpusd = rates.GBP ? parseFloat((1 / rates.GBP).toFixed(4)) : 1.3025;
          const usdjpy = rates.JPY ? parseFloat(rates.JPY.toFixed(2)) : 153.40;
          const audusd = rates.AUD ? parseFloat((1 / rates.AUD).toFixed(4)) : 0.6680;
          const usdcad = rates.CAD ? parseFloat(rates.CAD.toFixed(4)) : 1.3850;
          const usdchf = rates.CHF ? parseFloat(rates.CHF.toFixed(4)) : 0.8650;
          const gbpjpy = rates.JPY && rates.GBP ? parseFloat((rates.JPY / rates.GBP).toFixed(2)) : 199.80;
          const eurgbp = rates.EUR && rates.GBP ? parseFloat((rates.GBP / rates.EUR).toFixed(4)) : 0.8325;

          const forexMap = {
            'EUR/USD': eurusd,
            'GBP/USD': gbpusd,
            'USD/JPY': usdjpy,
            'AUD/USD': audusd,
            'USD/CAD': usdcad,
            'USD/CHF': usdchf,
            'GBP/JPY': gbpjpy,
            'EUR/GBP': eurgbp,
          };

          setForexAssets((prev) =>
            prev.map((asset) => {
              const newSpot = forexMap[asset.symbol];
              if (!newSpot) return asset;
              const diff = parseFloat((newSpot - asset.spot).toFixed(4));
              return {
                ...asset,
                spot: newSpot,
                change: diff,
                changePct: parseFloat(((diff / asset.spot) * 100).toFixed(2)),
              };
            })
          );
        }
      } catch (err) {}
    };

    fetchForex();
    const interval = setInterval(fetchForex, 15000); // Forex rates update every 15s
    return () => clearInterval(interval);
  }, []);

  // Update selected asset reference when watchlist refreshes
  useEffect(() => {
    const updated = allAssets.find((a) => a.symbol === selectedAsset.symbol);
    if (updated && updated.spot !== selectedAsset.spot) {
      setSelectedAsset(updated);
    }
  }, [allAssets, selectedAsset.symbol]);

  // Generate interactive chart data based on spot price
  useEffect(() => {
    const base = selectedAsset.spot;
    const points = [];
    let current = base * 0.985;
    for (let i = 0; i < 30; i++) {
      const delta = (Math.sin(i * 0.45) * (base * 0.003)) + ((Math.random() - 0.48) * (base * 0.002));
      current = current + delta;
      points.push({
        idx: i,
        price: parseFloat(current.toFixed(selectedAsset.type === 'crypto' && base > 10 ? 2 : 4)),
      });
    }
    points.push({ idx: 30, price: selectedAsset.spot });
    setChartData(points);
  }, [selectedAsset.symbol]);

  // Margin Required calculation for order form
  const totalMarginRequired = useMemo(() => {
    const execPrice = orderType === 'limit' && limitPrice ? Number(limitPrice) : selectedAsset.spot;
    if (selectedAsset.type === 'forex') {
      // 1:50 leverage standard for paper forex trading
      return parseFloat(((execPrice * Number(quantity)) / 50).toFixed(2));
    }
    // Spot crypto (1:1 paper margin or 1:5)
    return parseFloat((execPrice * Number(quantity)).toFixed(2));
  }, [selectedAsset, orderType, limitPrice, quantity]);

  // Fetch real trades from MongoDB
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

  // Real-time floating P&L calculation for an open position
  const calculatePositionMetrics = (pos) => {
    const match = allAssets.find((a) => a.symbol === pos.symbol) || { spot: pos.entryPrice };
    const currentPrice = match.spot;
    const isLong = pos.tradeType === 'long';
    const priceDiff = isLong ? currentPrice - pos.entryPrice : pos.entryPrice - currentPrice;
    const pnl = parseFloat((priceDiff * pos.quantity).toFixed(2));
    const pnlPercent = parseFloat(((priceDiff / pos.entryPrice) * 100).toFixed(2));

    return { currentPrice, pnl, pnlPercent };
  };

  // Place Paper Order
  const handleExecuteOrder = async (e) => {
    e.preventDefault();
    if (orderSubmitting) return;

    if (paperMargin < totalMarginRequired) {
      setOrderStatusToast({
        type: 'error',
        message: `Insufficient Margin! Required: $${totalMarginRequired.toLocaleString()}, Available: $${paperMargin.toLocaleString()}`,
      });
      setTimeout(() => setOrderStatusToast(null), 4000);
      return;
    }

    setOrderSubmitting(true);

    const execPrice = orderType === 'limit' && limitPrice ? Number(limitPrice) : selectedAsset.spot;

    const payload = {
      symbol: selectedAsset.symbol,
      assetType: selectedAsset.type,
      tradeType: orderSide,
      entryPrice: execPrice,
      quantity: Number(quantity),
      stopLoss: stopLoss ? Number(stopLoss) : null,
      target: takeProfit ? Number(takeProfit) : null,
      notes: `Paper execution on ${selectedAsset.type.toUpperCase()}`,
      tags: ['paper-trade', selectedAsset.type, orderSide],
    };

    try {
      const res = await fetch(`${API_URL}/api/trades`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        const newMargin = Math.max(0, paperMargin - totalMarginRequired);
        setPaperMargin(newMargin);
        localStorage.setItem('rr_paper_margin_usd', newMargin.toString());

        setOrderStatusToast({
          type: 'success',
          message: `Paper Order Filled! ${orderSide.toUpperCase()} ${quantity} ${selectedAsset.symbol} @ $${execPrice}`,
        });
        fetchTrades();
      } else {
        setOrderStatusToast({
          type: 'error',
          message: data.message || 'Failed to place paper order.',
        });
      }
    } catch (err) {
      setOrderStatusToast({ type: 'error', message: 'Network error executing order.' });
    } finally {
      setOrderSubmitting(false);
      setTimeout(() => setOrderStatusToast(null), 4500);
    }
  };

  // Square Off / Close Open Position
  const handleSquareOff = async (position) => {
    const metrics = calculatePositionMetrics(position);
    try {
      const res = await fetch(`${API_URL}/api/trades/${position.id || position._id}/close`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ exitPrice: metrics.currentPrice }),
      });
      const data = await res.json();

      if (data.success) {
        // Return margin + realized P&L
        const returnedCapital = (position.entryPrice * position.quantity) + metrics.pnl;
        const newMargin = Math.max(0, paperMargin + returnedCapital);
        setPaperMargin(newMargin);
        localStorage.setItem('rr_paper_margin_usd', newMargin.toString());

        setOrderStatusToast({
          type: 'success',
          message: `Closed ${position.symbol}! Realized P&L: ${metrics.pnl >= 0 ? '+$' : '-$'}${Math.abs(metrics.pnl)}`,
        });
        fetchTrades();
      } else {
        setOrderStatusToast({ type: 'error', message: data.message || 'Square-off failed.' });
      }
    } catch (err) {
      setOrderStatusToast({ type: 'error', message: 'Failed to square off position.' });
    } finally {
      setTimeout(() => setOrderStatusToast(null), 4500);
    }
  };

  // Chart SVG path generator
  const minPrice = chartData.length > 0 ? Math.min(...chartData.map((d) => d.price)) : 0;
  const maxPrice = chartData.length > 0 ? Math.max(...chartData.map((d) => d.price)) : 1;
  const range = maxPrice - minPrice || 1;

  const chartPoints = chartData
    .map((d, i) => {
      const x = (i / (chartData.length - 1)) * 600;
      const y = 200 - ((d.price - minPrice) / range) * 160 - 20;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner: Global Market Sessions & Option Chain Link */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xl shrink-0">
            ⚡
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-sm text-white">CRYPTO 24/7 LIVE</span>
              <span className="text-gray-600">•</span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${marketStatus.forex.badgeClass}`}>
                {marketStatus.forex.statusText}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              UTC Clock: {marketStatus.utcTimeString} | Local: {marketStatus.localTimeString}
            </p>
          </div>
        </div>

        {/* Paper Margin and Option Chain quick CTA */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          <div className="bg-gray-950 border border-gray-800 px-4 py-2 rounded-xl flex items-center gap-3">
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold block">Paper Demo Balance</span>
              <span className="text-base font-black font-mono text-emerald-400">
                ${paperMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <button
              onClick={resetPaperMargin}
              title="Reset balance to $10,000"
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded cursor-pointer transition-colors"
            >
              Reset
            </button>
          </div>

          <Link
            to="/dashboard/options"
            className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <span>📈</span> Crypto Option Chain
          </Link>
        </div>
      </div>

      {/* Main Terminal Grid: Watchlist (Left) + Chart & Ticket (Center/Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Watchlist (4 Cols) */}
        <div className="lg:col-span-4 bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col h-[700px]">
          {/* Watchlist Category Tabs */}
          <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-3">
            <div className="flex items-center gap-1">
              {[
                { id: 'crypto', label: 'Crypto (24/7)' },
                { id: 'forex', label: 'Forex (24/5)' },
                { id: 'all', label: 'All' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-emerald-500 text-gray-950 shadow'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-[10px] font-mono text-emerald-400 font-bold">LIVE TICKS</span>
          </div>

          {/* Search bar */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search BTC, ETH, EUR/USD..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Asset List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-gray-800/40">
            {filteredAssets.map((asset) => {
              const isSelected = selectedAsset.symbol === asset.symbol;
              const tick = tickDirection[asset.symbol];

              return (
                <div
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset)}
                  className={`pt-2 p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-500/10 border border-emerald-500/30'
                      : 'hover:bg-gray-800/50 border border-transparent'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white font-mono">{asset.symbol}</span>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-gray-800 text-gray-400">
                        {asset.type}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 truncate block mt-0.5">{asset.name}</span>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-sm font-black font-mono transition-colors ${
                        tick === 'up'
                          ? 'text-emerald-400'
                          : tick === 'down'
                          ? 'text-rose-400'
                          : 'text-white'
                      }`}
                    >
                      ${asset.spot >= 10 ? asset.spot.toLocaleString('en-US', { minimumFractionDigits: 2 }) : asset.spot}
                    </div>
                    <span
                      className={`text-xs font-mono font-bold ${
                        asset.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {asset.changePct >= 0 ? '+' : ''}{asset.changePct.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER & RIGHT COLUMN: Chart & Order Ticket (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Price Header & Chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-white font-mono">{selectedAsset.symbol}</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold uppercase">
                    {selectedAsset.type}
                  </span>
                  <span className="text-xs text-gray-400">{selectedAsset.name}</span>
                </div>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl font-black font-mono text-white">
                    ${selectedAsset.spot >= 10 ? selectedAsset.spot.toLocaleString('en-US', { minimumFractionDigits: 2 }) : selectedAsset.spot}
                  </span>
                  <span className={`text-sm font-bold font-mono ${selectedAsset.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedAsset.changePct >= 0 ? '+' : ''}{selectedAsset.changePct.toFixed(2)}% (${selectedAsset.change})
                  </span>
                </div>
              </div>

              {/* Timeframe selector */}
              <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-xl border border-gray-800 self-start sm:self-auto">
                {['1m', '5m', '15m', '1h', '1D'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                      timeframe === tf
                        ? 'bg-emerald-500 text-gray-950'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Live Sparkline / Waveform Chart */}
            <div className="mt-4 relative h-56 w-full bg-gray-950/60 rounded-xl border border-gray-800/80 p-2 overflow-hidden flex items-end">
              <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Area fill */}
                {chartPoints && (
                  <polygon
                    points={`0,200 ${chartPoints} 600,200`}
                    fill="url(#chartGrad)"
                  />
                )}
                {/* Stroke line */}
                {chartPoints && (
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    points={chartPoints}
                  />
                )}
              </svg>

              <div className="absolute top-3 left-4 text-[10px] font-mono text-gray-400">
                High: ${maxPrice.toLocaleString()} | Low: ${minPrice.toLocaleString()}
              </div>
              <div className="absolute bottom-3 right-4 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Real-Time Stream Active</span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
              <div className="bg-gray-950 border border-gray-800 p-2.5 rounded-xl">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">24h High</span>
                <span className="font-mono font-bold text-white">${selectedAsset.high || selectedAsset.spot * 1.02}</span>
              </div>
              <div className="bg-gray-950 border border-gray-800 p-2.5 rounded-xl">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">24h Low</span>
                <span className="font-mono font-bold text-white">${selectedAsset.low || selectedAsset.spot * 0.98}</span>
              </div>
              <div className="bg-gray-950 border border-gray-800 p-2.5 rounded-xl">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">24h Volume</span>
                <span className="font-mono font-bold text-white">{selectedAsset.volume || 'Active'}</span>
              </div>
              <div className="bg-gray-950 border border-gray-800 p-2.5 rounded-xl">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Leverage/Lot</span>
                <span className="font-mono font-bold text-emerald-400">
                  {selectedAsset.type === 'forex' ? '1:50 Margin' : 'Spot 1:1'}
                </span>
              </div>
            </div>
          </div>

          {/* Paper Order Ticket Execution Form */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="text-base font-extrabold text-white">Paper Order Execution</h3>
              </div>
              <span className="text-xs font-mono text-gray-400">
                Demo Margin: <strong className="text-emerald-400 font-bold">${paperMargin.toLocaleString()}</strong>
              </span>
            </div>

            <form onSubmit={handleExecuteOrder} className="space-y-4">
              {/* Buy / Sell Tabs */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderSide('long')}
                  className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    orderSide === 'long'
                      ? 'bg-emerald-500 text-gray-950 shadow-md shadow-emerald-500/20'
                      : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setOrderSide('short')}
                  className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    orderSide === 'short'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  SELL / SHORT
                </button>
              </div>

              {/* Order Type: Market / Limit */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Order Type</label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="market">Market Order</option>
                    <option value="limit">Limit Order</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                    {orderType === 'limit' ? 'Limit Price ($)' : 'Execution Price ($)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    disabled={orderType === 'market'}
                    value={orderType === 'market' ? selectedAsset.spot : limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    step="any"
                    min="0.001"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Required Margin</label>
                  <div className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 font-bold">
                    ${totalMarginRequired.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* SL / TP targets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Stop Loss ($) (Optional)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 62000"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Take Profit ($) (Optional)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 68000"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={orderSubmitting}
                className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg disabled:opacity-50 ${
                  orderSide === 'long'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-gray-950 shadow-emerald-500/20'
                    : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                }`}
              >
                {orderSubmitting
                  ? 'Executing Paper Order...'
                  : `Place Paper ${orderSide.toUpperCase()} Order (${selectedAsset.symbol})`}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {orderStatusToast && (
        <div
          className={`p-4 rounded-xl border text-sm font-semibold flex items-center justify-between shadow-xl ${
            orderStatusToast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{orderStatusToast.message}</span>
          <button onClick={() => setOrderStatusToast(null)} className="text-gray-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* BOTTOM SECTION: Real Database Positions & Trade History */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveBottomTab('positions')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeBottomTab === 'positions'
                  ? 'bg-emerald-500 text-gray-950 shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Open Paper Positions ({openPositions.length})
            </button>
            <button
              onClick={() => setActiveBottomTab('history')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeBottomTab === 'history'
                  ? 'bg-emerald-500 text-gray-950 shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Trade History ({closedTrades.length})
            </button>
          </div>

          <button
            onClick={fetchTrades}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <span>🔄</span> Refresh
          </button>
        </div>

        <div className="p-6">
          {activeBottomTab === 'positions' ? (
            openPositions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs">
                <span className="text-3xl block mb-2">📋</span>
                No open paper positions. Place an order above or click any strike on the Option Chain to trade!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-[10px] text-gray-500 uppercase font-mono">
                      <th className="py-2.5 px-3">Symbol</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Side</th>
                      <th className="py-2.5 px-3">Qty</th>
                      <th className="py-2.5 px-3 text-right">Entry Price</th>
                      <th className="py-2.5 px-3 text-right">Current Price</th>
                      <th className="py-2.5 px-3 text-right">Floating P&L</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-mono text-xs">
                    {openPositions.map((pos) => {
                      const metrics = calculatePositionMetrics(pos);
                      return (
                        <tr key={pos.id || pos._id} className="hover:bg-gray-800/40">
                          <td className="py-3 px-3 font-bold text-white">{pos.symbol}</td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-gray-800 text-gray-300">
                              {pos.assetType}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
                                pos.tradeType === 'long'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {pos.tradeType}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-gray-300">{pos.quantity}</td>
                          <td className="py-3 px-3 text-right text-gray-300">
                            ${pos.entryPrice.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right text-white font-bold">
                            ${metrics.currentPrice.toLocaleString()}
                          </td>
                          <td
                            className={`py-3 px-3 text-right font-bold ${
                              metrics.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {metrics.pnl >= 0 ? '+$' : '-$'}{Math.abs(metrics.pnl).toLocaleString()} ({metrics.pnlPercent}%)
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleSquareOff(pos)}
                              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
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
            )
          ) : closedTrades.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs">
              <span className="text-3xl block mb-2">📦</span>
              No closed paper trades in history yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-[10px] text-gray-500 uppercase font-mono">
                    <th className="py-2.5 px-3">Symbol</th>
                    <th className="py-2.5 px-3">Side</th>
                    <th className="py-2.5 px-3 text-right">Entry</th>
                    <th className="py-2.5 px-3 text-right">Exit</th>
                    <th className="py-2.5 px-3 text-right">Realized P&L</th>
                    <th className="py-2.5 px-3 text-center">Outcome</th>
                    <th className="py-2.5 px-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-mono text-xs">
                  {closedTrades.map((t) => (
                    <tr key={t.id || t._id} className="hover:bg-gray-800/40">
                      <td className="py-3 px-3 font-bold text-white">{t.symbol}</td>
                      <td className="py-3 px-3 uppercase text-gray-400">{t.tradeType}</td>
                      <td className="py-3 px-3 text-right text-gray-300">${t.entryPrice?.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-gray-300">${t.exitPrice?.toLocaleString()}</td>
                      <td
                        className={`py-3 px-3 text-right font-bold ${
                          (t.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {(t.pnl || 0) >= 0 ? '+$' : '-$'}{Math.abs(t.pnl || 0).toLocaleString()} ({t.pnlPercent}%)
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            t.outcome === 'win'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {t.outcome || 'closed'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-gray-500 text-[11px]">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
