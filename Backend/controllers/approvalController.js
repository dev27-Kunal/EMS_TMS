import Approval from '../models/Approval.js';
import { Job } from '../models/Job.js';

const formatApproval = (a) => {
  const obj = a.toObject ? a.toObject() : { ...a };
  return {
    ...obj,
    id: obj._id?.toString?.() ?? obj.id,
    _id: undefined,
    jobId: obj.jobId?.toString?.() ?? obj.jobId ?? null,
    submittedAt: obj.submittedAt?.toISOString?.()?.split('T')[0] ?? obj.submittedAt,
    approvedAt: obj.approvedAt?.toISOString?.()?.split('T')[0] ?? obj.approvedAt,
    rejectedAt: obj.rejectedAt?.toISOString?.()?.split('T')[0] ?? obj.rejectedAt,
    jobDueDate: obj.jobDueDate?.toISOString?.()?.split('T')[0] ?? obj.jobDueDate,
  };
};

export const getApprovals = async (req, res) => {
  try {
    const { status, type, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { requester: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const approvals = await Approval.find(filter).sort({ submittedAt: -1 }).skip(skip).limit(parseInt(limit));

    res.status(200).json(approvals.map(formatApproval));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getApproval = async (req, res) => {
  try {
    const approval = await Approval.findById(req.params.id);
    if (!approval) return res.status(404).json({ message: 'Approval not found' });
    res.status(200).json(formatApproval(approval));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveRequest = async (req, res) => {
  try {
    if (req.user?.role === 'hr_admin') {
      return res.status(403).json({ message: 'HR Admin can only view approvals, not approve or reject' });
    }
    const { comment } = req.body;
    const approval = await Approval.findById(req.params.id);
    if (!approval) return res.status(404).json({ message: 'Approval not found' });
    if (approval.status !== 'pending') {
      return res.status(400).json({ message: 'Approval already processed' });
    }

    approval.status = 'approved';
    approval.approvedBy = req.user?.name || 'Approver';
    approval.approvedAt = new Date();
    approval.remark = comment || '';
    await approval.save();

    if (approval.type === 'Job Creation' && approval.jobId) {
      await Job.findByIdAndUpdate(approval.jobId, { status: 'pending' });
    }

    res.status(200).json({ id: approval._id.toString(), status: 'approved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    if (req.user?.role === 'hr_admin') {
      return res.status(403).json({ message: 'HR Admin can only view approvals, not approve or reject' });
    }
    const { reason } = req.body;
    const approval = await Approval.findById(req.params.id);
    if (!approval) return res.status(404).json({ message: 'Approval not found' });
    if (approval.status !== 'pending') {
      return res.status(400).json({ message: 'Approval already processed' });
    }

    approval.status = 'rejected';
    approval.rejectedBy = req.user?.name || 'Approver';
    approval.rejectedAt = new Date();
    approval.remark = reason || '';
    await approval.save();

    if (approval.type === 'Job Creation' && approval.jobId) {
      await Job.findByIdAndUpdate(approval.jobId, { status: 'cancelled' });
    }

    res.status(200).json({ id: approval._id.toString(), status: 'rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
