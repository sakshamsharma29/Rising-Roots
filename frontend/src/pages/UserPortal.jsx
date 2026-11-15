import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import CheckoutModal from '../components/CheckoutModal';
import { getGlobalMarketStatus } from '../utils/marketHours';

function UserPortal() {
  const user = JSON.parse(localStorage.getItem('rr_auth') || '{}');
  const [memberInfo, setMemberInfo] = useState({
    plan: user.plan || 'Pro Trader',
    status: user.status || 'Active',
    daysRemaining: 30,
  });
  const [checkoutPlan, setCheckoutPlan] = useState(null);

  // Global Market Hours status (24/7 Crypto + 24/5 Forex)
  const [marketStatus, setMarketStatus] = useState(getGlobalMarketStatus());
  useEffect(() => {
    const timer = setInterval(() => {
      setMarketStatus(getGlobalMarketStatus());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Paper Demo Balance
  const [paperMargin] = useState(() => {
    const saved = localStorage.getItem('rr_paper_margin_usd');
    return saved !== null ? Number(saved) : 10000;
  });

  // ONLY real signals/trades from MongoDB
  const [signals, setSignals] = useState([]);
  const [loadingSignals, setLoadingSignals] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
  const token = localStorage.getItem('rr_token');
  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }),
    [token]
  );

  useEffect(() => {
    if (!token) return;

    // Fetch user member status
    fetch(`${API_URL}/api/auth/me`, { headers })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.user) {
          fetch(`${API_URL}/api/members?search=${encodeURIComponent(resData.user.email)}`, { headers })
            .then((mRes) => mRes.json())
            .then((mData) => {
              if (mData.success && mData.data && mData.data.length > 0) {
                setMemberInfo(mData.data[0]);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});

    // Fetch real trades/signals from database
    fetch(`${API_URL}/api/trades`, { headers })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          setSignals(resData.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSignals(false));
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Real-time Global Market Session & Quick Terminal Nav */}
      <div className="border border-emerald-500/30 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-500/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm uppercase tracking-wide text-white">
                CRYPTO 24/7 LIVE • {marketStatus.forex.statusText}
              </h3>
              <span className="text-[10px] font-mono text-gray-400">
                ({marketStatus.utcTimeString})
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Continuous live streams for Bitcoin, Ethereum, and Forex. Simulated $10,000 paper trading active.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/options"
            className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-black px-4 py-2.5 rounded-xl text-xs whitespace-nowrap cursor-pointer transition-all shadow-lg shadow-amber-500/20"
          >
            Option Chain →
          </Link>
          <Link
            to="/dashboard/terminal"
            className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black px-4 py-2.5 rounded-xl text-xs whitespace-nowrap cursor-pointer transition-all shadow-lg shadow-emerald-500/20"
          >
            Trading Terminal →
          </Link>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 border border-gray-800 p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold border border-green-500/20 mb-3">
            ⭐ Subscriber Member Portal
          </span>
          <h1 className="text-3xl font-extrabold text-white">Welcome back, {user.name || 'Trader'}!</h1>
          <p className="text-gray-400 text-sm mt-1">
            Access your 24/7 crypto option chains, live price feeds, and Telegram VIP channel.
          </p>
        </div>

        <a
          href="https://t.me/+RisingRootsVIP_Official"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-green-500/20 flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.05-.49-.83-.27-1.49-.42-1.43-.89.03-.25.38-.51 1.07-.78 4.2-1.83 7-3.04 8.4-3.63 4-.17 4.83.68 4.88 2.27z"/>
          </svg>
          Join Telegram VIP Channel
        </a>
      </div>

      {/* Subscription Status & Demo Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Plan</p>
            <h3 className="text-2xl font-bold text-white mt-2">{memberInfo.plan || 'Pro Trader'}</h3>
            <p className="text-xs text-green-400 font-medium mt-1">$79 / month (₹6,499)</p>
          </div>
          <button
            onClick={() =>
              setCheckoutPlan({
                id: 'pro',
                name: memberInfo.plan || 'Pro Trader Desk',
                price: '$79',
              })
            }
            className="mt-4 inline-block text-center bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-xl text-xs border border-gray-700 transition-colors cursor-pointer"
          >
            Upgrade / Renew Plan
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Paper Demo Balance</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <h3 className="text-2xl font-black font-mono text-emerald-400">
                ${paperMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Virtual Margin for risk-free Crypto & Forex simulation
            </p>
          </div>
          <Link
            to="/dashboard/terminal"
            className="mt-4 inline-block text-center bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Trade With Demo Balance →
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Option Chain Tools</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-2">BTC & ETH</h3>
            <p className="text-xs text-gray-400 font-medium mt-1">
              Live Greeks, Delta, IV & Max Pain
            </p>
          </div>
          <Link
            to="/dashboard/options"
            className="mt-4 inline-block text-center bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Open Option Chain →
          </Link>
        </div>
      </div>

      {/* Verified Real Trading Signals Feed (ONLY Real Database Records) */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Live Trading Signals & Paper Records</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Verified Crypto, Forex, and Options trade ideas and paper executions stored in MongoDB.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            24/7 Live Stream
          </span>
        </div>

        {signals.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-2 border border-gray-800/60 rounded-xl bg-gray-950/60">
            <span className="text-3xl block">📡</span>
            <p className="text-sm font-medium text-gray-300">
              No paper trades or signals recorded yet.
            </p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Place a simulated trade on the Trading Terminal or click any Call/Put strike on the Option Chain to generate your first live record!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {signals.map((sig) => (
              <div
                key={sig.id}
                className="bg-gray-950 border border-gray-800/80 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-lg font-extrabold text-white">
                      {sig.symbol}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        sig.exitPrice
                          ? sig.outcome === 'win'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {sig.exitPrice
                        ? `CLOSED (${sig.outcome?.toUpperCase()})`
                        : `${sig.tradeType?.toUpperCase()} ACTIVE`}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-gray-400 flex-wrap font-mono">
                    <span>Entry: <strong className="text-gray-200">${sig.entryPrice}</strong></span>
                    {sig.target && (
                      <span>Target: <strong className="text-green-400 font-bold">${sig.target}</strong></span>
                    )}
                    {sig.stopLoss && (
                      <span>Stoploss: <strong className="text-rose-400 font-bold">${sig.stopLoss}</strong></span>
                    )}
                    {sig.exitPrice && (
                      <span>Exit: <strong className="text-white font-bold">${sig.exitPrice}</strong></span>
                    )}
                    {sig.pnl !== undefined && sig.exitPrice && (
                      <span>
                        P&L:{' '}
                        <strong
                          className={sig.pnl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}
                        >
                          {sig.pnl >= 0 ? '+' : ''}${sig.pnl.toLocaleString()}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500 font-medium self-end md:self-center font-mono">
                  {sig.createdAt ? new Date(sig.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Realistic Checkout Modal when triggered */}
      {checkoutPlan && (
        <CheckoutModal
          plan={checkoutPlan}
          initialPromo="ROOTS20"
          onClose={() => setCheckoutPlan(null)}
        />
      )}
    </div>
  );
}

export default UserPortal;
