import React, { useState } from 'react';

function Profile() {
  const user = JSON.parse(localStorage.getItem('rr_auth') || '{}');
  const [name, setName] = useState(user.name || 'Admin Trader');
  const [email] = useState(user.email || 'admin@risingroots.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [apiKey] = useState('rr_live_98a7f123b456c7890ef');
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = { ...user, name };
    localStorage.setItem('rr_auth', JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-white text-3xl font-bold">Profile & Account Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your personal admin account, password security, and API credentials.</p>
      </div>

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          Profile settings saved successfully!
        </div>
      )}

      {/* Account Info Card */}
      <form onSubmit={handleSaveProfile} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
        <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-3">Personal Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-green-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors cursor-pointer">
            Save Profile
          </button>
        </div>
      </form>

      {/* Security & Password */}
      <form onSubmit={(e) => e.preventDefault()} autoComplete="off" className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
        <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-3">Security & Password</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">Current Password</label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-green-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">New Password</label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Min. 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-green-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-2.5 rounded-xl text-sm border border-gray-700 transition-colors cursor-pointer">
            Update Password
          </button>
        </div>
      </form>

      {/* API Key Credentials */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-3">Developer API Key</h3>
        <p className="text-xs text-gray-400">Use this secret key to authenticate custom bot integrations or server-to-server requests.</p>

        <div className="flex items-center gap-3">
          <input
            type="text"
            readOnly
            value={apiKey}
            className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-green-400 font-mono"
          />
          <button
            onClick={() => navigator.clipboard.writeText(apiKey)}
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs border border-gray-700 transition-colors cursor-pointer"
          >
            Copy Key
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
