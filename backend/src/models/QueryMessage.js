import mongoose from 'mongoose';

const queryMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    telegram: {
      type: String,
      trim: true,
      default: '',
    },
    subject: {
      type: String,
      required: true,
      default: 'VIP Membership & Signals',
    },
    marketInterest: {
      type: String,
      default: 'Crypto & Forex',
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Resolved'],
      default: 'New',
    },
    adminNotes: {
      type: String,
      default: '',
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

queryMessageSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

export default mongoose.model('QueryMessage', queryMessageSchema);
