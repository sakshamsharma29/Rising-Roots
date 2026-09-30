import React, { useState } from 'react';

function Settings() {
  const [botToken, setBotToken] = useState('7891234567:AAF89x_RisingRootsBotKey');
  const [webhookUrl, setWebhookUrl] = useState('https://api.risingroots.io/webhooks/telegram');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-white text-3xl font-bold">Community & Bot Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Configure Telegram & Discord bot automation, webhooks, and notifications.</p>
      </div>

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          Settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Telegram Bot Token</label>
          <input
            type="text"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-green-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">Used to automatically grant/revoke access to private Telegram signal channels.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Payment Webhook Endpoint</label>
          <input
            type="text"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-green-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">Stripe / Razorpay payment event webhook listener URL.</p>
        </div>

        <div className="pt-4 border-t border-gray-800 flex justify-end">
          <button type="submit" className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;
