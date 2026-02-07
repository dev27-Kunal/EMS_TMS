import LoginHistory from '../models/LoginHistory.js';

const formatRecord = (r) => ({
  ...r,
  id: r._id.toString(),
  _id: undefined,
});

export const getLoginHistory = async (req, res) => {
  try {
    const { userId, status, role, startDate, endDate, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    if (role) filter.role = role;
    if (startDate || endDate) {
      filter.loginAt = {};
      if (startDate) filter.loginAt.$gte = new Date(startDate);
      if (endDate) filter.loginAt.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const records = await LoginHistory.find(filter).sort({ loginAt: -1 }).skip(skip).limit(parseInt(limit)).lean();

    res.status(200).json(records.map(formatRecord));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLoginRecord = async (req, res) => {
  try {
    const record = await LoginHistory.findById(req.params.id).lean();
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.status(200).json(formatRecord(record));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
