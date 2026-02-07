import validator from 'validator';
import Employee from '../models/Employee.js';
import Department from '../models/Department.js';
import User from '../models/User.js';

const normalizeEmailForAuth = (email) => validator.normalizeEmail(email?.trim() || '') || (email?.trim().toLowerCase() || '');

export const getEmployees = async (req, res) => {
  try {
    const { department, status, search, role, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (status) filter.status = status;
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [employees, total] = await Promise.all([
      Employee.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Employee.countDocuments(filter),
    ]);

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

/**
 * Get eligible reporting managers for an employee.
 * Eligible: HR Manager, System Admin; GM/Supervisor from same department or "All" category.
 */
export const getReportingManagers = async (req, res) => {
  try {
    const { department } = req.query;
    if (!department) {
      return res.status(400).json({ message: 'Department is required' });
    }
    const employees = await Employee.find({
      status: 'active',
      $or: [
        { role: { $in: ['hr_admin', 'system_admin'] } },
        { role: 'gm', department: { $in: [department, 'All'] } },
        { role: 'supervisor', department: { $in: [department, 'All'] } },
      ],
    })
      .sort({ name: 1 })
      .limit(500)
      .lean();
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

export const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).lean();
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json({
      ...employee,
      id: employee._id.toString(),
      _id: undefined,
      hireDate: employee.hireDate?.toISOString?.()?.split('T')[0] ?? employee.hireDate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const existing = await Employee.findOne({ employeeId: req.body.employeeId });
    if (existing) return res.status(400).json({ message: 'Employee ID already exists' });

    const { password, ...employeeData } = req.body;
    if (password) {
      const authEmail = normalizeEmailForAuth(req.body.email);
      const existingUser = await User.findOne({ email: authEmail });
      if (existingUser) return res.status(400).json({ message: 'A user account with this email already exists' });
    }

    const employee = await Employee.create(employeeData);
    if (password) {
      const authEmail = normalizeEmailForAuth(employee.email);
      const user = await User.create({
        email: authEmail,
        password,
        name: employee.name,
        role: employee.role,
        department: employee.department,
        employeeId: employee._id,
      });
      employee.userId = user._id;
      await employee.save();
    }

    const dept = await Department.findOne({ name: employee.department });
    if (dept) {
      dept.employeeCount += 1;
      await dept.save();
    }

    res.status(201).json({
      ...employee.toJSON(),
      id: employee._id.toString(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    const employee = await Employee.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).lean();
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const user = await User.findById(employee.userId);
    if (user) {
      const newEmail = normalizeEmailForAuth(employee.email);
      const emailTaken = await User.findOne({ email: newEmail, _id: { $ne: user._id } });
      if (emailTaken) return res.status(400).json({ message: 'Email already in use by another account' });
      user.name = employee.name;
      user.email = newEmail;
      user.role = employee.role;
      user.department = employee.department;
      if (password && password.trim()) user.password = password;
      await user.save();
    } else if (password && password.trim()) {
      const authEmail = normalizeEmailForAuth(employee.email);
      const existingUser = await User.findOne({ email: authEmail });
      if (existingUser) return res.status(400).json({ message: 'A user account with this email already exists' });
      const newUser = await User.create({
        email: authEmail,
        password,
        name: employee.name,
        role: employee.role,
        department: employee.department,
        employeeId: employee._id,
      });
      await Employee.findByIdAndUpdate(req.params.id, { userId: newUser._id });
    }

    res.status(200).json({
      ...employee,
      id: employee._id.toString(),
      _id: undefined,
      hireDate: employee.hireDate?.toISOString?.()?.split('T')[0] ?? employee.hireDate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    if (employee.userId) {
      await User.findByIdAndDelete(employee.userId);
    }

    const dept = await Department.findOne({ name: employee.department });
    if (dept && dept.employeeCount > 0) {
      dept.employeeCount -= 1;
      await dept.save();
    }

    await Employee.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Employee removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
