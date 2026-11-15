import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    assetType: {
      type: String,
      enum: ['crypto', 'forex', 'options', 'futures', 'equity'],
      required: true,
      default: 'crypto',
    },
    tradeType: {
      type: String,
      enum: ['long', 'short'],
      required: true,
      default: 'long',
    },
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number, default: null },
    quantity: { type: Number, required: true },

    // Options specific
    strikePrice: { type: Number, default: null },
    optionType: { type: String, enum: ['CE', 'PE', null], default: null },
    expiryDate: { type: Date, default: null },

    // Risk & Outcome
    pnl: { type: Number, default: 0 },
    pnlPercent: { type: Number, default: 0 },
    outcome: {
      type: String,
      enum: ['win', 'loss', 'breakeven', 'open'],
      default: 'open',
    },
    stopLoss: { type: Number, default: null },
    target: { type: Number, default: null },
    riskRewardRatio: { type: Number, default: null },

    // Dates & Notes
    entryDate: { type: Date, default: Date.now },
    exitDate: { type: Date, default: null },
    notes: { type: String, default: '' },
    tags: [{ type: String }],
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

tradeSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Calculate PnL and outcome before saving if exitPrice is present
tradeSchema.pre('save', function () {
  if (this.exitPrice !== null && this.exitPrice !== undefined) {
    const isLong = this.tradeType === 'long';
    const priceDiff = isLong ? this.exitPrice - this.entryPrice : this.entryPrice - this.exitPrice;
    this.pnl = parseFloat((priceDiff * this.quantity).toFixed(2));
    this.pnlPercent = parseFloat(((priceDiff / this.entryPrice) * 100).toFixed(2));

    if (this.pnl > 0) this.outcome = 'win';
    else if (this.pnl < 0) this.outcome = 'loss';
    else this.outcome = 'breakeven';

    if (!this.exitDate) this.exitDate = new Date();
  } else {
    this.outcome = 'open';
    this.pnl = 0;
    this.pnlPercent = 0;
  }

  // Calculate Risk Reward if SL and Target are set
  if (this.stopLoss && this.target) {
    const risk = Math.abs(this.entryPrice - this.stopLoss);
    const reward = Math.abs(this.target - this.entryPrice);
    this.riskRewardRatio = risk > 0 ? parseFloat((reward / risk).toFixed(2)) : null;
  }
});

export default mongoose.model('Trade', tradeSchema);
