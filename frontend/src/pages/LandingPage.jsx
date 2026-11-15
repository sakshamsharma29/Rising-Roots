import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import CheckoutModal from '../components/CheckoutModal';
import { getGlobalMarketStatus } from '../utils/marketHours';

function LandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedRole, setSelectedRole] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(searchParams.get('join') === 'true');
  const [checkoutPlan, setCheckoutPlan] = useState(null);

  // Global Market Status (24/7 Crypto + 24/5 Forex)
  const [marketStatus, setMarketStatus] = useState(getGlobalMarketStatus());
  useEffect(() => {
    const timer = setInterval(() => {
      setMarketStatus(getGlobalMarketStatus());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live Top Tickers for Marquee
  const [tickerPrices, setTickerPrices] = useState({
    BTC: { price: 64520, change: 1.76 },
    ETH: { price: 2655, change: 1.85 },
    SOL: { price: 154.8, change: -1.53 },
    EURUSD: { price: 1.0845, change: 0.17 },
    GBPUSD: { price: 1.3025, change: -0.18 },
  });

  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const data = await res.json();
        if (Array.isArray(data)) {
          const btc = data.find((d) => d.symbol === 'BTCUSDT');
          const eth = data.find((d) => d.symbol === 'ETHUSDT');
          const sol = data.find((d) => d.symbol === 'SOLUSDT');
          setTickerPrices((prev) => ({
            ...prev,
            ...(btc && { BTC: { price: parseFloat(btc.lastPrice), change: parseFloat(btc.priceChangePercent) } }),
            ...(eth && { ETH: { price: parseFloat(eth.lastPrice), change: parseFloat(eth.priceChangePercent) } }),
            ...(sol && { SOL: { price: parseFloat(sol.lastPrice), change: parseFloat(sol.priceChangePercent) } }),
          }));
        }
      } catch (e) {}
    };
    fetchTickers();
    const interval = setInterval(fetchTickers, 4000);
    return () => clearInterval(interval);
  }, []);

  // Real Database Stats
  const [platformStats, setPlatformStats] = useState({
    totalMembers: 3,
    activeMembers: 3,
    monthlyRevenue: 19497,
    renewalRate: '100%',
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API_URL}/api/stats`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) setPlatformStats(data.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchParams.get('join') === 'true') {
      setShowJoinModal(true);
    }
  }, [searchParams]);

  // Join Request Form State
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqInviteCode, setReqInviteCode] = useState('RR-GLOBAL-2026');
  const [reqPlan, setReqPlan] = useState('Pro Crypto & Forex');
  const [reqMessage, setReqMessage] = useState('');
  const [reqStatus, setReqStatus] = useState(null);
  const [reqLoading, setReqLoading] = useState(false);

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
      title: 'Desk Admin',
      badge: 'Full Access',
      icon: '⚡',
      color: 'from-amber-500 to-yellow-400',
      description: 'Superadmin management for global crypto & forex signals, subscriber tiers, and platform revenue.',
      accessLevel: 'Level 4 — Full Superadmin Control',
      capabilities: [
        'Global Subscriber Management (Add, Edit, Revoke)',
        'Pricing & Subscription Tier Customization',
        'Multi-Currency Financial & MRR Reports',
        'Broadcast Crypto & Forex Signals to Telegram/Discord',
        'Option Chain & Liquidation Alert Webhooks',
        'Audit Logging & API Security Access',
      ],
    },
    {
      id: 'trader',
      title: 'Trader',
      badge: 'Subscriber',
      icon: '📈',
      color: 'from-emerald-500 to-green-400',
      description: 'Access 24/7 crypto option chains, live price feeds, and risk-free $10,000 paper trading desk.',
      accessLevel: 'Level 1 — Member Subscriber',
      capabilities: [
        '24/7 Real-Time Crypto & Forex Price Watchlists',
        'Interactive BTC & ETH Option Chain with Greeks (Delta/IV)',
        'Risk-Free $10,000 Virtual Paper Trading Simulator',
        'Instant Telegram VIP Signal Channel Access',
        'Put-Call Ratio (PCR) & Max Pain Level Analytics',
        'Personal Subscriber Profile Management',
      ],
    },
    {
      id: 'developer',
      title: 'Quant Developer',
      badge: 'API & Bots',
      icon: '🛠️',
      color: 'from-blue-500 to-cyan-400',
      description: 'Integrate automated crypto trading bots, Deribit option feeds, and REST webhooks.',
      accessLevel: 'Level 3 — System Developer',
      capabilities: [
        'High-Performance REST API Endpoints',
        'Telegram & Discord Bot Signal Webhooks',
        'Binance & Deribit Real-Time Feed Bridges',
        'Automated JWT Authentication Tokens',
        'Custom Webhook Event & Error Logs',
        'MongoDB Schema & Open Endpoints Documentation',
      ],
    },
    {
      id: 'analyst',
      title: 'Market Analyst',
      badge: 'Research',
      icon: '📊',
      color: 'from-purple-500 to-indigo-400',
      description: 'Analyze option volatility surfaces, open interest distribution, and trader performance.',
      accessLevel: 'Level 2 — Data Analyst',
      capabilities: [
        'Options Max Pain & Open Interest Skew Reports',
        'Historical Volatility vs Implied Volatility (IV) Curves',
        'Trade Win-Rate & Risk-to-Reward Ratio Analytics',
        'Forex Session Liquidity Overlap Reports',
        'Exportable CSV Data Reports',
        'Subscriber Churn & Retention Analytics',
      ],
    },
  ];

  const teamMembers = [
    {
      name: 'Devendra Singh Rajput',
      role: 'Admin & Lead Trader',
      bio: 'Overseeing global crypto & forex trading desks, options risk modeling, and community operations.',
      initials: 'DR',
      gradient: 'from-amber-500 to-orange-500',
      github: '#',
      linkedin: '#',
      twitter: '#',
    },
    {
      name: 'Saksham Sharma',
      role: 'Full-Stack Developer',
      bio: 'Building real-time low-latency financial systems, Binance/Deribit WebSocket bridges, and scalable APIs.',
      initials: 'SS',
      gradient: 'from-cyan-500 to-blue-500',
      github: '#',
      linkedin: '#',
      twitter: '#',
    },
    {
      name: 'Anil Daksh',
      role: 'Quantitative Analyst',
      bio: 'Market volatility specialist focusing on crypto option chains, Black-Scholes Greeks, and algorithmic setups.',
      initials: 'AD',
      gradient: 'from-purple-500 to-indigo-500',
      github: '#',
      linkedin: '#',
      twitter: '#',
    },
  ];

  return (
    <div className="bg-gray-950 text-white min-h-screen font-sans antialiased">
      {/* Global Market Session Announcement Bar */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-950 to-gray-900 border-b border-gray-800 text-gray-300 py-2.5 px-4 text-center text-xs flex flex-wrap items-center justify-center gap-3 shadow-md relative z-40">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-extrabold uppercase tracking-wider text-emerald-400">
            CRYPTO 24/7 LIVE
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-300 font-mono">
            {marketStatus.forex.statusText}
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400 font-mono">({marketStatus.utcTimeString})</span>
        </span>
        <span className="hidden md:inline text-gray-600">|</span>
        <span className="text-amber-400 font-bold hidden sm:inline">
          Use code ROOTS20 for 20% off
        </span>
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/options"
            className="bg-amber-500 hover:bg-amber-400 text-gray-950 text-[11px] font-black px-3 py-1 rounded-full transition-all cursor-pointer shadow"
          >
            Option Chain →
          </Link>
          <Link
            to="/dashboard/terminal"
            className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-[11px] font-black px-3 py-1 rounded-full transition-all cursor-pointer shadow"
          >
            Terminal & Paper Desk →
          </Link>
        </div>
      </div>

      {/* Live Ticker Tape Marquee */}
      <div className="bg-gray-900/60 border-b border-gray-800/80 px-4 py-2 overflow-x-auto text-xs font-mono flex items-center justify-center gap-8 text-gray-300">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">BTC/USDT</span>
          <span className="text-emerald-400 font-bold">${tickerPrices.BTC.price.toLocaleString()}</span>
          <span className={`text-[10px] ${tickerPrices.BTC.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ({tickerPrices.BTC.change >= 0 ? '+' : ''}{tickerPrices.BTC.change}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">ETH/USDT</span>
          <span className="text-emerald-400 font-bold">${tickerPrices.ETH.price.toLocaleString()}</span>
          <span className={`text-[10px] ${tickerPrices.ETH.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ({tickerPrices.ETH.change >= 0 ? '+' : ''}{tickerPrices.ETH.change}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">SOL/USDT</span>
          <span className="text-emerald-400 font-bold">${tickerPrices.SOL.price}</span>
          <span className={`text-[10px] ${tickerPrices.SOL.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ({tickerPrices.SOL.change >= 0 ? '+' : ''}{tickerPrices.SOL.change}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">EUR/USD</span>
          <span className="text-blue-400 font-bold">${tickerPrices.EURUSD.price}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">GBP/USD</span>
          <span className="text-blue-400 font-bold">${tickerPrices.GBPUSD.price}</span>
        </div>
      </div>

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 lg:px-20 py-5 border-b border-gray-900 sticky top-0 bg-gray-950/90 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-gray-950 font-black text-xl shadow-lg shadow-green-500/20">
            RR
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight">Rising Roots</span>
            <span className="text-xs text-green-400 font-medium block -mt-1">Crypto & Forex Intelligence</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <Link to="/dashboard/options" className="hover:text-amber-400 transition-colors font-bold text-white flex items-center gap-1">
            <span>📈</span> Option Chain
          </Link>
          <Link to="/dashboard/terminal" className="hover:text-emerald-400 transition-colors font-bold text-white flex items-center gap-1">
            <span>⚡</span> Paper Terminal
          </Link>
          <a href="#roles" className="hover:text-white transition-colors">Roles</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#team" className="hover:text-white transition-colors">Team</a>
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
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
            ⚡ 24/7 Crypto Markets & Global Forex Intelligence — RR-Traders
          </span>

          <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            Next-Gen Forex & Crypto
            <span className="text-green-400"> Option Chain Analytics</span>
          </h1>

          <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
            Institutional-grade live market feeds for Bitcoin, Ethereum, and major currency pairs. Analyze real-time option chains, Greeks (Delta/IV), and Max Pain levels with a risk-free $10,000 paper trading desk.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/dashboard/options"
              className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-black px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2"
            >
              <span>📊</span> View Live Option Chain
            </Link>
            <Link
              to="/dashboard/terminal"
              className="border border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-400 font-bold px-8 py-3.5 rounded-xl text-sm transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>⚡</span> Open Paper Terminal ($10k Demo)
            </Link>
          </div>

          <div className="flex items-center gap-6 pt-4">
            <div>
              <h3 className="text-3xl font-extrabold text-white">24/7</h3>
              <span className="text-xs text-gray-500 font-medium">Non-Stop Crypto</span>
            </div>
            <div className="h-10 w-px bg-gray-800"></div>
            <div>
              <h3 className="text-3xl font-extrabold text-amber-400 font-mono">
                BTC & ETH
              </h3>
              <span className="text-xs text-gray-500 font-medium">Option Chains</span>
            </div>
            <div className="h-10 w-px bg-gray-800"></div>
            <div>
              <h3 className="text-3xl font-extrabold text-emerald-400">$10,000</h3>
              <span className="text-xs text-gray-500 font-medium">Free Paper Margin</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview Widget */}
        <div className="flex-1 max-w-lg w-full">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl shadow-black/60 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">RR-CryptoDesk v2.0</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl">
                <span className="text-xs text-gray-500 block">Bitcoin Live Spot</span>
                <h4 className="text-2xl font-extrabold text-white font-mono mt-1">${tickerPrices.BTC.price.toLocaleString()}</h4>
                <p className="text-[11px] text-emerald-400 mt-1">● 24/7 Live Stream</p>
              </div>
              <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl">
                <span className="text-xs text-gray-500 block">Option PCR Ratio</span>
                <h4 className="text-2xl font-extrabold text-amber-400 font-mono mt-1">0.86</h4>
                <p className="text-[11px] text-gray-400 mt-1">Max Pain: $64,000</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                'Deribit & Binance Live Options Surface',
                'Global Forex Sessions (London, NY, Tokyo)',
                'Risk-Free $10,000 Paper Trading Simulator',
                'Telegram VIP Signal Dispatcher',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-950/80 border border-gray-800/50 p-3 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
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
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto text-sm">Click any role card below to view its specific capabilities and access level details.</p>
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

      {/* Features Section */}
      <section id="features" className="px-8 lg:px-20 py-20 border-t border-gray-900 bg-gray-950">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Platform Features</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mt-3">Engineered for Crypto & Forex Desks</h2>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto text-sm">
            Real-time volatility analysis, automated paper orders, and VIP member community tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              icon: '📈',
              title: 'BTC & ETH Option Chain',
              desc: 'Deribit-style option chain showing strikes, daily/weekly/monthly expiries, LTP, IV, Delta, Open Interest, and Put-Call Ratio.',
            },
            {
              icon: '⚡',
              title: '24/7 Live Crypto Feeds',
              desc: 'Instant streaming prices for Bitcoin, Ethereum, Solana, and major altcoins powered by public Binance ticker APIs.',
            },
            {
              icon: '🌍',
              title: 'Global Forex 24/5 Sessions',
              desc: 'Continuous tracking of London, New York, Tokyo, and Sydney liquidity sessions for EUR/USD, GBP/USD, USD/JPY, and more.',
            },
            {
              icon: '🛡️',
              title: '$10,000 Paper Trading Simulator',
              desc: 'Test options scalping and spot strategies with zero financial risk. Track floating P&L in real-time and square off positions.',
            },
            {
              icon: '🤖',
              title: 'Automated Telegram Dispatch',
              desc: 'Broadcast high-conviction trade setups directly to private VIP Telegram groups with automated member invite management.',
            },
            {
              icon: '📊',
              title: 'Real-Time Portfolio Journal',
              desc: 'Track open and closed paper trades, win rates, risk-reward ratios, and member retention in MongoDB.',
            },
          ].map((f, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all space-y-3">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="text-lg font-bold text-white">{f.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-8 lg:px-20 py-24 border-t border-gray-900 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-green-500/10 via-emerald-400/20 to-green-500/10 border border-green-500/30 text-green-300 text-xs font-bold uppercase tracking-widest mb-3">
            <span>⚡</span> Global Crypto & Forex Access Tiers
          </div>
          <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight">
            Invest in Your Trading Future with <span className="text-green-400">Institutional Tools</span>
          </h2>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto text-sm leading-relaxed">
            Full Option Chain analysis, real-time crypto & forex prices, and risk-free paper trading. Use promo code <span className="text-green-400 font-mono font-bold">ROOTS20</span> for 20% off!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10">
          {/* Starter Plan */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-8 flex flex-col justify-between hover:border-gray-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                  Starter Pass
                </span>
                <span className="text-xs text-gray-500 font-mono">Popular with learners</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Crypto & Forex Starter</h3>
              <p className="text-xs text-gray-400 mt-1 mb-6">Live streaming tickers, basic option chain, and $10,000 paper trading.</p>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">$29</span>
                  <span className="text-sm text-gray-500 line-through">$39</span>
                  <span className="text-xs text-gray-400">/month (₹2,499)</span>
                </div>
                <span className="text-[11px] text-green-400 font-semibold block mt-1">
                  Save 20% with code ROOTS20
                </span>
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-800 text-xs text-gray-300">
                {[
                  '24/7 Live Crypto & Forex Streaming Feeds',
                  'Basic BTC & ETH Option Chain Viewer',
                  '$10,000 Risk-Free Paper Trading Simulator',
                  'Community Discord Discussion Access',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-green-400 font-bold">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() =>
                setCheckoutPlan({
                  id: 'starter',
                  name: 'Crypto & Forex Starter',
                  price: '$29',
                })
              }
              className="mt-8 w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3.5 rounded-xl text-xs transition-colors border border-gray-700 cursor-pointer"
            >
              Get Started ($29/mo)
            </button>
          </div>

          {/* Pro Trader - Bestseller */}
          <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border-2 border-green-500/50 rounded-3xl p-8 flex flex-col justify-between shadow-2xl shadow-green-500/10 relative transform lg:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-green-400 text-gray-950 font-black text-[11px] px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
              ⭐ Most Popular • Active Desks
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 mt-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                  Pro Trader Desk
                </span>
                <span className="text-xs text-green-400 font-mono font-bold">Recommended</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white">Full Signals & Option Desk</h3>
              <p className="text-xs text-gray-400 mt-1 mb-6">Designed for active crypto & forex traders and options scalpers.</p>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-green-400">$79</span>
                  <span className="text-sm text-gray-500 line-through">$99</span>
                  <span className="text-xs text-gray-400">/month (₹6,499)</span>
                </div>
                <span className="text-[11px] text-green-400 font-semibold block mt-1">
                  ✓ 20% Discount with code ROOTS20
                </span>
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-800 text-xs text-gray-200">
                {[
                  'Full Deribit-Style Option Chain with Greeks (Delta/IV)',
                  'Put-Call Ratio (PCR) & Max Pain Strike Analytics',
                  'Instant 1-Click Telegram VIP Signal Channel Access',
                  'Advanced Paper Trading with Square-Off & SL/TP',
                  'Priority Trading Desk Support',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-green-400 font-bold">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() =>
                setCheckoutPlan({
                  id: 'pro',
                  name: 'Pro Trader Desk (Forex & Crypto)',
                  price: '$79',
                })
              }
              className="mt-8 w-full bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-gray-950 font-black py-4 rounded-xl text-sm transition-all shadow-lg shadow-green-500/30 cursor-pointer"
            >
              Claim Pro Desk Access ($79/mo) →
            </button>
          </div>

          {/* Institutional / VIP Desk */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-8 flex flex-col justify-between hover:border-gray-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Institutional Desk
                </span>
                <span className="text-xs text-gray-500 font-mono">1-on-1 Mentorship</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Institutional VIP Desk</h3>
              <p className="text-xs text-gray-400 mt-1 mb-6">Complete quantitative mentoring and multi-exchange order flow analytics.</p>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">$199</span>
                  <span className="text-sm text-gray-500 line-through">$249</span>
                  <span className="text-xs text-gray-400">/month (₹15,999)</span>
                </div>
                <span className="text-[11px] text-purple-400 font-semibold block mt-1">
                  Save 20% with code ROOTS20
                </span>
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-800 text-xs text-gray-300">
                {[
                  'Everything in Pro Trader Desk included',
                  '1-on-1 Weekly Zoom Mentorship with Senior Desk Quant',
                  'Custom Algo Trading Setup & Risk Hedging Blueprint',
                  'Private Direct Desk Access (WhatsApp / Telegram VIP)',
                  'Multi-Exchange Order Flow & Liquidation Heatmaps',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-purple-400 font-bold">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() =>
                setCheckoutPlan({
                  id: 'vip',
                  name: 'Institutional VIP Desk',
                  price: '$199',
                })
              }
              className="mt-8 w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl text-xs transition-colors cursor-pointer shadow-lg shadow-purple-600/20"
            >
              Claim VIP Mentorship ($199/mo)
            </button>
          </div>
        </div>
      </section>

      {/* Team Cards Section */}
      <section id="team" className="px-8 lg:px-20 py-20 border-t border-gray-900 bg-gray-950">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-green-400 uppercase tracking-widest">Behind Rising Roots</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mt-3">Meet the Team</h2>
          <p className="text-gray-400 mt-3 text-sm">The quants, developers, and analysts behind RR-Traders.</p>
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
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Core Capabilities</h4>
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
                  <span>📩</span> Request to Join Trading Desk
                </h3>
                <p className="text-xs text-gray-400 mt-1">Submit your request to join our private crypto & forex desks.</p>
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
                    placeholder="Alex Mercer"
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
                    placeholder="alex@example.com"
                    value={reqEmail}
                    onChange={(e) => setReqEmail(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Invite Code</label>
                  <input
                    type="text"
                    placeholder="RR-GLOBAL-2026"
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
                    <option value="Pro Crypto & Forex">Pro Trader ($79/mo)</option>
                    <option value="Institutional VIP Desk">Institutional VIP ($199/mo)</option>
                    <option value="Crypto Starter">Crypto Starter ($29/mo)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Message (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="I trade crypto options and forex and want to join the VIP signal channel."
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

      {/* Realistic Checkout Modal */}
      {checkoutPlan && (
        <CheckoutModal
          plan={checkoutPlan}
          initialPromo="ROOTS20"
          onClose={() => setCheckoutPlan(null)}
        />
      )}

      {/* Footer */}
      <footer className="px-8 lg:px-20 py-10 border-t border-gray-900 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-gray-950 font-black text-xs">
            RR
          </div>
          <span className="text-sm font-semibold text-gray-400">Rising Roots — Crypto & Forex Trading Intelligence</span>
        </div>
        <p className="text-xs text-gray-600">© 2026 Rising Roots. All rights reserved.</p>
        <div className="flex gap-6 text-xs text-gray-500">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Risk Disclosure</a>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
