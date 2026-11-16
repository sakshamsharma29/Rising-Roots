import { getDeltaTickers, getDeltaOptionsChain } from '../services/deltaService.js';

// GET /api/delta/tickers
export const getDeltaTickersHandler = async (req, res) => {
  try {
    const tickers = await getDeltaTickers();
    res.json({
      success: true,
      exchange: 'Delta Exchange',
      count: tickers.length,
      data: tickers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/delta/options
export const getDeltaOptionsHandler = async (req, res) => {
  try {
    const { asset = 'BTC', expiry = null } = req.query;
    const chain = await getDeltaOptionsChain(asset, expiry);
    res.json({
      success: true,
      data: chain,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
