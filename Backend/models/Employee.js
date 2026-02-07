import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    department: { type: String, required: true },
    position: { type: String, required: true },
    role: { type: String, default: 'employee', enum: ['employee', 'supervisor', 'manager', 'gm', 'hr_admin', 'system_admin'] },
    status: { type: String, default: 'active', enum: ['active', 'inactive', 'on_leave', 'terminated'] },
    hireDate: { type: Date, required: true },
    supervisor: { type: String, default: '' },
    phone: { type: String, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

employeeSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    if (ret.hireDate) ret.hireDate = ret.hireDate.toISOString().split('T')[0];
    return ret;
  },
});

export default mongoose.model('Employee', employeeSchema);
