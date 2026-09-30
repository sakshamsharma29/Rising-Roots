import React, { useEffect, useState } from 'react';

function Plans() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null); // Plan object when checking out
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const user = JSON.parse(localStorage.getItem('rr_auth') || '{}');

  useEffect(() => {
    fetch(`${API_URL}/api/plans`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPlans(data.data);
      })
      .catch(() => {
        setPlans([
          {
            id: 'pro',
            name: 'Pro Trader',
            price: '₹2,499/mo',
            subscribers: 620,
            status: 'Active',
            features: ['Daily Trading Signals', 'Live Stream Access', 'Telegram VIP Group', 'Weekly Q&A'],
          },
          {
            id: 'vip',
            name: 'VIP Signals & Mentorship',
            price: '₹4,999/mo',
            subscribers: 362,
            status: 'Active',
            features: ['1-on-1 Mentorship', 'Options Scalping Signals', 'Algo Trading Bot Access', 'Priority Support'],
          },
          {
            id: 'starter',
            name: 'Community Pass',
            price: '₹999/mo',
            subscribers: 268,
            status: 'Active',
            features: ['Discord Access', 'Daily Market Briefing', 'Educational Content'],
          },
        ]);
      });
  }, []);

  const handleCheckout = (plan) => {
    setSelectedPlan(plan);
    setPaymentSuccess(false);
  };

  const handleConfirmPayment = () => {
    if (!selectedPlan) return;
    setLoading(true);

    // 1. Create order
    fetch(`${API_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: selectedPlan.id,
        memberEmail: user.email || 'user@risingroots.com',
      }),
    })
      .then((res) => res.json())
      .then((orderData) => {
        if (orderData.success) {
          // 2. Verify payment & extend subscription
          return fetch(`${API_URL}/api/payments/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: orderData.order.orderId,
              paymentId: `pay_${Date.now()}`,
              memberEmail: user.email || 'user@risingroots.com',
              planId: selectedPlan.id,
              days: 30,
            }),
          });
        }
        throw new Error('Order creation failed');
      })
      .then((res) => res.json())
      .then((verifyData) => {
        if (verifyData.success) {
          setPaymentSuccess(true);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-3xl font-bold">Pricing Plans & Membership Tiers</h1>
          <p className="text-gray-400 text-sm mt-1">Manage subscription pricing, active perks, and member checkout portals.</p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between hover:border-gray-700 transition-all space-y-6"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                  {plan.status}
                </span>
                <span className="text-xs text-gray-400 font-mono">{plan.subscribers} active</span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">{plan.name}</h2>
              <div className="text-3xl font-extrabold text-white mb-6">{plan.price}</div>

              <div className="space-y-3 pt-4 border-t border-gray-800">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Included Perks:</p>
                {plan.features?.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleCheckout(plan)}
              className="w-full bg-green-500 hover:bg-green-400 text-gray-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-500/10 cursor-pointer text-sm"
            >
              Subscribe / Renew Plan
            </button>
          </div>
        ))}
      </div>

      {/* Razorpay Checkout Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">💳</span>
                <h3 className="text-lg font-bold text-white">Razorpay Secure Checkout</h3>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {paymentSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto text-2xl">
                    ✓
                  </div>
                  <h4 className="text-xl font-bold text-white">Payment Successful!</h4>
                  <p className="text-xs text-gray-300">
                    Your subscription to <span className="font-bold text-white">{selectedPlan.name}</span> has been activated for 30 days.
                  </p>
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="mt-4 bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-6 py-2 rounded-xl text-xs cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Selected Plan:</span>
                      <span className="text-white font-bold">{selectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-green-400 font-mono font-bold">{selectedPlan.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subscriber Account:</span>
                      <span className="text-white font-mono">{user.email || 'user@risingroots.com'}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500">
                    Clicking "Pay & Activate" simulates a completed Razorpay gateway transaction and extends your community access for +30 days.
                  </p>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedPlan(null)}
                      className="px-4 py-2 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmPayment}
                      disabled={loading}
                      className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-5 py-2 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Processing Payment...' : `Pay ${selectedPlan.price}`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Plans;
