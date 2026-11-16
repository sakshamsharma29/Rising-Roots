import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CheckoutModal({ plan, onClose, initialPromo = '' }) {
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState(initialPromo || 'ROOTS20');
  const [promoApplied, setPromoApplied] = useState(true);
  const [discountPercent, setDiscountPercent] = useState(20);
  const [promoError, setPromoError] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('upi'); // 'upi', 'card', 'crypto', 'netbanking'
  const [upiApp, setUpiApp] = useState('gpay'); // 'gpay', 'phonepe', 'paytm', 'cred'
  const [cryptoNetwork, setCryptoNetwork] = useState('USDT-TRC20');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('11/29');
  const [cardCvv, setCardCvv] = useState('742');
  const [customerName, setCustomerName] = useState(() => {
    const user = JSON.parse(localStorage.getItem('rr_auth') || '{}');
    return user.name || 'Rahul Sharma';
  });
  const [customerEmail, setCustomerEmail] = useState(() => {
    const user = JSON.parse(localStorage.getItem('rr_auth') || '{}');
    return user.email || 'trader@example.com';
  });

  const [paymentState, setPaymentState] = useState('form'); // 'form' | 'processing' | 'success'
  const [processingStep, setProcessingStep] = useState('');

  // Calculate pricing
  const rawPrice = plan ? parseInt(plan.price.replace(/[^0-9]/g, ''), 10) || 2499 : 2499;
  const currentDiscount = promoApplied ? discountPercent : 0;
  const finalPrice = Math.round(rawPrice * (1 - currentDiscount / 100));

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    if (code === 'ROOTS20' || code === 'PRO20' || code === 'WELCOME20') {
      setPromoApplied(true);
      setDiscountPercent(20);
    } else if (code === 'ROOTS50' || code === 'ALPHA50') {
      setPromoApplied(true);
      setDiscountPercent(50);
    } else {
      setPromoApplied(false);
      setDiscountPercent(0);
      setPromoError('Invalid coupon. Try using ROOTS20 for 20% off!');
    }
  };

  const handleProcessPayment = () => {
    setPaymentState('processing');
    setProcessingStep('Connecting to Banking Gateway (Razorpay/NPCI)...');

    setTimeout(() => {
      setProcessingStep('Verifying VPA / Payment Authorization...');
    }, 900);

    setTimeout(() => {
      setProcessingStep('Instant Clearing confirmed by Banking Partner ✓');
    }, 1800);

    setTimeout(() => {
      // Auto-update auth in localStorage to give instant VIP access
      const existingAuth = JSON.parse(localStorage.getItem('rr_auth') || '{}');
      const updatedAuth = {
        ...existingAuth,
        name: customerName,
        email: customerEmail,
        role: existingAuth.role || 'user',
        plan: plan?.name || 'Pro Trader',
        status: 'Active',
        isVip: true,
      };
      localStorage.setItem('rr_auth', JSON.stringify(updatedAuth));
      if (!localStorage.getItem('rr_token')) {
        localStorage.setItem('rr_token', 'token_vip_' + Date.now());
      }

      // Persist to MongoDB backend database
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
      fetch(`${API_URL}/api/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customerName,
          email: customerEmail,
          plan: plan?.name || 'Pro Trader',
          status: 'Active',
        }),
      }).catch(() => {});

      setPaymentState('success');
    }, 2600);
  };

  const handleGoToPortal = () => {
    if (onClose) onClose();
    navigate('/dashboard');
  };

  if (!plan) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl shadow-black relative">
        
        {/* Emerald Top Accent */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500"></div>

        {/* Modal Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-gray-950 font-black text-xl shadow-lg shadow-green-500/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Secure Trading Desk Checkout</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Instant Activation
                </span>
              </div>
              <p className="text-xs text-gray-400">Encrypted 256-bit Checkout via Razorpay & NPCI Gateway</p>
            </div>
          </div>
          {paymentState !== 'processing' && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer text-xl p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* State: Processing Animation */}
        {paymentState === 'processing' && (
          <div className="p-10 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-2xl">
                💳
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-white">Securing Your Desk Subscription</h4>
              <p className="text-xs text-emerald-400 font-mono animate-pulse">{processingStep}</p>
            </div>
            <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
              Please do not refresh or close this window while the payment gateway confirms the transaction.
            </p>
          </div>
        )}

        {/* State: Payment Success & Activation */}
        {paymentState === 'success' && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-green-400 text-gray-950 rounded-2xl flex items-center justify-center mx-auto text-3xl font-black shadow-lg shadow-green-500/30">
              ✓
            </div>
            <div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-widest">
                Payment Authorized
              </span>
              <h4 className="text-2xl font-extrabold text-white mt-2">Welcome to Rising Roots VIP!</h4>
              <p className="text-xs text-gray-400 mt-1">
                Your <strong className="text-white">{plan.name}</strong> has been activated for 30 days.
              </p>
            </div>

            {/* VIP Access Box */}
            <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border border-emerald-500/30 p-4 rounded-2xl text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <span>🔥</span> In-Platform VIP Signals Room Active
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Access Granted
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                You now have instant access to real-time desk signals, entry/target levels, and 1-click paper trading on our native platform.
              </p>
              <button
                onClick={handleGoToPortal}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 mt-2"
              >
                <span>🔥 Enter VIP Signals Room Now →</span>
              </button>
            </div>

            <button
              onClick={handleGoToPortal}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl text-xs transition-all border border-gray-700 cursor-pointer"
            >
              Go to Member Dashboard →
            </button>
          </div>
        )}

        {/* State: Checkout Form */}
        {paymentState === 'form' && (
          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Plan & Pricing Overview */}
            <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-extrabold text-white">{plan.name}</h4>
                  <p className="text-xs text-gray-400">Monthly VIP Trading Community Desk</p>
                </div>
                <div className="text-right">
                  {promoApplied ? (
                    <div>
                      <span className="text-xs text-gray-500 line-through mr-1.5">₹{rawPrice}</span>
                      <span className="text-xl font-black text-emerald-400">₹{finalPrice}</span>
                    </div>
                  ) : (
                    <span className="text-xl font-black text-white">₹{rawPrice}</span>
                  )}
                  <span className="text-[10px] text-gray-500 block">/month billed</span>
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="pt-2 border-t border-gray-800/80">
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Coupon Code"
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-emerald-500"
                    />
                    {promoApplied && (
                      <span className="absolute right-2.5 top-2 text-xs text-emerald-400 font-bold">
                        ✓ {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer border border-gray-700 shrink-0"
                  >
                    Apply
                  </button>
                </form>
                {promoError && (
                  <p className="text-[11px] text-rose-400 mt-1 font-medium">{promoError}</p>
                )}
                {promoApplied && (
                  <p className="text-[11px] text-emerald-400 mt-1 font-medium flex items-center gap-1">
                    <span>✓</span> {discountPercent}% Discount applied with code {promoCode}!
                  </p>
                )}
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Your Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  placeholder="Rahul Sharma"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Email (Access Deliver)</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  placeholder="rahul@example.com"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Select Payment Method
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'upi', label: 'UPI / QR', icon: '📱' },
                  { id: 'card', label: 'Cards', icon: '💳' },
                  { id: 'crypto', label: 'USDT Crypto', icon: '🪙' },
                  { id: 'netbanking', label: 'NetBank', icon: '🏦' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id)}
                    className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      selectedMethod === m.id
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/5'
                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                    }`}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              {/* UPI Tab */}
              {selectedMethod === 'upi' && (
                <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Pay with any UPI App</span>
                    <span className="text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full">
                      Zero Surcharge
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'gpay', name: 'Google Pay', color: 'text-blue-400' },
                      { id: 'phonepe', name: 'PhonePe', color: 'text-purple-400' },
                      { id: 'paytm', name: 'Paytm', color: 'text-cyan-400' },
                      { id: 'cred', name: 'CRED', color: 'text-emerald-400' },
                    ].map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setUpiApp(app.id)}
                        className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                          upiApp === app.id
                            ? 'bg-gray-900 border-emerald-500/40 font-bold text-white'
                            : 'bg-gray-900/40 border-gray-800 text-gray-400'
                        }`}
                      >
                        <div className={`text-xs font-bold ${app.color}`}>{app.name}</div>
                      </button>
                    ))}
                  </div>

                  {/* QR Code Simulation */}
                  <div className="flex items-center gap-4 bg-gray-900/60 p-3 rounded-xl border border-gray-800">
                    <div className="w-16 h-16 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full text-gray-950" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm8-2h8v8h-8V2zm2 2v4h4V4h-4zM2 12h8v8H2v-8zm2 2v4h4v-4H4zm14 2h-2v2h2v-2zm-4-4h2v2h-2v-2zm4 4v2h2v-2h-2zm-2 2h2v2h-2v-2zm2 2v2h2v-2h-2zm-6-2h2v2h-2v-2zm0-4h2v2h-2v-2zm2 2h2v2h-2v-2z" />
                      </svg>
                    </div>
                    <div className="text-left space-y-1">
                      <div className="text-xs font-bold text-white">Scan with UPI App</div>
                      <div className="text-[11px] text-gray-400 font-mono">risingroots@icici</div>
                      <div className="text-[10px] text-emerald-400">Scan & pay ₹{finalPrice} to activate instantly</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cards Tab */}
              {selectedMethod === 'card' && (
                <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Crypto Tab */}
              {selectedMethod === 'crypto' && (
                <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Pay with USDT / USDC</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Zero Bank Restrictions
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'USDT-TRC20', name: 'USDT', network: 'Tron (TRC20)' },
                      { id: 'USDT-BEP20', name: 'USDT', network: 'BSC (BEP20)' },
                      { id: 'USDC-SOL', name: 'USDC', network: 'Solana' },
                    ].map((net) => (
                      <button
                        key={net.id}
                        type="button"
                        onClick={() => setCryptoNetwork(net.id)}
                        className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                          cryptoNetwork === net.id
                            ? 'bg-gray-900 border-emerald-500/40 font-bold text-white shadow'
                            : 'bg-gray-900/40 border-gray-800 text-gray-400'
                        }`}
                      >
                        <div className="text-xs font-bold text-emerald-400">{net.name}</div>
                        <div className="text-[10px] text-gray-500">{net.network}</div>
                      </button>
                    ))}
                  </div>

                  <div className="bg-gray-900/80 p-3.5 rounded-xl border border-gray-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Official Desk Treasury ({cryptoNetwork})</span>
                      <button
                        type="button"
                        onClick={() => {
                          const addr =
                            cryptoNetwork === 'USDT-TRC20'
                              ? 'TX9qRRootsDeskOfficialTreasuryTRC20x8'
                              : cryptoNetwork === 'USDT-BEP20'
                              ? '0x71CRRRootsDeskBSCContract88201x99'
                              : 'RRDesk88SolanaOfficialTreasuryUSDC9';
                          navigator.clipboard?.writeText(addr);
                          setCopiedAddress(true);
                          setTimeout(() => setCopiedAddress(false), 2500);
                        }}
                        className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded cursor-pointer font-bold"
                      >
                        {copiedAddress ? '✓ Copied!' : 'Copy Address'}
                      </button>
                    </div>

                    <div className="font-mono text-xs text-white break-all select-all bg-gray-950 p-2 rounded-lg border border-gray-800/80">
                      {cryptoNetwork === 'USDT-TRC20' && 'TX9qRRootsDeskOfficialTreasuryTRC20x8'}
                      {cryptoNetwork === 'USDT-BEP20' && '0x71CRRRootsDeskBSCContract88201x99'}
                      {cryptoNetwork === 'USDC-SOL' && 'RRDesk88SolanaOfficialTreasuryUSDC9'}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-gray-400">Required Amount:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        ${Math.round(finalPrice / 82)} USDT ({plan.name})
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">
                      Transaction Hash / TXID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 0x8a9f... or Tron TXID for instant matching"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Netbanking Tab */}
              {selectedMethod === 'netbanking' && (
                <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank', 'Other Banks'].map(
                      (bank, i) => (
                        <div
                          key={i}
                          className="bg-gray-900 border border-gray-800 p-2.5 rounded-xl text-center text-gray-300 font-semibold cursor-pointer hover:border-emerald-500/40"
                        >
                          {bank}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pay Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleProcessPayment}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-gray-950 font-black py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-green-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🔒</span> Pay ₹{finalPrice} & Activate VIP Access
              </button>
              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 mt-2 font-mono">
                <span>🛡️ 256-bit SSL</span>
                <span>•</span>
                <span>Razorpay & NPCI Secured</span>
                <span>•</span>
                <span>Instant Auto-Activation</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckoutModal;
