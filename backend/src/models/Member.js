import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    telegramUsername: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    tradingExperience: { type: String, default: 'Intermediate' },
    preferredMarket: { type: String, default: 'All Markets' },
    // Government ID & KYC Verification Fields
    idType: {
      type: String,
      enum: ['PAN Card', 'Aadhaar Card', 'Passport', 'Driving License', 'Voter ID'],
      default: 'PAN Card',
    },
    idNumber: { type: String, trim: true, uppercase: true, default: '' },
    idDocumentUrl: { type: String, default: '' },
    idDocumentBackUrl: { type: String, default: '' },
    kycStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected', 'Not Submitted'],
      default: 'Pending',
    },
    kycSubmittedAt: { type: Date, default: Date.now },
    kycVerifiedAt: { type: Date, default: null },
    kycRejectionReason: { type: String, default: '' },
    plan: { type: String, required: true, default: 'Pro Trader' },
    status: { type: String, enum: ['Active', 'Expired'], default: 'Active' },
    planDuration: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
    autoRenew: { type: Boolean, default: true },
    joinedDate: { type: Date, default: Date.now },
    expiresAt: {
      type: Date,
      default: function () {
        const d = new Date(this.joinedDate || Date.now());
        d.setDate(d.getDate() + 30); // Default 30 days plan duration
        return d;
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.joined_date = ret.joinedDate ? ret.joinedDate.toISOString().split('T')[0] : '';
        ret.joinedDate = ret.joined_date;
        ret.expires_at = ret.expiresAt ? ret.expiresAt.toISOString().split('T')[0] : '';
        
        // Days remaining calculation
        if (ret.expiresAt) {
          const diffTime = new Date(ret.expiresAt) - new Date();
          ret.daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        } else {
          ret.daysRemaining = 0;
        }

        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

memberSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

memberSchema.virtual('joined_date').get(function () {
  return this.joinedDate ? this.joinedDate.toISOString().split('T')[0] : '';
});

memberSchema.virtual('expires_at').get(function () {
  return this.expiresAt ? this.expiresAt.toISOString().split('T')[0] : '';
});

memberSchema.virtual('daysRemaining').get(function () {
  if (!this.expiresAt) return 0;
  const diffTime = this.expiresAt - new Date();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
});

export default mongoose.model('Member', memberSchema);
