import mongoose from 'mongoose';

const userNotificationSettingsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    jobUpdates: { type: Boolean, default: true },
    approvalRequests: { type: Boolean, default: true },
    systemAlerts: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('UserNotificationSettings', userNotificationSettingsSchema);
