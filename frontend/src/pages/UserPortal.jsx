import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function UserPortal() {
  const user = JSON.parse(localStorage.getItem('rr_auth') || '{}');
  const [memberInfo, setMemberInfo] = useState({ plan: 'Pro Trader', status: 'Active', daysRemaining: 30 });
  const [signals] = useState([
    { id: 1, pair: 'NIFTY 50 24500 CE', entry: '145.00', target: '185.00', stoploss: '120.00', status: 'ACTIVE', time: '15 mins ago' },
    { id: 2, pair: 'BANKNIFTY 52000 PE', entry: '310.00', target: '420.00', stoploss: '260.00', status: 'HIT TARGET 🚀', time: '2 hours ago' },
    { id: 3, pair: 'RELIANCE 3000 CE', entry: '42.50', target: '65.00', stoploss: '32.00', status: 'HIT TARGET 🚀', time: 'Yesterday' },
  ]);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('rr_token');
    if (!token) return;

    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.user) {
          fetch(`${API_URL}/api/members?search=${encodeURIComponent(resData.user.email)}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
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
  }, []);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 border border-gray-800 p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold border border-green-500/20 mb-3">
            ⭐ Subscriber Member Portal
          </span>
          <h1 className="text-3xl font-extrabold text-white">Welcome back, {user.name || 'Trader'}!</h1>
          <p className="text-gray-400 text-sm mt-1">Access your live trading signals, VIP Telegram channel, and membership status.</p>
        </div>

        <a
          href="https://t.me/+RisingRootsVIP_SampleLink"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-green-500/20 flex items-center gap-2 shrink-0"
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
          <Link
            to="/dashboard/plans"
            className="mt-4 inline-block text-center bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-xl text-xs border border-gray-700 transition-colors"
          >
            Upgrade / Renew Plan
          </Link>
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
            <Link
              to="/dashboard/plans"
              className="mt-4 inline-block text-center bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
            >
              Reactivate Access Now
            </Link>
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
        </div>
      </div>

      {/* Live Trading Signals Feed */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Live Trading Signals Feed</h3>
            <p className="text-xs text-gray-400 mt-0.5">Real-time Call/Put options trade ideas from expert analysts.</p>
          </div>
          <span className="text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
            Realtime Stream
          </span>
        </div>

        <div className="space-y-4">
          {signals.map((sig) => (
            <div key={sig.id} className="bg-gray-950 border border-gray-800/80 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-extrabold text-white">{sig.pair}</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    sig.status.includes('TARGET')
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {sig.status}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-xs text-gray-400">
                  <span>Entry: <strong className="text-gray-200">₹{sig.entry}</strong></span>
                  <span>Target: <strong className="text-green-400">₹{sig.target}</strong></span>
                  <span>Stoploss: <strong className="text-rose-400">₹{sig.stoploss}</strong></span>
                </div>
              </div>

              <div className="text-xs text-gray-500 font-medium self-end md:self-center">
                {sig.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserPortal;
