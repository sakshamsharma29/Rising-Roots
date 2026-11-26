import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AboutUs() {
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
  const authData = JSON.parse(localStorage.getItem('rr_auth') || '{}');
  const isLoggedIn = !!authData.name || !!authData.email;

  // Query Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [subject, setSubject] = useState('VIP Membership Inquiry');
  const [marketInterest, setMarketInterest] = useState('Crypto & Forex');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !message) return;

    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch(`${API_URL}/api/queries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          telegram,
          subject,
          marketInterest,
          message,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', message: data.message });
        setName('');
        setEmail('');
        setPhone('');
        setTelegram('');
        setMessage('');
      } else {
        setStatus({ type: 'error', message: data.message || 'Submission failed.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Unable to connect to server. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const deskPillars = [
    {
      icon: '📐',
      title: 'Quantitative & Mathematical Edge',
      desc: 'We do not trade on gut feeling or lagging retail indicators. Every setup is screened through order flow imbalance, Put-Call Ratio (PCR), and Delta Exchange Implied Volatility (IV) skew.',
    },
    {
      icon: '🛡️',
      title: 'Mandatory 1:2.5+ Risk to Reward',
      desc: 'Capital preservation is our first commandment. Our invalidation stop-loss is always tight and pre-defined before order execution, giving us a mathematical win rate edge.',
    },
    {
      icon: '🌐',
      title: 'Institutional Multi-Asset Coverage',
      desc: 'Deep specialization across 24/7 Crypto derivatives (BTC & ETH Options), Commodities (Spot Gold & Silver), and Indian benchmark indices (NIFTY 50 & BSE SENSEX).',
    },
    {
      icon: '🔍',
      title: '100% Audited Transparency Pledge',
      desc: 'Zero fake edited profit slips. Every single closed trade is permanently documented on our public Track Record ledger with verified trade proof and timestamped entries.',
    },
  ];

  const team = [
    {
      name: 'Devendra Singh Rajput',
      role: 'Lead Desk Trader & Founder',
      desc: 'Specialist in European Options Greeks, volatility arbitrage, and liquidity sweep trading across Crypto and Indian equity derivatives.',
      badge: 'Lead Trader',
      avatar: 'DR',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      name: 'Anil Daksh',
      role: 'Senior Market Strategist & Co-Founder',
      desc: 'Expert in institutional price action, multi-asset risk management, and macro trend execution across Forex, Gold, and Indian Indices.',
      badge: 'Co-Founder',
      avatar: 'AD',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      name: 'Saksham Sharma',
      role: 'Quantitative Systems Architect & Developer',
      desc: 'Architect behind real-time Delta Exchange API feeds, automated signal webhooks, and low-latency trading infrastructure.',
      badge: 'Quant Dev',
      avatar: 'SS',
      gradient: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <div className="bg-gray-950 min-h-screen text-white font-sans antialiased selection:bg-emerald-500 selection:text-gray-950">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-6 lg:px-16 py-4 border-b border-gray-900 sticky top-0 bg-gray-950/90 backdrop-blur-md z-30">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-gray-950 font-black text-xl shadow-lg shadow-green-500/20">
            RR
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">Rising Roots</span>
            <span className="text-xs text-green-400 font-medium block -mt-1">Trading Desk & Intelligence</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-gray-400 font-medium">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/about" className="text-emerald-400 font-bold">About Us</Link>
          <Link to="/history" className="hover:text-white transition-colors flex items-center gap-1">
            <span>🏆</span> Track Record
          </Link>
          <Link to="/dashboard/terminal" className="hover:text-white transition-colors flex items-center gap-1">
            <span>⚡</span> Live Charts
          </Link>
          <Link to="/dashboard/options" className="hover:text-white transition-colors flex items-center gap-1">
            <span>📈</span> Option Chain
          </Link>
          <Link to="/contact" className="hover:text-white transition-colors">Query Desk</Link>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link
                to="/dashboard"
                className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('rr_token');
                  localStorage.removeItem('rr_auth');
                  window.location.href = '/login';
                }}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-xs text-gray-400 hover:text-white px-3 py-2 font-medium">
                Sign In
              </Link>
              <Link
                to="/login?mode=signup"
                className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
              >
                Join Desk
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-16 pt-16 pb-20 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-6">
          <span>⚡</span> ABOUT RISING ROOTS TRADING DESK
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Built by Traders for Traders with{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-500 bg-clip-text text-transparent">
            Institutional Rigor
          </span>
        </h1>

        <p className="mt-6 text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          We established Rising Roots to eliminate the noise, deceptive marketing, and fake screenshots rampant in the retail trading space. Our desk delivers data-backed setups, live charts, and 100% verified trade histories.
        </p>

        {/* Quick Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 text-left">
          {[
            { value: '78.6%', label: 'Audited Win Rate', sub: 'Calculated over 140+ trades' },
            { value: '1 : 2.9', label: 'Average R:R Ratio', sub: 'Strict risk parameters' },
            { value: '24/7', label: 'Real-Time Feeds', sub: 'Delta Exchange & Live Indices' },
            { value: '1,250+', label: 'Active Subscribers', sub: 'Global community trust' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
              <div className="text-2xl lg:text-3xl font-black font-mono text-emerald-400">{item.value}</div>
              <div className="text-xs font-bold text-white mt-1">{item.label}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Mission & Philosophy */}
      <section className="px-6 lg:px-16 py-16 bg-gray-900/50 border-y border-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Our Core Desk Pillars</h2>
            <p className="text-sm text-gray-400 mt-2">
              The fundamental trading and risk rules that protect and compound member capital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deskPillars.map((p, i) => (
              <div
                key={i}
                className="bg-gray-900 border border-gray-800 p-6 rounded-2xl hover:border-gray-700 transition-all flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-center text-2xl shrink-0">
                  {p.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{p.title}</h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Desk Team */}
      <section className="px-6 lg:px-16 py-16 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Desk Leadership</h2>
          <p className="text-sm text-gray-400 mt-2">
            The market veterans analyzing liquidity, managing risk, and building our execution platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {team.map((m, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${m.gradient} flex items-center justify-center text-gray-950 font-black text-lg shrink-0 shadow-lg`}>
                {m.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{m.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {m.badge}
                  </span>
                </div>
                <p className="text-xs text-emerald-400 font-medium mt-0.5">{m.role}</p>
                <p className="text-xs text-gray-400 mt-2.5 leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Query Form Section */}
      <section id="query" className="px-6 lg:px-16 py-16 bg-gradient-to-b from-gray-950 via-gray-900/60 to-gray-950 border-t border-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">
              HAVE QUESTIONS OR ISSUES?
            </span>
            <h2 className="text-3xl font-black text-white">Submit a Direct Query to Our Desk</h2>
            <p className="text-xs text-gray-400 mt-2">
              Whether you need guidance on VIP memberships, options Greeks, or account assistance, our team responds directly within 2 hours.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-6 sm:p-8 rounded-3xl shadow-2xl">
            {status && (
              <div
                className={`p-4 rounded-xl text-xs font-semibold mb-6 flex items-center justify-between ${
                  status.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}
              >
                <span>{status.message}</span>
                <button onClick={() => setStatus(null)} className="text-gray-400 hover:text-white cursor-pointer ml-3">
                  ✕
                </button>
              </div>
            )}

            <form onSubmit={handleSubmitQuery} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Your Full Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Email Address <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Phone / WhatsApp Number <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Telegram Username (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="@your_telegram_id"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Subject / Query Type</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  >
                    <option value="VIP Membership Inquiry">VIP Membership & Pricing</option>
                    <option value="Payment & Billing Support">Payment & Billing Support</option>
                    <option value="Trading Signals & Technical Question">Signals & Technical Setup</option>
                    <option value="Options Chain & Greeks Help">Options Chain & Delta Greeks</option>
                    <option value="Other / General Partnership">General Inquiry / Partnership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Market Interest</label>
                  <select
                    value={marketInterest}
                    onChange={(e) => setMarketInterest(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  >
                    <option value="Crypto & Forex">Crypto & Forex</option>
                    <option value="Indian Indices (Nifty / Sensex)">Indian Indices (Nifty / Sensex)</option>
                    <option value="Commodities (Gold & Silver)">Commodities (Gold & Silver)</option>
                    <option value="All Markets">All Markets</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Detailed Query / Message <span className="text-emerald-400">*</span>
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder="Tell us what you need help with or ask any questions regarding our trading desk..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder-gray-600"
                ></textarea>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-[11px] text-gray-500">
                  <span>🔒 Your personal data is confidential and used solely to address your query.</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-gray-950 font-black px-6 py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span className="w-4 h-4 border-2 border-gray-950/30 border-t-gray-950 rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span>📨</span>
                      <span>Submit Query to Desk</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-8 px-6 lg:px-16 text-center text-xs text-gray-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Rising Roots Intelligence. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link to="/privacy" className="hover:text-emerald-400 font-semibold transition-colors">Privacy Policy</Link>
            <Link to="/history" className="hover:text-white transition-colors">Track Record</Link>
            <Link to="/dashboard/terminal" className="hover:text-white transition-colors">Terminal</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
