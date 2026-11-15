import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import CheckoutModal from '../components/CheckoutModal';
import { getIndianMarketStatus } from '../utils/marketHours';

function UserPortal() {
  const user = JSON.parse(localStorage.getItem('rr_auth') || '{}');
  const [memberInfo, setMemberInfo] = useState({
    plan: user.plan || 'Pro Trader',
    status: user.status || 'Active',
    daysRemaining: 30,
  });
  const [checkoutPlan, setCheckoutPlan] = useState(null);

  // Real Market Hours status
  const [marketStatus, setMarketStatus] = useState(getIndianMarketStatus());
  useEffect(() => {
    const timer = setInterval(() => {
      setMarketStatus(getIndianMarketStatus());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ONLY real signals/trades from MongoDB
  const [signals, setSignals] = useState([]);
  const [loadingSignals, setLoadingSignals] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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
    <div className="space-y-8 max-w-5xl">
      {/* 🏛️ Real-time Market Session & Hours Notice */}
      <div
        className={`border rounded-2xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg ${
          marketStatus.isOpen
            ? 'bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 border-emerald-500/30 shadow-emerald-500/5'
            : 'bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 border-amber-500/30 shadow-amber-500/5'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 border ${
              marketStatus.isOpen
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}
          >
            {marketStatus.isOpen ? '⚡' : '🏛️'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm uppercase tracking-wide text-white">
                {marketStatus.statusText}
              </h3>
              <span className="text-[10px] font-mono text-gray-400">
                {marketStatus.istTimeString}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {marketStatus.isOpen
                ? 'Live NSE/BSE Trading Session Active. Real-time executions are in progress.'
                : `Indian Stock Markets are closed (${marketStatus.currentDayName}). Hours: ${marketStatus.timingLabel}. Trading resumes Monday at 09:15 AM IST.`}
            </p>
          </div>
        </div>
        <Link
          to="/dashboard/terminal"
          className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black px-5 py-2.5 rounded-xl text-xs whitespace-nowrap cursor-pointer transition-all shadow-lg shadow-emerald-500/20"
        >
          Open Trading Terminal →
        </Link>
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 border border-gray-800 p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold border border-green-500/20 mb-3">
            ⭐ Subscriber Member Portal
          </span>
          <h1 className="text-3xl font-extrabold text-white">Welcome back, {user.name || 'Trader'}!</h1>
          <p className="text-gray-400 text-sm mt-1">
            Access your verified trading signals, VIP Telegram channel, and membership status.
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

      {/* Subscription Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Plan</p>
            <h3 className="text-2xl font-bold text-white mt-2">{memberInfo.plan || 'Pro Trader'}</h3>
            <p className="text-xs text-green-400 font-medium mt-1">₹2,499 / month</p>
          </div>
          <button
            onClick={() =>
              setCheckoutPlan({
                id: 'pro',
                name: memberInfo.plan || 'Pro Trader Desk',
                price: '₹2,499',
              })
            }
            className="mt-4 inline-block text-center bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-xl text-xs border border-gray-700 transition-colors cursor-pointer"
          >
            Upgrade / Renew Plan
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Membership Status</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-3 h-3 rounded-full ${memberInfo.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
              <h3 className={`text-2xl font-bold ${memberInfo.status === 'Active' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {memberInfo.status || 'Active Access'}
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {memberInfo.status === 'Active'
                ? `Renews in ${memberInfo.daysRemaining !== undefined ? memberInfo.daysRemaining : 30} days`
                : 'Subscription Expired'}
            </p>
          </div>
          {memberInfo.status !== 'Active' && (
            <button
              onClick={() =>
                setCheckoutPlan({
                  id: 'pro',
                  name: 'Pro Trader Desk',
                  price: '₹2,499',
                })
              }
              className="mt-4 inline-block text-center bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Reactivate Access Now
            </button>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Telegram Signals Status</p>
            <h3 className="text-2xl font-bold text-white mt-2">{memberInfo.status === 'Active' ? 'Connected' : 'Revoked'}</h3>
            <p className="text-xs text-blue-400 font-medium mt-1">
              {memberInfo.status === 'Active' ? 'Auto-sync enabled' : 'Renewal required'}
            </p>
          </div>
          <div className="text-[11px] text-gray-500 font-mono mt-4">
            Bot: @RisingRootsBot ✓
          </div>
        </div>
      </div>

      {/* Verified Real Trading Signals Feed (ONLY Real Database Records) */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Live Trading Signals Feed</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Verified Call/Put options trade ideas published by desk analysts.
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border ${
              marketStatus.isOpen
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                marketStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            ></span>
            {marketStatus.isOpen ? 'Live Stream Active' : 'Session Paused (Weekend)'}
          </span>
        </div>

        {signals.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-2 border border-gray-800/60 rounded-xl bg-gray-950/60">
            <span className="text-3xl block">📡</span>
            <p className="text-sm font-medium text-gray-300">
              {marketStatus.isOpen
                ? 'No active signals broadcasted yet.'
                : `Market is closed (${marketStatus.currentDayName}). Signal broadcasts are paused.`}
            </p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Real-time options and momentum calls are broadcasted live during market hours (Monday to Friday, 09:15 AM – 03:40 PM IST).
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
                    <span>Entry: <strong className="text-gray-200">₹{sig.entryPrice}</strong></span>
                    {sig.target && (
                      <span>Target: <strong className="text-green-400 font-bold">₹{sig.target}</strong></span>
                    )}
                    {sig.stopLoss && (
                      <span>Stoploss: <strong className="text-rose-400 font-bold">₹{sig.stopLoss}</strong></span>
                    )}
                    {sig.exitPrice && (
                      <span>Exit: <strong className="text-white font-bold">₹{sig.exitPrice}</strong></span>
                    )}
                    {sig.pnl !== undefined && sig.exitPrice && (
                      <span>
                        P&L:{' '}
                        <strong
                          className={sig.pnl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}
                        >
                          {sig.pnl >= 0 ? '+' : ''}₹{sig.pnl.toLocaleString()}
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
