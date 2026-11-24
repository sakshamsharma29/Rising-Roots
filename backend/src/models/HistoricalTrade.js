import mongoose from 'mongoose';

const historicalTradeSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    market: {
      type: String,
      enum: ['crypto', 'forex', 'options'],
      required: true,
      default: 'crypto',
    },
    direction: {
      type: String,
      enum: ['BUY (LONG)', 'SELL (SHORT)', 'OPTION CALL', 'OPTION PUT'],
      required: true,
      default: 'BUY (LONG)',
    },
    entryDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    closeDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    entryPrice: {
      type: Number,
      required: true,
    },
    exitPrice: {
      type: Number,
      required: true,
    },
    targetPrice: {
      type: Number,
      default: null,
    },
    stopLoss: {
      type: Number,
      default: null,
    },
    returnPct: {
      type: Number,
      required: true,
    },
    pnlUsd: {
      type: Number,
      required: true,
    },
    riskReward: {
      type: String,
      default: '1:2.5',
    },
    outcome: {
      type: String,
      enum: ['win', 'loss', 'breakeven'],
      required: true,
      default: 'win',
    },
    holdingPeriod: {
      type: String,
      default: '1d 4h',
    },
    verificationHash: {
      type: String,
      default: () => 'RR-TX-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    },
    screenshotUrl: {
      type: String,
      default: '',
    },
    brokerName: {
      type: String,
      default: 'Delta Exchange',
    },
    verifiedProfit: {
      type: String,
      default: '',
    },
    rationale: {
      type: String,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

historicalTradeSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

export default mongoose.model('HistoricalTrade', historicalTradeSchema);
