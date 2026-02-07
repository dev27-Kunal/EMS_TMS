import Department from '../models/Department.js';

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 }).lean();
    const formatted = departments.map((d) => ({
      ...d,
      id: d._id.toString(),
      _id: undefined,
    }));
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id).lean();
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    res.status(200).json({
      ...dept,
      id: dept._id.toString(),
      _id: undefined,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const existing = await Department.findOne({ name: req.body.name });
    if (existing) return res.status(400).json({ message: 'Department name already exists' });

    const department = await Department.create({
      ...req.body,
      employeeCount: req.body.employeeCount ?? 0,
    });
    res.status(201).json({
      ...department.toJSON(),
      id: department._id.toString(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    if (department.isDefault) {
      return res.status(400).json({ message: 'The "All" department cannot be deleted' });
    }
    await Department.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const existing = await Department.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Department not found' });
    let updateData = { ...req.body };
    if (existing.isDefault) {
      if (updateData.name && updateData.name !== existing.name) {
        return res.status(400).json({ message: 'The "All" department name cannot be changed' });
      }
      delete updateData.name;
    }
    const department = await Department.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).lean();
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.status(200).json({
      ...department,
      id: department._id.toString(),
      _id: undefined,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
