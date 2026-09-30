import Trade from '../models/Trade.js';

// Analyze a specific trade execution or setup
export const analyzeTradeSetup = async (tradeData) => {
  const { symbol, assetType, tradeType, entryPrice, stopLoss, target, quantity, notes } = tradeData;

  const entry = Number(entryPrice);
  const sl = stopLoss ? Number(stopLoss) : null;
  const tp = target ? Number(target) : null;

  let riskRewardRatio = null;
  let riskPercent = null;

  if (sl && tp) {
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    riskRewardRatio = risk > 0 ? parseFloat((reward / risk).toFixed(2)) : null;
    riskPercent = parseFloat(((risk / entry) * 100).toFixed(2));
  }

  // Strategic Assessment logic
  let grade = 'B+';
  let riskLevel = 'Medium';
  const pros = [];
  const warnings = [];
  const recommendations = [];

  if (riskRewardRatio) {
    if (riskRewardRatio >= 2.0) {
      pros.push(`Excellent Risk:Reward Ratio of 1:${riskRewardRatio} (industry standard is >= 1:2).`);
      grade = 'A';
    } else if (riskRewardRatio < 1.0) {
      warnings.push(`Poor Risk:Reward Ratio of 1:${riskRewardRatio}. Potential reward is less than risk taken.`);
      grade = 'C';
      riskLevel = 'High';
    } else {
      pros.push(`Acceptable Risk:Reward Ratio of 1:${riskRewardRatio}.`);
    }
  } else {
    warnings.push('No Stop-Loss or Target defined. Trading without SL increases tail risk.');
    riskLevel = 'High';
    grade = 'B-';
  }

  if (riskPercent && riskPercent > 5) {
    warnings.push(`Stop-Loss distance is ${riskPercent}% from entry, which exceeds the recommended 2-3% risk per trade.`);
  }

  if (assetType === 'options') {
    warnings.push('Options positions decay rapidly due to Theta. Ensure strict time-based exit rules.');
  } else if (assetType === 'crypto') {
    pros.push('24/7 liquidity available, but monitor high overnight volatility.');
  }

  if (notes && notes.length > 10) {
    pros.push('Well-documented entry rationale in trade journal notes.');
  } else {
    recommendation: recommendations.push('Add specific entry catalyst (e.g. support retest, breakout volume) in notes.');
  }

  recommendations.push('Maintain strict position sizing to risk no more than 1-2% of total account capital per trade.');

  return {
    symbol,
    assetType,
    tradeType,
    riskRewardRatio: riskRewardRatio ? `1:${riskRewardRatio}` : 'N/A',
    riskPercent: riskPercent ? `${riskPercent}%` : 'N/A',
    grade,
    riskLevel,
    pros,
    warnings,
    recommendations,
    aiSummary: `Trade setup for ${symbol} (${assetType.toUpperCase()}) carries ${riskLevel.toLowerCase()} risk with a grade of ${grade}. ${
      warnings.length > 0 ? warnings[0] : 'Setup aligns with disciplined risk management.'
    }`,
  };
};

// Generate pattern insights from historical trades
export const generatePatternInsights = async (userId) => {
  const trades = await Trade.find({ userId, exitPrice: { $ne: null } });

  if (trades.length < 2) {
    return {
      hasSufficientData: false,
      message: 'Log at least 3-5 closed trades to unlock AI pattern detection & win-rate insights.',
      insights: [],
    };
  }

  const insights = [];

  // 1. Asset Performance Comparison
  const assetPnl = {};
  trades.forEach((t) => {
    assetPnl[t.assetType] = (assetPnl[t.assetType] || 0) + (t.pnl || 0);
  });

  const bestAsset = Object.entries(assetPnl).reduce((max, a) => (a[1] > max[1] ? a : max), ['', -Infinity]);
  const worstAsset = Object.entries(assetPnl).reduce((min, a) => (a[1] < min[1] ? a : min), ['', Infinity]);

  if (bestAsset[0] && bestAsset[1] > 0) {
    insights.push({
      type: 'strength',
      title: `Highest Profitability in ${bestAsset[0].toUpperCase()}`,
      description: `You have generated ₹${bestAsset[1].toFixed(2)} in ${bestAsset[0]} trades. Consider allocating more focus to this asset class.`,
    });
  }

  if (worstAsset[0] && worstAsset[1] < 0) {
    insights.push({
      type: 'warning',
      title: `Loss Concentration in ${worstAsset[0].toUpperCase()}`,
      description: `Your ${worstAsset[0]} trades have accumulated ₹${Math.abs(worstAsset[1]).toFixed(2)} in net losses. Review your risk parameters on these setups.`,
    });
  }

  // 2. Win Rate Analysis
  const wins = trades.filter((t) => t.outcome === 'win').length;
  const winRate = parseFloat(((wins / trades.length) * 100).toFixed(1));

  if (winRate >= 60) {
    insights.push({
      type: 'strength',
      title: `Strong Overall Win Rate (${winRate}%)`,
      description: 'Your trade selection accuracy is above average. Focus on letting winning trades run to maximize reward.',
    });
  } else {
    insights.push({
      type: 'suggestion',
      title: `Win Rate Optimization (${winRate}%)`,
      description: 'Focus on improving entry timing and ensuring your Risk:Reward ratio is at least 1:2 to maintain profitability.',
    });
  }

  return {
    hasSufficientData: true,
    totalClosedTradesAnalyzed: trades.length,
    winRate: `${winRate}%`,
    insights,
  };
};
