import React, { useEffect, useState } from 'react';

function Analytics() {
  const [data, setData] = useState({
    mrr: 240000,
    mrrGrowth: '+12.4%',
    renewalRate: '98%',
    churnRate: '2.1%',
    monthlyRevenue: [
      { month: 'May', revenue: 180000 },
      { month: 'Jun', revenue: 195000 },
      { month: 'Jul', revenue: 210000 },
      { month: 'Aug', revenue: 228000 },
      { month: 'Sep', revenue: 240000 },
    ],
  });

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
    fetch(`${API_URL}/api/analytics`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setData(resData.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-3xl font-bold">Analytics & Growth Metrics</h1>
        <p className="text-gray-400 text-sm mt-1">Track monthly recurring revenue (MRR), subscriber retention, and churn metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <p className="text-sm font-medium text-gray-400">Monthly Recurring Revenue</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-extrabold text-white font-mono">${(data.mrr || 0).toLocaleString()}</h3>
            <span className="text-xs font-bold text-green-400">{data.mrrGrowth}</span>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <p className="text-sm font-medium text-gray-400">Renewal Rate</p>
          <h3 className="text-3xl font-extrabold text-green-400 mt-2">{data.renewalRate}</h3>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <p className="text-sm font-medium text-gray-400">Monthly Churn</p>
          <h3 className="text-3xl font-extrabold text-rose-400 mt-2">{data.churnRate}</h3>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <p className="text-sm font-medium text-gray-400">Avg Revenue Per User</p>
          <h3 className="text-3xl font-extrabold text-blue-400 mt-2 font-mono">
            ${data.activeSubscribers > 0 ? Math.round(data.mrr / data.activeSubscribers).toLocaleString() : '0'}
          </h3>
        </div>
      </div>

      {/* Revenue Trend Visualizer */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-6">Revenue Growth Trend</h3>
        <div className="flex items-end gap-6 h-48 pt-6 border-b border-gray-800 px-4">
          {data.monthlyRevenue.map((item, index) => {
            const heightPct = (item.revenue / 250000) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-xs font-bold text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{(item.revenue / 1000).toFixed(0)}k
                </span>
                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg transition-all duration-300 group-hover:brightness-110"
                ></div>
                <span className="text-xs text-gray-400 font-medium">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
