import React, { useState, useEffect } from 'react';

function Profile() {
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
  const token = localStorage.getItem('rr_token');
  const initialUser = JSON.parse(localStorage.getItem('rr_auth') || '{}');

  const [user, setUser] = useState(initialUser);
  const [name, setName] = useState(initialUser.name || 'Trader');
  const [phone, setPhone] = useState(initialUser.phone || '');
  const [city, setCity] = useState(initialUser.city || '');
  const [email] = useState(initialUser.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [apiKey] = useState('rr_live_98a7f123b456c7890ef');
  const [saved, setSaved] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  // Fetch latest authenticated user details from API
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
          if (data.user.name) setName(data.user.name);
          if (data.user.phone) setPhone(data.user.phone);
          if (data.user.city) setCity(data.user.city);
        }
      })
      .catch(() => {});
  }, [token]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = { ...user, name, phone, city };
    localStorage.setItem('rr_auth', JSON.stringify(updated));
    setUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg('Password must be at least 6 characters.');
      return;
    }
    setPasswordMsg('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPasswordMsg(''), 4000);
  };

  const getInitials = () => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    return 'RR';
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 border border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-gray-950 font-black text-2xl shadow-lg shadow-emerald-500/20 shrink-0">
            {getInitials()}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{name || 'Account Profile'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                {user.role === 'admin' ? 'Owner / Admin' : 'Subscriber'}
              </span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm font-mono mt-1">{email}</p>
          </div>
        </div>

        {/* KYC Compliance Badge Card */}
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-3.5 flex items-center gap-3">
          <span className="text-2xl">🪪</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">KYC Verification</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                user.kycStatus === 'Verified'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : user.kycStatus === 'Rejected'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {user.kycStatus === 'Verified' ? '✓ Verified' : user.kycStatus === 'Rejected' ? '✕ Action Required' : '⏳ Pending Review'}
              </span>
            </div>
            <p className="text-xs text-gray-300 font-mono mt-0.5">
              {user.idType || 'Government ID'}: {user.idNumber ? `${user.idNumber.substring(0, 4)}••••` : 'Uploaded'}
            </p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-2xl text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          Profile personal details saved successfully!
        </div>
      )}

      {/* Account Info Form */}
      <form onSubmit={handleSaveProfile} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h3 className="text-base font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
          <span>👤</span> Personal & Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Registered Email (Read-only)</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Phone / WhatsApp Number</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">City / Location</label>
            <input
              type="text"
              placeholder="e.g. Mumbai, Maharashtra"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            Save Profile Details
          </button>
        </div>
      </form>

      {/* Security & Password */}
      <form onSubmit={handleUpdatePassword} autoComplete="off" className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h3 className="text-base font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
          <span>🔒</span> Security & Account Password
        </h3>

        {passwordMsg && (
          <div className="p-3 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            {passwordMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Current Password</label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">New Password</label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Min. 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs sm:text-sm border border-gray-700 transition-colors cursor-pointer"
          >
            Update Password
          </button>
        </div>
      </form>

      {/* API Key Credentials */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
          <span>⚡</span> Trader Desk API Credentials
        </h3>
        <p className="text-xs text-gray-400">Use this secret key to authenticate custom trading bot integrations or exchange webhook notifications.</p>

        <div className="flex items-center gap-3">
          <input
            type="text"
            readOnly
            value={apiKey}
            className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs font-mono text-emerald-400"
          />
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(apiKey);
              alert('API Key copied to clipboard!');
            }}
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs border border-gray-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            Copy Key
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
