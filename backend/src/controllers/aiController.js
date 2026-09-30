import { analyzeTradeSetup, generatePatternInsights } from '../services/aiService.js';
import Trade from '../models/Trade.js';

// Analyze a specific trade payload
export const analyzeTrade = async (req, res) => {
  try {
    const tradeData = req.body;
    if (!tradeData.symbol || !tradeData.entryPrice) {
      return res.status(400).json({ success: false, message: 'Symbol and entry price are required for AI analysis.' });
    }

    const analysis = await analyzeTradeSetup(tradeData);
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pattern insights derived from user's trade journal history
export const getPatternInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const insightsData = await generatePatternInsights(userId);
    res.json({ success: true, data: insightsData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Conversational AI Assistant Chat Endpoint
export const chatWithAi = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Prompt message is required.' });
    }

    const userTrades = await Trade.find({ userId });
    const openCount = userTrades.filter((t) => t.exitPrice === null).length;
    const closedTrades = userTrades.filter((t) => t.exitPrice !== null);
    const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const wins = closedTrades.filter((t) => t.outcome === 'win').length;
    const winRate = closedTrades.length > 0 ? ((wins / closedTrades.length) * 100).toFixed(1) : 0;

    let aiReply = '';
    const q = message.toLowerCase();

    if (q.includes('win rate') || q.includes('accuracy')) {
      aiReply = `Based on your logged trade history, your overall win rate is **${winRate}%** across ${closedTrades.length} closed executions (${wins} wins, ${closedTrades.length - wins} losses).`;
    } else if (q.includes('pnl') || q.includes('profit') || q.includes('gain') || q.includes('loss')) {
      aiReply = `Your cumulative realized P&L is **${totalPnl >= 0 ? '₹' + totalPnl.toFixed(2) : '-₹' + Math.abs(totalPnl).toFixed(2)}**. You currently have **${openCount} open position(s)** in your portfolio.`;
    } else if (q.includes('risk') || q.includes('management') || q.includes('stop loss')) {
      aiReply = 'Key Risk Management Rules for Trading Communities:\n1. Never risk more than 1-2% of total capital on a single execution.\n2. Always define your Stop-Loss BEFORE placing an order.\n3. Aim for a Minimum Risk:Reward ratio of 1:2.';
    } else {
      aiReply = `I have analyzed your portfolio (${userTrades.length} total trades logged, ₹${totalPnl.toFixed(2)} realized P&L, ${winRate}% win rate). How can I help refine your trading strategy today?`;
    }

    res.json({ success: true, reply: aiReply });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
