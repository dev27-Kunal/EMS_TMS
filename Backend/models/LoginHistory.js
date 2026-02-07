import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, default: 'employee' },
    ipAddress: { type: String, default: '' },
    device: { type: String, default: '' },
    location: { type: String, default: '' },
    status: { type: String, default: 'success', enum: ['success', 'failed'] },
    loginAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

loginHistorySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('LoginHistory', loginHistorySchema);
