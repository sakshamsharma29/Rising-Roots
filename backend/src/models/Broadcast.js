import mongoose from 'mongoose';

const broadcastSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
    title: { type: String, default: 'Market Alert' },
    message: { type: String, required: true },
    category: {
      type: String,
      enum: ['signal', 'announcement', 'breakout', 'urgent', 'market_update'],
      default: 'signal',
    },
    asset: { type: String, default: 'BTC/USDT' },
    signalType: {
      type: String,
      enum: ['BUY', 'SELL', 'ALERT', 'INFO'],
      default: 'ALERT',
    },
    entryPrice: { type: Number, default: null },
    targetPrice: { type: Number, default: null },
    stopLoss: { type: Number, default: null },
    pinned: { type: Boolean, default: false },
    sentAt: { type: Date, default: Date.now },
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

broadcastSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

export default mongoose.model('Broadcast', broadcastSchema);
