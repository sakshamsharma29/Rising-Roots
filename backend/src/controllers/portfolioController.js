import Trade from '../models/Trade.js';
import Member from '../models/Member.js';

// Get Personal Portfolio Metrics for current logged-in user
export const getMyPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all user trades
    const trades = await Trade.find({ userId }).sort({ entryDate: -1 });

    const openPositions = trades.filter((t) => t.exitPrice === null);
    const closedTrades = trades.filter((t) => t.exitPrice !== null);

    // Calculate total capital exposed in open trades
    const openExposure = openPositions.reduce((sum, t) => sum + t.entryPrice * t.quantity, 0);

    // Realized P&L
    const totalRealizedPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

    // Win Rate
    const wins = closedTrades.filter((t) => t.outcome === 'win').length;
    const winRate = closedTrades.length > 0 ? parseFloat(((wins / closedTrades.length) * 100).toFixed(1)) : 0;

    // Asset allocation breakdown (by capital allocated across all trades)
    const assetTotals = { equity: 0, crypto: 0, options: 0, futures: 0 };
    let totalCap = 0;

    trades.forEach((t) => {
      const cap = t.entryPrice * t.quantity;
      if (assetTotals[t.assetType] !== undefined) {
        assetTotals[t.assetType] += cap;
        totalCap += cap;
      }
    });

    const assetAllocation = {
      equity: totalCap > 0 ? parseFloat(((assetTotals.equity / totalCap) * 100).toFixed(1)) : 0,
      crypto: totalCap > 0 ? parseFloat(((assetTotals.crypto / totalCap) * 100).toFixed(1)) : 0,
      options: totalCap > 0 ? parseFloat(((assetTotals.options / totalCap) * 100).toFixed(1)) : 0,
      futures: totalCap > 0 ? parseFloat(((assetTotals.futures / totalCap) * 100).toFixed(1)) : 0,
    };

    // Monthly PnL Breakdown (for performance chart)
    const monthlyPnlMap = {};
    closedTrades.forEach((t) => {
      const monthStr = new Date(t.exitDate || t.entryDate).toLocaleString('en-US', { month: 'short' });
      monthlyPnlMap[monthStr] = (monthlyPnlMap[monthStr] || 0) + (t.pnl || 0);
    });

    const monthlyTrend = Object.keys(monthlyPnlMap).map((m) => ({
      month: m,
      pnl: parseFloat(monthlyPnlMap[m].toFixed(2)),
    }));

    res.json({
      success: true,
      data: {
        summary: {
          openExposure: parseFloat(openExposure.toFixed(2)),
          openPositionsCount: openPositions.length,
          totalRealizedPnl: parseFloat(totalRealizedPnl.toFixed(2)),
          winRate: `${winRate}%`,
          totalTradesCount: trades.length,
          closedTradesCount: closedTrades.length,
        },
        assetAllocation,
        monthlyTrend,
        openPositions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Community Portfolio & Trading Performance (Leaderboard + Aggregates)
export const getCommunityPortfolio = async (req, res) => {
  try {
    // Pipeline to group trades by user and compute user performance stats
    const leaderboardPipeline = [
      {
        $group: {
          _id: '$userId',
          totalTrades: { $sum: 1 },
          closedTrades: {
            $sum: { $cond: [{ $ne: ['$exitPrice', null] }, 1, 0] },
          },
          wins: {
            $sum: { $cond: [{ $eq: ['$outcome', 'win'] }, 1, 0] },
          },
          totalPnl: { $sum: '$pnl' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          userId: '$_id',
          name: '$userInfo.name',
          email: '$userInfo.email',
          totalTrades: 1,
          closedTrades: 1,
          wins: 1,
          totalPnl: { $round: ['$totalPnl', 2] },
          winRate: {
            $cond: [
              { $gt: ['$closedTrades', 0] },
              { $concat: [{ $toString: { $round: [{ $multiply: [{ $divide: ['$wins', '$closedTrades'] }, 100] }, 1] } }, '%'] },
              '0%',
            ],
          },
        },
      },
      { $sort: { totalPnl: -1 } },
      { $limit: 10 },
    ];

    const leaderboard = await Trade.aggregate(leaderboardPipeline);

    // Community global totals
    const allClosedTrades = await Trade.find({ exitPrice: { $ne: null } });
    const communityTotalPnl = allClosedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const communityWins = allClosedTrades.filter((t) => t.outcome === 'win').length;
    const communityWinRate =
      allClosedTrades.length > 0 ? parseFloat(((communityWins / allClosedTrades.length) * 100).toFixed(1)) : 0;

    res.json({
      success: true,
      data: {
        communityStats: {
          totalCommunityPnl: parseFloat(communityTotalPnl.toFixed(2)),
          communityWinRate: `${communityWinRate}%`,
          totalClosedTrades: allClosedTrades.length,
        },
        leaderboard,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
