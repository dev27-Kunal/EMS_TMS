import Role from '../models/Role.js';
import User from '../models/User.js';

const getRoleUserCount = async (code) => {
  return User.countDocuments({ role: code });
};

export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ name: 1 }).lean();
    const withCounts = await Promise.all(
      roles.map(async (r) => ({
        ...r,
        id: r._id.toString(),
        _id: undefined,
        userCount: await getRoleUserCount(r.code),
      }))
    );
    res.status(200).json(withCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id).lean();
    if (!role) return res.status(404).json({ message: 'Role not found' });
    const userCount = await getRoleUserCount(role.code);
    res.status(200).json({
      ...role,
      id: role._id.toString(),
      _id: undefined,
      userCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createRole = async (req, res) => {
  try {
    const existing = await Role.findOne({ code: req.body.code });
    if (existing) return res.status(400).json({ message: 'Role code already exists' });

    const role = await Role.create({ ...req.body, userCount: 0 });
    res.status(201).json({
      ...role.toJSON(),
      id: role._id.toString(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!role) return res.status(404).json({ message: 'Role not found' });
    const userCount = await getRoleUserCount(role.code);
    res.status(200).json({
      ...role,
      id: role._id.toString(),
      _id: undefined,
      userCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
