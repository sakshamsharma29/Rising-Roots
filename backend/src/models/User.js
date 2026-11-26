import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    phone: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    tradingExperience: { type: String, default: 'Intermediate' },
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
