import React, { useEffect, useState } from 'react';
import CheckoutModal from '../components/CheckoutModal';

function Plans() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API_URL}/api/plans`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPlans(data.data);
      })
      .catch(() => {
        setPlans([
          {
            id: 'starter',
            name: 'Starter Community Pass',
            price: '₹999/mo',
            subscribers: 268,
            status: 'Active',
            features: ['Discord Access', 'Daily Market Briefing', 'Educational Content', 'Weekly Q&A'],
          },
          {
            id: 'pro',
            name: 'Pro Trader Desk',
            price: '₹2,499/mo',
            subscribers: 620,
            status: 'Active',
            features: [
              'Daily Trading Signals',
              'Live Stream Access',
              'Telegram VIP Group',
              'Target 1 & 2 Trailing Alerts',
              'Priority Support',
            ],
          },
          {
            id: 'vip',
            name: 'VIP Signals & Mentorship',
            price: '₹4,999/mo',
            subscribers: 362,
            status: 'Active',
            features: [
              '1-on-1 Mentorship',
              'Options Scalping Signals',
              'Algo Trading Bot Access',
              'Private WhatsApp Desk',
              'Priority Support',
            ],
          },
        ]);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-3xl font-bold flex items-center gap-3">
            <span>Pricing Plans & Membership Tiers</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Institutional & Retail Tiers
            </span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage subscription pricing, active perks, and member checkout portals. Apply code <span className="text-emerald-400 font-mono font-bold">ROOTS20</span> at checkout!
          </p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isPro = plan.id === 'pro' || plan.name.toLowerCase().includes('pro');
          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 flex flex-col justify-between transition-all space-y-6 relative ${
                isPro
                  ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border-2 border-emerald-500/50 shadow-xl shadow-emerald-500/10'
                  : 'bg-gray-900 border border-gray-800 hover:border-gray-700'
              }`}
            >
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-green-400 text-gray-950 font-black text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                  ⭐ Most Popular • Active Desks
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                      isPro
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-green-500/10 text-green-400 border-green-500/20'
                    }`}
                  >
                    {plan.status}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">{plan.subscribers} active</span>
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">{plan.name}</h2>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className={`text-3xl font-extrabold ${isPro ? 'text-emerald-400' : 'text-white'}`}>
                    {plan.price}
                  </span>
                  <span className="text-[11px] text-gray-400">/month</span>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-800">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Included Perks:</p>
                  {plan.features?.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                      <svg
                        className={`w-4 h-4 shrink-0 ${isPro ? 'text-emerald-400' : 'text-green-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedPlan(plan)}
                className={`w-full font-bold py-3.5 rounded-xl transition-all cursor-pointer text-sm shadow-md ${
                  isPro
                    ? 'bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-gray-950 shadow-emerald-500/20'
                    : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                }`}
              >
                {isPro ? 'Subscribe to Pro Desk →' : 'Subscribe / Renew Plan'}
              </button>
            </div>
          );
        })}
      </div>

      {/* High-Fidelity Checkout Modal */}
      {selectedPlan && (
        <CheckoutModal
          plan={selectedPlan}
          initialPromo="ROOTS20"
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
}

export default Plans;
