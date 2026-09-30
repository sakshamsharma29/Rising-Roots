import React, { useEffect, useState } from 'react';

function AiAssistant() {
  const [activeTab, setActiveTab] = useState('evaluator'); // 'evaluator' | 'insights' | 'chat'

  // Evaluator Form State
  const [evalSymbol, setEvalSymbol] = useState('');
  const [evalAssetType, setEvalAssetType] = useState('equity');
  const [evalTradeType, setEvalTradeType] = useState('long');
  const [evalEntry, setEvalEntry] = useState('');
  const [evalStopLoss, setEvalStopLoss] = useState('');
  const [evalTarget, setEvalTarget] = useState('');
  const [evalNotes, setEvalNotes] = useState('');

  const [evalResult, setEvalResult] = useState(null);
  const [evalLoading, setEvalLoading] = useState(false);

  // Pattern Insights State
  const [patternData, setPatternData] = useState({
    hasSufficientData: false,
    message: '',
    insights: [],
  });
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your Rising Roots AI Trading Assistant. Ask me about your win rate, portfolio risk, or strategy improvements.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('rr_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const fetchInsights = () => {
    setInsightsLoading(true);
    fetch(`${API_URL}/api/ai/insights`, { headers })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setPatternData(resData.data);
      })
      .catch(() => {})
      .finally(() => setInsightsLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'insights') {
      fetchInsights();
    }
  }, [activeTab]);

  const handleEvaluateTrade = (e) => {
    e.preventDefault();
    if (!evalSymbol || !evalEntry) return;

    setEvalLoading(true);
    setEvalResult(null);

    fetch(`${API_URL}/api/ai/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        symbol: evalSymbol,
        assetType: evalAssetType,
        tradeType: evalTradeType,
        entryPrice: evalEntry,
        stopLoss: evalStopLoss,
        target: evalTarget,
        notes: evalNotes,
      }),
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setEvalResult(resData.data);
        }
      })
      .catch(() => {})
      .finally(() => setEvalLoading(false));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    fetch(`${API_URL}/api/ai/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message: userMsg }),
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setChatMessages((prev) => [...prev, { sender: 'ai', text: resData.reply }]);
        }
      })
      .catch(() => {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'ai', text: 'Sorry, I am having trouble connecting to the backend service right now.' },
        ]);
      })
      .finally(() => setChatLoading(false));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-3xl font-bold flex items-center gap-3">
            <span>✨</span> AI Trade Insights & Copilot
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Evaluate trade setups, discover historical patterns, and query your portfolio analytics with AI.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('evaluator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'evaluator' ? 'bg-green-500 text-gray-950 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Trade Evaluator
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'insights' ? 'bg-green-500 text-gray-950 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Pattern Insights
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'chat' ? 'bg-green-500 text-gray-950 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            AI Copilot Chat
          </button>
        </div>
      </div>

      {/* Tab 1: Trade Evaluator */}
      {activeTab === 'evaluator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Evaluate Trade Risk & Strategy</h3>
            <p className="text-xs text-gray-400">Input your proposed trade parameters to receive an instant AI grade and risk review.</p>

            <form onSubmit={handleEvaluateTrade} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Symbol *</label>
                  <input
                    type="text"
                    required
                    placeholder="RELIANCE, NIFTY"
                    value={evalSymbol}
                    onChange={(e) => setEvalSymbol(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Asset Class</label>
                  <select
                    value={evalAssetType}
                    onChange={(e) => setEvalAssetType(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none capitalize"
                  >
                    <option value="equity">Equity (Stocks)</option>
                    <option value="crypto">Crypto</option>
                    <option value="options">Options</option>
                    <option value="futures">Futures</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Direction</label>
                  <select
                    value={evalTradeType}
                    onChange={(e) => setEvalTradeType(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none capitalize"
                  >
                    <option value="long">Long</option>
                    <option value="short">Short</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Entry Price (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="2450.00"
                    value={evalEntry}
                    onChange={(e) => setEvalEntry(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Stop Loss (₹)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="2400.00"
                    value={evalStopLoss}
                    onChange={(e) => setEvalStopLoss(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Target Price (₹)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="2550.00"
                  value={evalTarget}
                  onChange={(e) => setEvalTarget(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Setup Notes / Entry Catalyst</label>
                <textarea
                  rows="2"
                  placeholder="Support retest with high buying volume on 15m chart"
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={evalLoading}
                className="w-full bg-green-500 hover:bg-green-400 text-gray-950 font-bold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-green-500/20 cursor-pointer disabled:opacity-50"
              >
                {evalLoading ? 'Running AI Risk Analysis...' : 'Evaluate Trade Setup'}
              </button>
            </form>
          </div>

          {/* AI Analysis Result Output */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col justify-between">
            {evalResult ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase">{evalResult.symbol} Trade Analysis</h3>
                    <p className="text-xs text-gray-400">R:R Ratio: <span className="font-mono text-emerald-400 font-bold">{evalResult.riskRewardRatio}</span></p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-green-400 bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-xl">
                      {evalResult.grade}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">Strategy Grade</p>
                  </div>
                </div>

                {/* AI Summary Banner */}
                <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 text-xs text-gray-300">
                  <span className="font-bold text-green-400">AI Assessment: </span>
                  {evalResult.aiSummary}
                </div>

                {/* Pros */}
                {evalResult.pros.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">✓ Key Advantages</h4>
                    <ul className="space-y-1.5 text-xs text-gray-300">
                      {evalResult.pros.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-400">•</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings */}
                {evalResult.warnings.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">⚠ Risk Warnings</h4>
                    <ul className="space-y-1.5 text-xs text-gray-300">
                      {evalResult.warnings.map((w, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-400">•</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {evalResult.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">💡 Recommendations</h4>
                    <ul className="space-y-1.5 text-xs text-gray-300">
                      {evalResult.recommendations.map((r, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-400">•</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="my-auto text-center py-12 text-gray-500 space-y-2">
                <span className="text-4xl">🤖</span>
                <p className="text-sm text-gray-400 font-medium">Ready for Trade Assessment</p>
                <p className="text-xs text-gray-600 max-w-xs mx-auto">
                  Fill in the trade setup form on the left to receive automated risk & reward AI analysis.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Pattern Insights */}
      {activeTab === 'insights' && (
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">AI-Detected Trading Habits & Patterns</h3>
            <p className="text-xs text-gray-400 mt-1">Automated pattern extraction based on your logged trade journal history.</p>
          </div>

          {insightsLoading ? (
            <div className="text-center py-12 text-gray-500">Analyzing trade journal history...</div>
          ) : !patternData.hasSufficientData ? (
            <div className="bg-gray-950 p-8 rounded-xl border border-gray-800 text-center space-y-2">
              <span className="text-3xl">📊</span>
              <p className="text-sm font-semibold text-white">{patternData.message}</p>
              <p className="text-xs text-gray-500">Log trades in your Trade Journal to generate personalized insights.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patternData.insights.map((ins, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border ${
                    ins.type === 'strength'
                      ? 'bg-green-500/10 border-green-500/20 text-green-300'
                      : ins.type === 'warning'
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                      : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                  }`}
                >
                  <h4 className="font-bold text-sm mb-1">{ins.title}</h4>
                  <p className="text-xs opacity-90">{ins.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: AI Copilot Chat */}
      {activeTab === 'chat' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col h-[520px]">
          {/* Chat Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-green-500 text-gray-950'
                      : 'bg-gradient-to-tr from-emerald-500 to-green-400 text-gray-950'
                  }`}
                >
                  {msg.sender === 'user' ? 'You' : 'AI'}
                </div>
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-green-500 text-gray-950 font-medium'
                      : 'bg-gray-950 border border-gray-800 text-gray-200'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-3 max-w-xl">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-gray-950 flex items-center justify-center text-xs font-bold shrink-0">
                  AI
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800 text-xs text-gray-400 italic">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 bg-gray-950 border-t border-gray-800 flex gap-3">
            <input
              type="text"
              placeholder="Ask AI about your win rate, portfolio risk, or strategy..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none"
            />
            <button
              type="submit"
              disabled={chatLoading}
              className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AiAssistant;
