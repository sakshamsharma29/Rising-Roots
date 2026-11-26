import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ContactUs() {
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
  const authData = JSON.parse(localStorage.getItem('rr_auth') || '{}');
  const isLoggedIn = !!authData.name || !!authData.email;

  const [name, setName] = useState(authData.name || '');
  const [email, setEmail] = useState(authData.email || '');
  const [phone, setPhone] = useState(authData.phone || '');
  const [telegram, setTelegram] = useState(authData.telegramUsername || '');
  const [subject, setSubject] = useState('Account & Subscription Query');
  const [marketInterest, setMarketInterest] = useState(authData.preferredMarket || 'All Markets');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
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

  return (
    <div className="bg-gray-950 min-h-screen text-white font-sans antialiased">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-6 lg:px-16 py-4 border-b border-gray-900 sticky top-0 bg-gray-950/90 backdrop-blur-md z-30">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-gray-950 font-black text-xl shadow-lg shadow-green-500/20">
            RR
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">Rising Roots</span>
            <span className="text-xs text-green-400 font-medium block -mt-1">Desk Inquiries & Support</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-gray-400 font-medium">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
          <Link to="/history" className="hover:text-white transition-colors flex items-center gap-1">
            <span>🏆</span> Track Record
          </Link>
          <Link to="/contact" className="text-emerald-400 font-bold">Contact & Query</Link>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              to="/dashboard"
              className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
            >
              Open Dashboard →
            </Link>
          ) : (
            <Link
              to="/login"
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">
            WE ARE HERE TO HELP
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Client Support & Query Desk</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2">
            Have questions about our signals, Indian indices charts, options Greeks, or facing any payment issue? Fill the form below or chat directly on WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Direct Contact Info */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-3">
              <span className="text-2xl block">💬</span>
              <h3 className="text-sm font-bold text-white">Direct WhatsApp Desk</h3>
              <p className="text-xs text-gray-400">
                Instant priority response for active members and subscribers.
              </p>
              <a
                href="https://wa.me/919876543210?text=Hi%20Rising%20Roots%20Desk,%20I%20have%20a%20query%20regarding%20membership"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
              >
                <span>Chat on WhatsApp →</span>
              </a>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-3">
              <span className="text-2xl block">✈️</span>
              <h3 className="text-sm font-bold text-white">Official Telegram Desk</h3>
              <p className="text-xs text-gray-400">
                VIP signal broadcasts and broadcast trade updates.
              </p>
              <a
                href="https://t.me/RisingRootsDesk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
              >
                <span>@RisingRootsDesk →</span>
              </a>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-2">
              <span className="text-2xl block">⏱️</span>
              <h3 className="text-sm font-bold text-white">Desk SLA Guarantee</h3>
              <p className="text-xs text-gray-400">
                Queries submitted through this form are logged in our internal support queue and resolved in under <span className="text-emerald-400 font-bold">2 hours</span> during active trading market sessions.
              </p>
            </div>
          </div>

          {/* Right Column: Query Form */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 p-6 sm:p-8 rounded-3xl shadow-xl">
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

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    Telegram Handle (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="@rahul_trader"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Query Category</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  >
                    <option value="VIP Signals Membership">VIP Signals Membership & Pricing</option>
                    <option value="Payment / Billing Issue">Payment / Billing Issue</option>
                    <option value="Technical Question on Nifty/Sensex/Crypto">Technical Question (Nifty/Sensex/Crypto)</option>
                    <option value="Delta Exchange Options Question">Delta Exchange Options & Greeks</option>
                    <option value="Account Personal Details Update">Account Details / Phone Update</option>
                    <option value="General Query">Other / General Query</option>
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
                  Your Message / Query Details <span className="text-emerald-400">*</span>
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder="Please describe your question or issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder-gray-600"
                ></textarea>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-gray-500">
                  🔒 Handled confidentially by Rising Roots Desk
                </span>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-gray-950 font-black px-6 py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-2"
                >
                  {submitting ? (
                    <span className="w-4 h-4 border-2 border-gray-950/30 border-t-gray-950 rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span>📨</span>
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-8 px-6 lg:px-16 text-center text-xs text-gray-500 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Rising Roots Intelligence. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link to="/privacy" className="hover:text-emerald-400 font-semibold transition-colors">Privacy Policy</Link>
            <Link to="/history" className="hover:text-white transition-colors">Track Record</Link>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
