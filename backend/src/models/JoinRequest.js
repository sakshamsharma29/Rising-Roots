import mongoose from 'mongoose';

const joinRequestSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    preferredPlan: { type: String, default: 'Pro Trader' },
    message: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.requestedAt = ret.createdAt ? ret.createdAt.toISOString().split('T')[0] : '';
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

joinRequestSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

export default mongoose.model('JoinRequest', joinRequestSchema);
