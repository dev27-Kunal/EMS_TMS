import { Job, JobHistory } from '../models/Job.js';
import Employee from '../models/Employee.js';
import Approval from '../models/Approval.js';

const formatJob = (j) => {
  const obj = { ...j };
  obj.id = obj._id?.toString?.() ?? obj.id;
  delete obj._id;
  if (obj.dueDate) obj.dueDate = obj.dueDate?.toISOString?.()?.split('T')[0] ?? obj.dueDate;
  if (obj.createdAt) obj.createdAt = obj.createdAt?.toISOString?.()?.split('T')[0] ?? obj.createdAt;
  if (obj.assigneeId && typeof obj.assigneeId === 'object' && obj.assigneeId.name) {
    obj.assignee = { id: obj.assigneeId._id?.toString?.(), name: obj.assigneeId.name, email: obj.assigneeId.email };
  } else if (obj.assigneeId) {
    obj.assignee = { id: (obj.assigneeId._id ?? obj.assigneeId)?.toString?.() };
  } else {
    obj.assignee = null;
  }
  delete obj.assigneeId;
  return obj;
};

export const getJobs = async (req, res) => {
  try {
    const { status, priority, department, search, dateFrom, dateTo, view, page = 1, limit = 50 } = req.query;
    const filter = {};
    const userRole = req.user?.role || 'employee';
    const userDept = req.user?.department || '';
    const userName = req.user?.name || '';
    const userId = req.user?._id;

    const userEmployeeId = req.user?.employeeId;

    // Role-based filtering (use assigneeId / employeeId, not name)
    if (userRole === 'employee') {
      filter.assigneeId = userEmployeeId;
    } else if (userRole === 'supervisor' || userRole === 'gm') {
      if (userDept !== 'All') {
        filter.department = userDept;
      }
      if (view === 'my_jobs') {
        filter.assigneeId = userEmployeeId;
      } else if (view === 'assigned_jobs') {
        filter.createdBy = userId;
      }
    }
    // system_admin, hr_admin, manager: no role filter

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (department && !filter.department) filter.department = department;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { jobId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (dateFrom || dateTo) {
      filter.dueDate = {};
      if (dateFrom) filter.dueDate.$gte = new Date(dateFrom);
      if (dateTo) filter.dueDate.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const jobs = await Job.find(filter)
      .populate('assigneeId', 'name email employeeId department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json(jobs.map(formatJob));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('assigneeId', 'name email employeeId department')
      .lean();
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const allowed = canAccessJob(
      job,
      req.user?.role || 'employee',
      req.user?.department || '',
      req.user?.employeeId
    );
    if (!allowed) {
      return res.status(403).json({ message: 'You do not have access to this job' });
    }

    res.status(200).json(formatJob(job));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const canAccessJob = (job, userRole, userDept, userEmployeeId) => {
  if (userRole === 'employee') {
    const assigneeId = job.assigneeId?._id?.toString?.() ?? job.assigneeId?.toString?.();
    return assigneeId && assigneeId === userEmployeeId?.toString?.();
  }
  if (userRole === 'supervisor' || userRole === 'gm') {
    return userDept === 'All' || job.department === userDept;
  }
  return true; // system_admin, hr_admin, manager
};

const generateJobId = async () => {
  const last = await Job.findOne().sort({ jobId: -1 });
  const num = last ? parseInt(last.jobId.replace(/\D/g, '')) + 1 : 1;
  return `JOB${String(num).padStart(3, '0')}`;
};

/**
 * Validate assignee scope: Supervisor (employees only, own dept), GM (supervisor+employee, own dept), System Admin (anyone)
 */
const validateAssigneeScope = (creatorRole, creatorDept, assigneeEmp) => {
  if (!assigneeEmp) return null;
  const assigneeDept = assigneeEmp.department || '';
  const creatorHasAll = creatorDept === 'All';
  const inScope = creatorHasAll || assigneeDept === creatorDept;
  if (creatorRole === 'system_admin') return null;
  if (creatorRole === 'gm') {
    if (!inScope) return 'General Manager can create jobs only for their department (or All category)';
    if (!['supervisor', 'employee'].includes(assigneeEmp.role)) {
      return 'General Manager can assign only to Supervisor or Employee';
    }
    return null;
  }
  if (creatorRole === 'supervisor') {
    if (!inScope) return 'Supervisor can create jobs only for their own department (or All category)';
    if (assigneeEmp.role !== 'employee') return 'Supervisor can assign only to Employees';
    return null;
  }
  return null;
};

export const createJob = async (req, res) => {
  try {
    const creatorRole = req.user?.role || 'employee';
    const creatorDept = req.user?.department || '';
    if (!['system_admin', 'gm', 'supervisor'].includes(creatorRole)) {
      return res.status(403).json({ message: 'Only System Admin, General Manager, or Supervisor can create jobs' });
    }
    const { assigneeId: assigneeIdParam, autoApprove, ...jobBody } = req.body;

    // Validate assignee scope if provided (assigneeId = Employee id)
    let assigneeEmp = null;
    if (assigneeIdParam) {
      assigneeEmp = await Employee.findById(assigneeIdParam).lean();
      if (!assigneeEmp) {
        return res.status(400).json({ message: 'Assignee not found' });
      }
      const scopeError = validateAssigneeScope(creatorRole, creatorDept, assigneeEmp);
      if (scopeError) return res.status(403).json({ message: scopeError });
    }

    const jobId = await generateJobId();
    let status = 'draft';
    const needsApproval = (role) => {
      if (role === 'system_admin') return false;
      if (role === 'gm') return !autoApprove;
      if (role === 'supervisor') return true;
      return true;
    };

    if (creatorRole === 'system_admin') {
      status = assigneeEmp ? 'pending' : 'draft';
    } else if (creatorRole === 'gm' && autoApprove) {
      status = assigneeEmp ? 'pending' : 'draft';
    } else if (needsApproval(creatorRole)) {
      status = 'pending_approval';
    }

    const job = await Job.create({
      ...jobBody,
      jobId,
      status,
      assigneeId: assigneeEmp?._id || null,
      createdBy: req.user?._id,
    });

    await JobHistory.create({
      jobId: job._id,
      action: 'Created',
      user: req.user?.name || 'System',
      userId: req.user?._id,
      details: status === 'pending_approval' ? 'Job created, awaiting approval' : 'Job created',
    });

    if (status === 'pending_approval') {
      await Approval.create({
        type: 'Job Creation',
        requester: req.user?.name || 'Unknown',
        requesterId: req.user?._id,
        department: jobBody.department || '',
        status: 'pending',
        description: jobBody.description || `Job: ${jobBody.title}`,
        jobId: job._id,
        jobTitle: jobBody.title,
        jobDueDate: jobBody.dueDate,
      });
    }

    const populated = await Job.findById(job._id).populate('assigneeId', 'name email employeeId department').lean();
    res.status(201).json(formatJob(populated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const existing = await Job.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ message: 'Job not found' });
    const allowed = canAccessJob(
      existing,
      req.user?.role || 'employee',
      req.user?.department || '',
      req.user?.employeeId
    );
    if (!allowed) return res.status(403).json({ message: 'You do not have access to this job' });

    const { assigneeId: _assigneeId, ...updateData } = req.body;
    const updatePayload = { ...updateData };
    if (_assigneeId !== undefined) updatePayload.assigneeId = _assigneeId || null;

    const job = await Job.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true,
    }).lean();
    const populated = await Job.findById(job._id).populate('assigneeId', 'name email employeeId department').lean();
    res.status(200).json(formatJob(populated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignJob = async (req, res) => {
  try {
    const { assigneeId: assigneeIdParam } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const allowed = canAccessJob(
      job.toObject(),
      req.user?.role || 'employee',
      req.user?.department || '',
      req.user?.employeeId
    );
    if (!allowed) return res.status(403).json({ message: 'You do not have access to this job' });

    const emp = assigneeIdParam ? await Employee.findById(assigneeIdParam) : null;
    job.assigneeId = emp?._id || null;
    await job.save();

    await JobHistory.create({
      jobId: job._id,
      action: 'Assigned',
      user: req.user?.name || 'System',
      userId: req.user?._id,
      details: emp ? `Assigned to ${emp.name}` : 'Assignee removed',
    });

    const populated = await Job.findById(job._id).populate('assigneeId', 'name email employeeId department').lean();
    res.status(200).json({ jobId: job._id.toString(), assignee: formatJob(populated).assignee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get employees that the current user can assign jobs to (for Create Job assignee dropdown)
 */
export const getEligibleAssignees = async (req, res) => {
  try {
    const creatorRole = req.user?.role || 'employee';
    const creatorDept = req.user?.department || '';
    const { department } = req.query;
    const filter = { status: 'active' };
    if (department && department !== 'All') filter.department = department;

    let employees = await Employee.find(filter).sort({ name: 1 }).limit(500).lean();

    if (creatorRole === 'system_admin') {
      // System Admin can assign to anyone
    } else if (creatorRole === 'gm') {
      const creatorHasAll = creatorDept === 'All';
      employees = employees.filter(
        (e) =>
          (creatorHasAll || e.department === creatorDept) &&
          ['supervisor', 'employee'].includes(e.role)
      );
    } else if (creatorRole === 'supervisor') {
      const creatorHasAll = creatorDept === 'All';
      employees = employees.filter(
        (e) => (creatorHasAll || e.department === creatorDept) && e.role === 'employee'
      );
    } else {
      employees = [];
    }

    const formatted = employees.map((e) => ({
      ...e,
      id: e._id.toString(),
      _id: undefined,
      hireDate: e.hireDate?.toISOString?.()?.split('T')[0] ?? e.hireDate,
    }));
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const allowed = canAccessJob(
      job.toObject(),
      req.user?.role || 'employee',
      req.user?.department || '',
      req.user?.employeeId
    );
    if (!allowed) return res.status(403).json({ message: 'You do not have access to this job' });

    if (!['system_admin', 'gm', 'supervisor', 'hr_admin'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'Only System Admin, General Manager, Supervisor, or HR Admin can delete jobs' });
    }

    await JobHistory.deleteMany({ jobId: job._id });
    await Approval.deleteMany({ jobId: job._id });
    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobHistory = async (req, res) => {
  try {
    const history = await JobHistory.find({ jobId: req.params.id })
      .sort({ timestamp: -1 })
      .lean();
    const formatted = history.map((h) => ({
      id: h._id.toString(),
      jobId: h.jobId.toString(),
      action: h.action,
      user: h.user,
      timestamp: h.timestamp,
      details: h.details,
    }));
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
