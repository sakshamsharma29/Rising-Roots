import Trade from '../models/Trade.js';

export const getTrades = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, symbol, assetType, outcome, sort = 'desc', page = 1, limit = 20 } = req.query;

    const filter = { userId };

    if (status) {
      if (status === 'open') filter.exitPrice = null;
      if (status === 'closed') filter.exitPrice = { $ne: null };
    }

    if (symbol) {
      filter.symbol = new RegExp(symbol, 'i');
    }

    if (assetType && assetType !== 'all') {
      filter.assetType = assetType.toLowerCase();
    }

    if (outcome && outcome !== 'all') {
      filter.outcome = outcome.toLowerCase();
    }

    const sortOption = { entryDate: sort === 'asc' ? 1 : -1 };
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const trades = await Trade.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await Trade.countDocuments(filter);

    res.json({
      success: true,
      count: trades.length,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / limit),
      data: trades,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTrade = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      symbol,
      assetType,
      tradeType,
      entryPrice,
      exitPrice,
      quantity,
      stopLoss,
      target,
      notes,
      tags,
      strikePrice,
      optionType,
      expiryDate,
    } = req.body;

    if (!symbol || !entryPrice || !quantity) {
      return res.status(400).json({ success: false, message: 'Symbol, entry price, and quantity are required.' });
    }

    const trade = new Trade({
      userId,
      symbol: symbol.toUpperCase(),
      assetType: assetType || 'equity',
      tradeType: tradeType || 'long',
      entryPrice: Number(entryPrice),
      exitPrice: exitPrice ? Number(exitPrice) : null,
      quantity: Number(quantity),
      stopLoss: stopLoss ? Number(stopLoss) : null,
      target: target ? Number(target) : null,
      notes: notes || '',
      tags: Array.isArray(tags) ? tags : tags ? tags.split(',').map((t) => t.trim()) : [],
      strikePrice: strikePrice ? Number(strikePrice) : null,
      optionType: optionType || null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    });

    await trade.save();

    res.status(201).json({ success: true, data: trade });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTradeById = async (req, res) => {
  try {
    const { id } = req.params;
    const trade = await Trade.findOne({ _id: id, userId: req.user.id });

    if (!trade) {
      return res.status(404).json({ success: false, message: 'Trade not found.' });
    }

    res.json({ success: true, data: trade });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTrade = async (req, res) => {
  try {
    const { id } = req.params;
    const trade = await Trade.findOne({ _id: id, userId: req.user.id });

    if (!trade) {
      return res.status(404).json({ success: false, message: 'Trade not found.' });
    }

    const fields = [
      'symbol',
      'assetType',
      'tradeType',
      'entryPrice',
      'exitPrice',
      'quantity',
      'stopLoss',
      'target',
      'notes',
      'tags',
      'strikePrice',
      'optionType',
      'expiryDate',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'symbol') trade[field] = req.body[field].toUpperCase();
        else if (field === 'tags' && typeof req.body[field] === 'string') {
          trade[field] = req.body[field].split(',').map((t) => t.trim());
        } else trade[field] = req.body[field];
      }
    });

    await trade.save();

    res.json({ success: true, data: trade });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTrade = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Trade.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Trade not found.' });
    }

    res.json({ success: true, message: 'Trade deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const closeTrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { exitPrice, exitDate } = req.body;

    if (!exitPrice) {
      return res.status(400).json({ success: false, message: 'Exit price is required to close trade.' });
    }

    const trade = await Trade.findOne({ _id: id, userId: req.user.id });

    if (!trade) {
      return res.status(404).json({ success: false, message: 'Trade not found.' });
    }

    trade.exitPrice = Number(exitPrice);
    if (exitDate) trade.exitDate = new Date(exitDate);

    await trade.save();

    res.json({ success: true, data: trade });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTradeStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const trades = await Trade.find({ userId });

    const totalTrades = trades.length;
    const openTrades = trades.filter((t) => t.exitPrice === null).length;
    const closedTrades = trades.filter((t) => t.exitPrice !== null);

    const wins = closedTrades.filter((t) => t.outcome === 'win').length;
    const losses = closedTrades.filter((t) => t.outcome === 'loss').length;
    const winRate = closedTrades.length > 0 ? parseFloat(((wins / closedTrades.length) * 100).toFixed(1)) : 0;

    const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const avgPnl = closedTrades.length > 0 ? parseFloat((totalPnl / closedTrades.length).toFixed(2)) : 0;

    let bestTrade = null;
    let worstTrade = null;

    if (closedTrades.length > 0) {
      bestTrade = closedTrades.reduce((max, t) => (t.pnl > max.pnl ? t : max), closedTrades[0]);
      worstTrade = closedTrades.reduce((min, t) => (t.pnl < min.pnl ? t : min), closedTrades[0]);
    }

    const tradesByAssetType = {
      equity: trades.filter((t) => t.assetType === 'equity').length,
      crypto: trades.filter((t) => t.assetType === 'crypto').length,
      options: trades.filter((t) => t.assetType === 'options').length,
      futures: trades.filter((t) => t.assetType === 'futures').length,
    };

    res.json({
      success: true,
      data: {
        totalTrades,
        openTrades,
        closedTradesCount: closedTrades.length,
        winRate: `${winRate}%`,
        totalPnl: parseFloat(totalPnl.toFixed(2)),
        avgPnl,
        bestTrade: bestTrade ? { symbol: bestTrade.symbol, pnl: bestTrade.pnl } : null,
        worstTrade: worstTrade ? { symbol: worstTrade.symbol, pnl: worstTrade.pnl } : null,
        tradesByAssetType,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
