import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import LoginHistory from '../models/LoginHistory.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const userResponse = (user) => ({
  id: user._id.toString(),
  email: user.email,
  name: user.name,
  role: user.role,
  department: user.department,
  avatar: user.avatar || '',
  employeeId: user.employeeId?.toString?.() || null,
});

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.connection?.remoteAddress || '';
    const userAgent = req.get('User-Agent') || 'Unknown';

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      await LoginHistory.create({
        userId: 'unknown',
        userName: email,
        email,
        role: '',
        ipAddress: ip,
        device: userAgent,
        location: '',
        status: 'failed',
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await LoginHistory.create({
      userId: user._id.toString(),
      userName: user.name,
      email: user.email,
      role: user.role,
      ipAddress: ip,
      device: userAgent,
      location: '',
      status: 'success',
    });

    const token = generateToken(user._id);
    return res.status(200).json({
      user: userResponse(user),
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }
    // In production: generate reset token, save to DB, send email
    return res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    // In production: verify token from DB, update password
    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
