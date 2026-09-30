import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedRole, setSelectedRole] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(searchParams.get('join') === 'true');

  useEffect(() => {
    if (searchParams.get('join') === 'true') {
      setShowJoinModal(true);
    }
  }, [searchParams]);

  // Join Request Form State
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqInviteCode, setReqInviteCode] = useState('RR-ALPHA-2026');
  const [reqPlan, setReqPlan] = useState('Pro Trader');
  const [reqMessage, setReqMessage] = useState('');
  const [reqStatus, setReqStatus] = useState(null);
  const [reqLoading, setReqLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSubmitJoinRequest = (e) => {
    e.preventDefault();
    if (!reqName || !reqEmail) return;

    setReqLoading(true);
    setReqStatus(null);

    fetch(`${API_URL}/api/requests/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: reqName,
        email: reqEmail,
        inviteCode: reqInviteCode,
        preferredPlan: reqPlan,
        message: reqMessage,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReqStatus({ type: 'success', message: data.message });
          setReqName('');
          setReqEmail('');
          setReqMessage('');
        } else {
          setReqStatus({ type: 'error', message: data.message || 'Failed to submit request.' });
        }
      })
      .catch(() => {
        setReqStatus({ type: 'error', message: 'Failed to connect to server.' });
      })
      .finally(() => setReqLoading(false));
  };

  const roleCards = [
    {
      id: 'admin',
      title: 'Admin',
      badge: 'Full Access',
      icon: '⚡',
      color: 'from-amber-500 to-yellow-400',
      description: 'Manage trading desk operations, member subscriptions, pricing tiers, and platform revenue.',
      accessLevel: 'Level 4 — Full Superadmin Control',
      capabilities: [
        'Member Management (Add, Edit, Delete, Revoke)',
        'Pricing & Subscription Tier Customization',
        'Revenue MRR & Financial Reporting',
        'Broadcast Trade Signals to Telegram/Discord',
        'Webhook & Payment Gateway Configuration',
        'System Audit Logging & User Roles',
      ],
    },
    {
      id: 'trader',
      title: 'Trader',
      badge: 'Subscriber',
      icon: '📈',
      color: 'from-emerald-500 to-green-400',
      description: 'Access live options calls, daily market briefings, and VIP Telegram signal channels.',
      accessLevel: 'Level 1 — Member Subscriber',
      capabilities: [
        'Real-time NIFTY & BANKNIFTY Signal Feed',
        '1-Click Telegram VIP Channel Invite Link',
        'Subscription Renewal & Tier Upgrades',
        'Trade Call Entry, Target & Stoploss Metrics',
        'Educational Resources & Market Briefings',
        'Personal Subscriber Profile Management',
      ],
    },
    {
      id: 'developer',
      title: 'Developer',
      badge: 'API & Bots',
      icon: '🛠️',
      color: 'from-blue-500 to-cyan-400',
      description: 'Integrate automated Telegram bots, Stripe/Razorpay webhooks, and REST APIs.',
      accessLevel: 'Level 3 — System Developer',
      capabilities: [
        'REST API Endpoint Access',
        'Telegram & Discord Bot Webhook Hooks',
        'Payment Gateway Webhook Listener Integration',
        'Automated Access Token Generation',
        'Custom Webhook Event Logs',
        'Database Schema & API Documentation',
      ],
    },
    {
      id: 'analyst',
      title: 'Analyst',
      badge: 'Intelligence',
      icon: '📊',
      color: 'from-purple-500 to-indigo-400',
      description: 'Analyze community growth, renewal rates, churn metrics, and revenue trends.',
      accessLevel: 'Level 2 — Data Analyst',
      capabilities: [
        'Monthly Recurring Revenue (MRR) Trends',
        'Subscriber Churn & Retention Analytics',
        'Trade Signal Win-Rate Performance',
        'Plan Popularity Breakdown Reports',
        'Exportable CSV Data Reports',
        'Historical Analytics Visualizations',
      ],
    },
  ];

  const teamMembers = [
    {
      name: 'Devendra Singh Rajput',
      role: 'Admin',
      bio: 'Overseeing trading desk operations, community growth, and platform strategy for Rising Roots.',
      initials: 'DR',
      gradient: 'from-amber-500 to-orange-500',
      github: '#',
      linkedin: '#',
      twitter: '#',
    },
    {
      name: 'Saksham Sharma',
      role: 'Developer',
      bio: 'Ships fast, breaks nothing. Building high-performance full-stack architectures and real-time APIs.',
      initials: 'SS',
      gradient: 'from-cyan-500 to-blue-500',
      github: '#',
      linkedin: '#',
      twitter: '#',
    },
    {
      name: 'Anil Daksh',
      role: 'Analyst',
      bio: 'Market intelligence specialist analyzing trade win-rates, options metrics, and subscriber growth.',
      initials: 'AD',
      gradient: 'from-purple-500 to-indigo-500',
      github: '#',
      linkedin: '#',
      twitter: '#',
    },
  ];

  return (
    <div className="bg-gray-950 text-white min-h-screen font-sans antialiased">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 lg:px-20 py-5 border-b border-gray-900 sticky top-0 bg-gray-950/90 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-gray-950 font-black text-xl shadow-lg shadow-green-500/20">
            RR
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight">Rising Roots</span>
            <span className="text-xs text-green-400 font-medium block -mt-1">RR-Traders</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#roles" className="hover:text-white transition-colors">Roles</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#team" className="hover:text-white transition-colors">Team</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <span>📩</span> Request to Join
          </button>
          <Link to="/login" className="text-sm text-gray-400 hover:text-white px-3 py-2 transition-colors">
            Sign In
          </Link>
          <Link to="/login?mode=signup" className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 lg:px-20 py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold border border-green-500/20">
            🚀 Trader Management System — RR-Traders
          </span>

          <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            Manage Your Trading Desk
            <span className="text-green-400"> Without The Chaos</span>
          </h1>

          <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
            A full-stack CRM and management system built specifically for signal-trading businesses. Track members, subscription expiries, and revenue in real-time.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowJoinModal(true)}
              className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/30 flex items-center gap-2 cursor-pointer"
            >
              <span>📩</span> Request to Join Team
            </button>
            <Link to="/login?mode=signup" className="border border-gray-700 hover:border-gray-600 text-white font-medium px-8 py-3.5 rounded-xl text-sm transition-colors">
              Direct Sign In →
            </Link>
          </div>

          <div className="flex items-center gap-6 pt-4">
            <div>
              <h3 className="text-3xl font-extrabold text-white">12+</h3>
              <span className="text-xs text-gray-500 font-medium">Active Members</span>
            </div>
            <div className="h-10 w-px bg-gray-800"></div>
            <div>
              <h3 className="text-3xl font-extrabold text-green-400">₹2.4L</h3>
              <span className="text-xs text-gray-500 font-medium">Monthly MRR</span>
            </div>
            <div className="h-10 w-px bg-gray-800"></div>
            <div>
              <h3 className="text-3xl font-extrabold text-blue-400">98%</h3>
              <span className="text-xs text-gray-500 font-medium">Renewal Rate</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="flex-1 max-w-lg w-full">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl shadow-black/60 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
              </div>
              <span className="text-xs font-mono text-gray-400">RR-Traders Console v1.0</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl">
                <h4 className="text-2xl font-extrabold text-white">1,250</h4>
                <p className="text-xs text-gray-500 mt-1">Total Members</p>
              </div>
              <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl">
                <h4 className="text-2xl font-extrabold text-green-400">₹2.4L</h4>
                <p className="text-xs text-gray-500 mt-1">Monthly MRR</p>
              </div>
            </div>

            <div className="space-y-3">
              {['Devendra (Admin) logged in', 'Alice Smith renewed Pro Plan', 'NIFTY 24500 CE signal sent'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-950/80 border border-gray-800/50 p-3 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-green-400 shrink-0"></span>
                  <span className="text-xs text-gray-300 font-mono">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Role Cards Section */}
      <section id="roles" className="px-8 lg:px-20 py-20 border-t border-gray-900">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-green-400 uppercase tracking-widest">Platform Access Roles</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mt-3">Tailored Experiences for Every Team Member</h2>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto">Click any role card below to view its specific capabilities and access level details.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roleCards.map((role) => (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/5 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${role.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {role.icon}
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                    {role.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                  {role.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                  {role.description}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-green-400 group-hover:translate-x-1 transition-transform">
                View Role Capabilities →
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Cards Section */}
      <section id="team" className="px-8 lg:px-20 py-20 border-t border-gray-900 bg-gray-950">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-green-400 uppercase tracking-widest">Behind Rising Roots</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mt-3">Meet the Team</h2>
          <p className="text-gray-400 mt-3">The leaders, developers, and analysts behind RR-Traders.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all flex flex-col justify-between"
            >
              <div className={`h-2 bg-gradient-to-r ${member.gradient}`}></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${member.gradient} flex items-center justify-center text-white font-extrabold text-xl shadow-lg`}>
                    {member.initials}
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                    {member.role}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                  {member.bio}
                </p>
              </div>

              <div className="p-6 pt-0 border-t border-gray-800/60 mt-auto flex items-center gap-4 text-gray-500">
                <a href={member.github} className="hover:text-white text-xs font-medium transition-colors">GitHub</a>
                <a href={member.linkedin} className="hover:text-white text-xs font-medium transition-colors">LinkedIn</a>
                <a href={member.twitter} className="hover:text-white text-xs font-medium transition-colors">Twitter</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Role Details Modal */}
      {selectedRole && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${selectedRole.color} flex items-center justify-center text-xl`}>
                  {selectedRole.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedRole.title} Role Details</h3>
                  <span className="text-xs text-green-400 font-mono">{selectedRole.accessLevel}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRole(null)}
                className="text-gray-500 hover:text-white text-xl font-bold px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">6 Core Capabilities Checklist</h4>
              <ul className="space-y-2.5">
                {selectedRole.capabilities.map((cap, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-200 bg-gray-950 p-2.5 rounded-xl border border-gray-800/80">
                    <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    {cap}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-800">
              <button
                onClick={() => setSelectedRole(null)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
              >
                Sign In as {selectedRole.title} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Request Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>📩</span> Request to Join Trading Team
                </h3>
                <p className="text-xs text-gray-400 mt-1">Submit your request to join a community trading desk.</p>
              </div>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setReqStatus(null);
                }}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitJoinRequest} className="p-6 space-y-4">
              {reqStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    reqStatus.type === 'success'
                      ? 'bg-green-500/10 border border-green-500/20 text-green-300'
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                  }`}
                >
                  {reqStatus.message}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Rahul Sharma"
                    value={reqName}
                    onChange={(e) => setReqName(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@example.com"
                    value={reqEmail}
                    onChange={(e) => setReqEmail(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Team Invite Code</label>
                  <input
                    type="text"
                    placeholder="RR-ALPHA-2026"
                    value={reqInviteCode}
                    onChange={(e) => setReqInviteCode(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none uppercase font-mono text-green-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Preferred Tier</label>
                  <select
                    value={reqPlan}
                    onChange={(e) => setReqPlan(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="Pro Trader">Pro Trader (₹2,499/mo)</option>
                    <option value="VIP Signals & Mentorship">VIP Signals (₹4,999/mo)</option>
                    <option value="Community Pass">Community Pass (₹999/mo)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Message to Admin (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="I am an options trader looking to join your VIP desk."
                  value={reqMessage}
                  onChange={(e) => setReqMessage(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reqLoading}
                  className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {reqLoading ? 'Submitting Application...' : 'Submit Join Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="px-8 lg:px-20 py-10 border-t border-gray-900 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-gray-950 font-black text-xs">
            RR
          </div>
          <span className="text-sm font-semibold text-gray-400">Rising Roots — RR-Traders</span>
        </div>
        <p className="text-xs text-gray-600">© 2026 Rising Roots. All rights reserved.</p>
        <div className="flex gap-6 text-xs text-gray-500">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
