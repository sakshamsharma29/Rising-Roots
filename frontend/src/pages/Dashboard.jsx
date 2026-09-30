import React, { useEffect, useState } from 'react';

function Dashboard({ onOpenAddMember }) {
  const [stats, setStats] = useState({
    totalMembers: 1250,
    activeMembers: 982,
    expiredMembers: 76,
    monthlyRevenue: 240000,
    renewalRate: '98%',
  });

  const [activities, setActivities] = useState([
    { id: 1, text: 'Alice Smith upgraded to VIP Signals', time: '10 mins ago', type: 'upgrade' },
    { id: 2, text: 'New member Ethan Hunt joined Pro Trader', time: '45 mins ago', type: 'join' },
    { id: 3, text: 'Auto-renewal processed for ₹2,499', time: '2 hours ago', type: 'payment' },
    { id: 4, text: 'Announcement broadcasted to 982 members', time: '4 hours ago', type: 'announcement' },
  ]);

  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${API_URL}/api/stats`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setStats(resData.data);
      })
      .catch(() => {});
  }, []);

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    setActivities((prev) => [
      { id: Date.now(), text: `Announcement: "${announcementText}"`, time: 'Just now', type: 'announcement' },
      ...prev,
    ]);
    setAnnouncementText('');
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setShowBroadcastModal(false);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 border border-gray-800 p-8 rounded-2xl">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold border border-green-500/20 mb-3">
            🚀 Trading Community Overview
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Rising Roots Control Center</h1>
          <p className="text-gray-400 text-sm mt-1">Manage subscriptions, members, and announcements in real-time.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors border border-gray-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            Send Broadcast
          </button>
          <button
            onClick={onOpenAddMember}
            className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2"
          >
            + Add Member
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Members</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white">{stats.totalMembers}</h3>
          <p className="text-xs text-gray-500 mt-2">+48 new this week</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-green-400">₹{(stats.monthlyRevenue / 100000).toFixed(1)}L</h3>
          <p className="text-xs text-green-400 font-medium mt-2">+12.4% vs last month</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Subscriptions</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white">{stats.activeMembers}</h3>
          <p className="text-xs text-gray-500 mt-2">{stats.renewalRate} Renewal Rate</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Expired Plans</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-rose-400">{stats.expiredMembers}</h3>
          <p className="text-xs text-rose-400 font-medium mt-2">Requires renewal reminder</p>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Live Community Activity</h3>
        <div className="space-y-4">
          {activities.map((act) => (
            <div key={act.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-950/60 border border-gray-800/60">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                <span className="text-sm text-gray-200 font-medium">{act.text}</span>
              </div>
              <span className="text-xs text-gray-500 font-medium">{act.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Broadcast Announcement Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">Broadcast Announcement</h3>
            <p className="text-xs text-gray-400">Send an instant alert message to all connected Telegram & Discord channel members.</p>

            {broadcastSent ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-center text-sm font-semibold">
                ✓ Broadcast sent successfully!
              </div>
            ) : (
              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <textarea
                  rows="4"
                  placeholder="Enter message (e.g. NIFTY 50 Breakout Alert: Watch 24,500 Call Options...)"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-green-500 focus:outline-none"
                  required
                ></textarea>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-5 py-2 rounded-xl text-sm"
                  >
                    Send Now
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;