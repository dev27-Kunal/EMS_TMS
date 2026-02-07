import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    department: { type: String, required: true },
    status: {
      type: String,
      default: 'draft',
      enum: ['draft', 'pending_approval', 'pending', 'in_progress', 'completed', 'overdue', 'cancelled', 'on_hold'],
    },
    priority: { type: String, default: 'medium', enum: ['low', 'medium', 'high', 'urgent'] },
    dueDate: { type: Date },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

const jobHistorySchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    action: { type: String, required: true },
    user: { type: String, default: 'System' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    details: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

jobSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    if (ret.dueDate) ret.dueDate = ret.dueDate.toISOString().split('T')[0];
    if (ret.createdAt) ret.createdAt = ret.createdAt.toISOString().split('T')[0];
    return ret;
  },
});

export const Job = mongoose.model('Job', jobSchema);
export const JobHistory = mongoose.model('JobHistory', jobHistorySchema);
