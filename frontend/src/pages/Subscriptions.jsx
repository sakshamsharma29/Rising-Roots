import React, { useEffect, useState } from 'react';

function Subscriptions() {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('rr_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const loadData = () => {
    fetch(`${API_URL}/api/members`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMembers(data.data);
      })
      .catch(() => {});

    fetch(`${API_URL}/api/plans`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPlans(data.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRenew = (id, days = 30) => {
    setLoading(true);
    fetch(`${API_URL}/api/subscriptions/renew/${id}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ days }),
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          loadData();
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const expiredMembers = members.filter((m) => m.status === 'Expired');
  const activeMembers = members.filter((m) => m.status === 'Active');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-white text-3xl font-bold">Subscription Management</h1>
        <p className="text-gray-400 text-sm mt-1">
          Track active membership tiers, plan pricing, automated expiries, and 1-click subscription renewals.
        </p>
      </div>

      {/* Expiring Subscription Alerts */}
      {expiredMembers.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-3 h-3 rounded-full bg-rose-400 animate-pulse"></span>
            <h3 className="text-lg font-bold text-rose-400">
              Action Required: {expiredMembers.length} Expired Subscription{expiredMembers.length > 1 ? 's' : ''}
            </h3>
          </div>
          <p className="text-xs text-gray-300 mb-4">
            The following members have expired plans and require manual renewal or automated gateway top-up.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {expiredMembers.map((m) => (
              <div key={m.id || m._id} className="bg-gray-950 border border-rose-500/30 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{m.name}</div>
                    <div className="text-xs text-gray-400">{m.plan}</div>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                    Expired
                  </span>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">Days Left: 0</span>
                  <button
                    onClick={() => handleRenew(m.id || m._id, 30)}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-400 text-gray-950 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    +30 Days Renewal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscription Plans Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div key={p.id || p._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">{p.name}</h3>
                <span className="text-xs text-green-400 font-semibold bg-green-500/10 px-2.5 py-0.5 rounded-full border border-green-500/20">
                  {p.status}
                </span>
              </div>
              <div className="text-2xl font-black text-white">{p.price}</div>
              <p className="text-xs text-gray-400 mt-1">{p.subscribers} active community subscribers</p>

              <div className="mt-4 pt-4 border-t border-gray-800 space-y-2">
                {p.features?.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                    <span className="text-green-400 font-bold">•</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Members Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-1">Active Subscribers Directory</h3>
        <p className="text-xs text-gray-400 mb-4">All active community members and their plan expiry tracking.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-950 text-gray-400 uppercase text-xs border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Current Plan</th>
                <th className="py-3 px-4">Days Remaining</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {activeMembers.map((m) => (
                <tr key={m.id || m._id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">{m.name}</td>
                  <td className="py-3.5 px-4 text-xs font-mono text-gray-400">{m.email}</td>
                  <td className="py-3.5 px-4 text-xs text-gray-300">{m.plan}</td>
                  <td className="py-3.5 px-4 text-xs font-mono font-bold text-green-400">
                    {m.daysRemaining !== undefined ? `${m.daysRemaining} days` : '30 days'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleRenew(m.id || m._id, 30)}
                      disabled={loading}
                      className="text-xs bg-gray-950 hover:bg-gray-800 text-gray-300 border border-gray-700 font-semibold px-3 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Extend +30 Days
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Subscriptions;
