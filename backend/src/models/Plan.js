import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // e.g. 'pro', 'vip', 'starter'
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
    name: { type: String, required: true },
    price: { type: String, required: true },
    subscribers: { type: Number, default: 0 },
    status: { type: String, default: 'Active' },
    features: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

planSchema.virtual('id').get(function () {
  return this._id;
});

export default mongoose.model('Plan', planSchema);
