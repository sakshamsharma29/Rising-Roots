import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    phone: { type: String, trim: true, default: '' },
    telegramUsername: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    tradingExperience: { type: String, default: 'Intermediate' },
    preferredMarket: { type: String, default: 'All Markets' },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

export default mongoose.model('User', userSchema);
