import React, { useEffect, useState } from 'react';

function Portfolio() {
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'community'
  const [myPortfolio, setMyPortfolio] = useState({
    summary: {
      openExposure: 0,
      openPositionsCount: 0,
      totalRealizedPnl: 0,
      winRate: '0%',
      totalTradesCount: 0,
      closedTradesCount: 0,
    },
    assetAllocation: { equity: 0, crypto: 0, options: 0, futures: 0 },
    monthlyTrend: [],
    openPositions: [],
  });

  const [communityData, setCommunityData] = useState({
    communityStats: { totalCommunityPnl: 0, communityWinRate: '0%', totalClosedTrades: 0 },
    leaderboard: [],
  });

  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('rr_token');
  const user = JSON.parse(localStorage.getItem('rr_auth') || '{}');
  const isAdmin = user.role === 'admin';

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  useEffect(() => {
    setLoading(true);

    const fetchMy = fetch(`${API_URL}/api/portfolio/me`, { headers })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setMyPortfolio(resData.data);
      })
      .catch(() => {});

    const fetchComm = fetch(`${API_URL}/api/portfolio/community`, { headers })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setCommunityData(resData.data);
      })
      .catch(() => {});

    Promise.all([fetchMy, fetchComm]).finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '₹0.00';
    const isNeg = val < 0;
    const absVal = Math.abs(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${isNeg ? '-' : ''}₹${absVal}`;
  };

  return (
    <div className="space-y-6">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-3xl font-bold flex items-center gap-3">
            <span>💼</span> Portfolio & Performance
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Track asset allocation, open position exposure, and community leaderboard analytics.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'personal'
                ? 'bg-green-500 text-gray-950 shadow-md shadow-green-500/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My Portfolio
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'community'
                ? 'bg-green-500 text-gray-950 shadow-md shadow-green-500/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Community Leaderboard
          </button>
        </div>
      </div>

      {activeTab === 'personal' ? (
        <>
          {/* Top Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Open Exposure */}
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Open Exposure</span>
              <div className="text-2xl font-black text-white mt-3">{formatCurrency(myPortfolio.summary.openExposure)}</div>
              <p className="text-xs text-gray-500 mt-2">
                Across {myPortfolio.summary.openPositionsCount} active open position{myPortfolio.summary.openPositionsCount !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Total Realized PnL */}
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Realized P&L</span>
              <div
                className={`text-2xl font-black mt-3 ${
                  myPortfolio.summary.totalRealizedPnl >= 0 ? 'text-green-400' : 'text-rose-400'
                }`}
              >
                {formatCurrency(myPortfolio.summary.totalRealizedPnl)}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                From {myPortfolio.summary.closedTradesCount} closed trade executions
              </p>
            </div>

            {/* Win Rate */}
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Win Rate</span>
              <div className="text-2xl font-black text-emerald-400 mt-3">{myPortfolio.summary.winRate}</div>
              <p className="text-xs text-gray-500 mt-2">Total Executions: {myPortfolio.summary.totalTradesCount}</p>
            </div>

            {/* Top Asset Allocation */}
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Primary Asset Class</span>
              <div className="text-xl font-bold text-white mt-3 capitalize">
                {Object.entries(myPortfolio.assetAllocation).reduce((max, a) => (a[1] > max[1] ? a : max), ['None', 0])[0]}
              </div>
              <p className="text-xs text-gray-500 mt-2">Highest capital allocation share</p>
            </div>
          </div>

          {/* Asset Allocation & Open Positions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Asset Allocation Progress Cards */}
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-5">
              <h3 className="text-lg font-bold text-white">Asset Class Allocation</h3>
              <p className="text-xs text-gray-400">Capital distribution across market instrument types.</p>

              <div className="space-y-4">
                {[
                  { label: 'Equity (Stocks)', pct: myPortfolio.assetAllocation.equity, color: 'bg-green-500' },
                  { label: 'Crypto', pct: myPortfolio.assetAllocation.crypto, color: 'bg-emerald-400' },
                  { label: 'Options', pct: myPortfolio.assetAllocation.options, color: 'bg-purple-500' },
                  { label: 'Futures', pct: myPortfolio.assetAllocation.futures, color: 'bg-blue-500' },
                ].map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-300">{item.label}</span>
                      <span className="text-white font-mono font-bold">{item.pct}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Open Positions Table */}
            <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Active Open Positions</h3>
              {myPortfolio.openPositions.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <p className="text-sm">No open positions in your portfolio.</p>
                  <p className="text-xs mt-1 text-gray-600">Log new entries in the Trade Journal to track live exposure.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead className="bg-gray-950 text-gray-400 uppercase text-xs border-b border-gray-800">
                      <tr>
                        <th className="py-2.5 px-3">Symbol</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Entry</th>
                        <th className="py-2.5 px-3">Qty</th>
                        <th className="py-2.5 px-3">Capital Exposed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60 font-mono text-xs">
                      {myPortfolio.openPositions.map((pos) => (
                        <tr key={pos.id || pos._id}>
                          <td className="py-3 px-3 font-sans font-bold text-white uppercase">{pos.symbol}</td>
                          <td className="py-3 px-3 capitalize text-gray-400">{pos.assetType} ({pos.tradeType})</td>
                          <td className="py-3 px-3 text-gray-200">₹{pos.entryPrice}</td>
                          <td className="py-3 px-3 text-gray-300">{pos.quantity}</td>
                          <td className="py-3 px-3 text-green-400 font-bold">₹{(pos.entryPrice * pos.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Community Leaderboard View */
        <div className="space-y-6">
          {/* Community Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Community Net Realized P&L</span>
              <div
                className={`text-2xl font-black mt-3 ${
                  communityData.communityStats.totalCommunityPnl >= 0 ? 'text-green-400' : 'text-rose-400'
                }`}
              >
                {formatCurrency(communityData.communityStats.totalCommunityPnl)}
              </div>
              <p className="text-xs text-gray-500 mt-2">Combined profit across all community members</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Group Average Win Rate</span>
              <div className="text-2xl font-black text-emerald-400 mt-3">{communityData.communityStats.communityWinRate}</div>
              <p className="text-xs text-gray-500 mt-2">Based on {communityData.communityStats.totalClosedTrades} community trades</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Closed Trades</span>
              <div className="text-2xl font-black text-white mt-3">{communityData.communityStats.totalClosedTrades}</div>
              <p className="text-xs text-gray-500 mt-2">Logged trade executions</p>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">🏆 Top Community Traders</h3>
            <p className="text-xs text-gray-400 mb-6">Traders ranked by net realized P&L and execution win-rate accuracy.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-gray-950 text-gray-400 uppercase text-xs border-b border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Trader Name</th>
                    <th className="py-3 px-4">Total Trades</th>
                    <th className="py-3 px-4">Win Rate</th>
                    <th className="py-3 px-4 text-right">Net Realized P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {communityData.leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500">
                        No community leaderboard data available yet.
                      </td>
                    </tr>
                  ) : (
                    communityData.leaderboard.map((trader, idx) => (
                      <tr key={trader.userId} className="hover:bg-gray-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-gray-400">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {trader.name || trader.email || 'Anonymous Trader'}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono text-gray-300">{trader.totalTrades}</td>
                        <td className="py-3.5 px-4 text-xs font-mono font-bold text-emerald-400">{trader.winRate}</td>
                        <td
                          className={`py-3.5 px-4 text-right font-mono font-bold ${
                            trader.totalPnl >= 0 ? 'text-green-400' : 'text-rose-400'
                          }`}
                        >
                          {formatCurrency(trader.totalPnl)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Portfolio;
