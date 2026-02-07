import User from '../models/User.js';

const userResponse = (user) => ({
  id: user._id.toString(),
  email: user.email,
  name: user.name,
  role: user.role,
  department: user.department,
  avatar: user.avatar || '',
});

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(userResponse(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, department, avatar } = req.body;
    const allowed = { name, department, avatar };
    Object.keys(allowed).forEach((k) => allowed[k] === undefined && delete allowed[k]);

    const user = await User.findByIdAndUpdate(req.user._id, allowed, {
      new: true,
      runValidators: true,
    }).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(userResponse(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
