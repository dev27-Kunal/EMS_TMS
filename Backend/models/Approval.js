import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // Leave Request, Job Creation, Job Completion, Job Request, etc.
    requester: { type: String, required: true },
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    department: { type: String, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
    submittedAt: { type: Date, default: Date.now },
    description: { type: String, default: '' },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    jobTitle: { type: String },
    jobDueDate: { type: Date },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    rejectedBy: { type: String },
    rejectedAt: { type: Date },
    remark: { type: String },
  },
  { timestamps: true }
);

approvalSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    if (ret.submittedAt) ret.submittedAt = ret.submittedAt.toISOString().split('T')[0];
    if (ret.approvedAt) ret.approvedAt = ret.approvedAt.toISOString().split('T')[0];
    if (ret.rejectedAt) ret.rejectedAt = ret.rejectedAt.toISOString().split('T')[0];
    if (ret.jobDueDate) ret.jobDueDate = ret.jobDueDate.toISOString().split('T')[0];
    if (ret.jobId) ret.jobId = ret.jobId.toString();
    return ret;
  },
});

export default mongoose.model('Approval', approvalSchema);
