import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    head: { type: String, default: '' },
    employeeCount: { type: Number, default: 0 },
    budget: { type: Number, default: 0 },
    status: { type: String, default: 'active', enum: ['active', 'inactive'] },
    isDefault: { type: Boolean, default: false }, // "All" department - cannot be deleted
  },
  { timestamps: true }
);

departmentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Department', departmentSchema);
