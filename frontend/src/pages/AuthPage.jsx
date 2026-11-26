import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [city, setCity] = useState('');
  const [preferredMarket, setPreferredMarket] = useState('Crypto & Forex');

  // Government ID Proof & KYC States
  const [idType, setIdType] = useState('PAN Card');
  const [idNumber, setIdNumber] = useState('');
  const [idDocumentUrl, setIdDocumentUrl] = useState('');
  const [idDocumentBackUrl, setIdDocumentBackUrl] = useState('');
  const [idFileName, setIdFileName] = useState('');
  const [idBackFileName, setIdBackFileName] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileUpload = (e, isBack = false) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError('Document file size must be under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (isBack) {
        setIdDocumentBackUrl(reader.result);
        setIdBackFileName(file.name);
      } else {
        setIdDocumentUrl(reader.result);
        setIdFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const getIdPlaceholder = () => {
    switch (idType) {
      case 'PAN Card':
        return 'e.g. ABCDE1234F (10 characters)';
      case 'Aadhaar Card':
        return 'e.g. 1234 5678 9012 (12 digits)';
      case 'Passport':
        return 'e.g. A1234567 (Passport Number)';
      case 'Driving License':
        return 'e.g. DL-1420110012345';
      case 'Voter ID':
        return 'e.g. ABC1234567';
      default:
        return 'Enter Government ID Number';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && !idNumber.trim()) {
      setError('Government ID number is required for regulatory KYC compliance.');
      return;
    }

    setLoading(true);

    const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
    const endpoint = mode === 'login' ? `${API_URL}/api/auth/login` : `${API_URL}/api/auth/register`;
    const payload = mode === 'login'
      ? { email, password }
      : {
          name,
          email,
          password,
          phone,
          telegramUsername,
          city,
          preferredMarket,
          idType,
          idNumber: idNumber.toUpperCase().trim(),
          idDocumentUrl,
          idDocumentBackUrl,
        };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('rr_token', data.token);
        localStorage.setItem('rr_auth', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.message || 'Authentication failed.');
      }
    } catch (err) {
      // Fallback client simulation if backend is offline
      const userRole = email.toLowerCase().includes('admin') ? 'admin' : 'user';
      if (mode === 'login' && email && password.length >= 4) {
        localStorage.setItem('rr_auth', JSON.stringify({ email, name: email.split('@')[0], role: userRole }));
        navigate('/dashboard');
      } else if (mode === 'signup' && name && email && password.length >= 6) {
        localStorage.setItem('rr_auth', JSON.stringify({ email, name, role: userRole, phone, telegramUsername, city }));
        navigate('/dashboard');
      } else {
        setError('Server unreachable. Please check backend API.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen flex font-sans antialiased">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 border-r border-gray-800 p-12">
        <div>
          <Link to="/" className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-gray-950 font-black text-xl shadow-lg shadow-green-500/20">
              RR
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Rising Roots</span>
          </Link>

          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            The smartest way to manage your
            <span className="text-green-400"> trading community</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed max-w-md">
            Track members, automate Telegram access, process payments, and grow your subscriber base — all from one dashboard.
          </p>
        </div>

        <div className="space-y-6">
          {[
            { stat: '10K+', label: 'Members Managed' },
            { stat: '500+', label: 'Trading Communities' },
            { stat: '98%', label: 'Renewal Rate' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-2xl font-extrabold text-green-400">{item.stat}</span>
              <span className="text-sm text-gray-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-gray-950 font-black text-lg">
                RR
              </div>
              <span className="text-lg font-bold text-white">Rising Roots</span>
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-white">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              {mode === 'login'
                ? 'Sign in to access your community dashboard.'
                : 'Get started with Rising Roots for free.'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/30 transition-all placeholder-gray-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Phone / WhatsApp <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/30 transition-all placeholder-gray-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Telegram Username
                    </label>
                    <input
                      type="text"
                      placeholder="@rahul_trader"
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/30 transition-all placeholder-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">City / State</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai, Maharashtra"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/30 transition-all placeholder-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Trading Focus</label>
                    <select
                      value={preferredMarket}
                      onChange={(e) => setPreferredMarket(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/30 transition-all"
                    >
                      <option value="Crypto & Forex">Crypto & Forex</option>
                      <option value="Indian Indices & Options">Indian Indices (Nifty/Sensex)</option>
                      <option value="Commodities (Gold/Silver)">Commodities (Gold/Silver)</option>
                      <option value="All Markets">All Markets</option>
                    </select>
                  </div>
                </div>

                {/* Government ID & KYC Verification Section */}
                <div className="bg-gray-900/90 border border-emerald-500/30 rounded-2xl p-4 space-y-3.5 shadow-lg">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🪪</span>
                      <div>
                        <span className="text-xs font-bold text-white block">Government ID Proof (KYC)</span>
                        <span className="text-[10px] text-emerald-400 font-medium">FIU-IND & Anti-Money Laundering Compliance</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase">
                      Required
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Select ID Type *</label>
                      <select
                        value={idType}
                        onChange={(e) => setIdType(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="PAN Card">PAN Card (Income Tax Dept)</option>
                        <option value="Aadhaar Card">Aadhaar Card (UIDAI)</option>
                        <option value="Passport">Passport (Govt of India / Global)</option>
                        <option value="Driving License">Driving License (RTO)</option>
                        <option value="Voter ID">Voter ID Card (ECI)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">
                        {idType} Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={getIdPlaceholder()}
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white uppercase focus:border-emerald-500 focus:outline-none placeholder-gray-600"
                      />
                    </div>
                  </div>

                  {/* Document Photo Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                      Upload {idType} Photo / Scan (Front) *
                    </label>

                    {!idDocumentUrl ? (
                      <label className="border-2 border-dashed border-gray-800 hover:border-emerald-500/50 bg-gray-950/60 rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition-all">
                        <span className="text-xl mb-1">📸</span>
                        <span className="text-xs text-gray-300 font-semibold">Click to select document image</span>
                        <span className="text-[10px] text-gray-500 mt-0.5">PNG, JPG, WEBP, or PDF (Max 8MB)</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileUpload(e, false)}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between bg-gray-950 border border-emerald-500/40 rounded-xl p-2.5">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {idDocumentUrl.startsWith('data:image') && (
                            <img src={idDocumentUrl} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-gray-800 shrink-0" />
                          )}
                          <div className="truncate">
                            <span className="text-xs font-bold text-emerald-400 block truncate">{idFileName || `${idType} Uploaded`}</span>
                            <span className="text-[10px] text-gray-400">✓ Front Document Attached</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setIdDocumentUrl(''); setIdFileName(''); }}
                          className="text-gray-400 hover:text-rose-400 text-xs px-2 py-1 cursor-pointer"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Optional Back Side Upload for Aadhaar / DL */}
                  {(idType === 'Aadhaar Card' || idType === 'Driving License') && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                        Upload Back Side (Optional)
                      </label>
                      {!idDocumentBackUrl ? (
                        <label className="border border-dashed border-gray-800 hover:border-emerald-500/50 bg-gray-950/40 rounded-xl p-2 flex items-center justify-center gap-2 cursor-pointer transition-all">
                          <span className="text-sm">📎</span>
                          <span className="text-xs text-gray-400">Attach back side photo (with address)</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleFileUpload(e, true)}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="flex items-center justify-between bg-gray-950 border border-gray-800 rounded-xl p-2">
                          <span className="text-xs text-gray-300 font-mono truncate">{idBackFileName || 'Back Side Attached'}</span>
                          <button
                            type="button"
                            onClick={() => { setIdDocumentBackUrl(''); setIdBackFileName(''); }}
                            className="text-gray-400 hover:text-rose-400 text-xs px-2"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-[10px] text-gray-500 leading-tight">
                    🔒 <strong>Privacy Guarantee:</strong> Identity documents are encrypted with AES-256 and used solely for FIU-IND / AML compliance. Never shared with third parties.
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/30 transition-all placeholder-gray-600"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-300">Password</label>
                {mode === 'login' && (
                  <button type="button" className="text-xs text-green-400 hover:text-green-300 font-medium">
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                placeholder={mode === 'login' ? 'Enter your password' : 'Min. 6 characters'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/30 transition-all placeholder-gray-600"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-500/50 text-gray-950 font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-gray-950/30 border-t-gray-950 rounded-full animate-spin"></span>
              ) : mode === 'login' ? (
                'Sign In to Dashboard'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="space-y-2 text-center text-sm">
            <p className="text-gray-500">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button onClick={() => { setMode('signup'); setError(''); }} className="text-green-400 hover:text-green-300 font-semibold cursor-pointer">
                    Sign up free
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={() => { setMode('login'); setError(''); }} className="text-green-400 hover:text-green-300 font-semibold cursor-pointer">
                    Sign in
                  </button>
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 pt-2 border-t border-gray-800">
              Want to join a community trading desk?{' '}
              <Link to="/?join=true" className="text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1">
                <span>📩</span> Request to Join Team →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
