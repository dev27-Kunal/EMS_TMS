import Notification from '../models/Notification.js';
import UserNotificationSettings from '../models/UserNotificationSettings.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    const formatted = notifications.map((n) => ({
      ...n,
      id: n._id.toString(),
      _id: undefined,
      read: n.read || false,
      createdAt: n.createdAt,
    }));
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true }
    );
    res.status(200).json(req.params.id);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id }, { read: true });
    res.status(200).json(true);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSettings = async (req, res) => {
  try {
    let settings = await UserNotificationSettings.findOne({ userId: req.user._id }).lean();
    if (!settings) {
      const created = await UserNotificationSettings.create({
        userId: req.user._id,
        email: true,
        push: true,
        jobUpdates: true,
        approvalRequests: true,
        systemAlerts: true,
      });
      settings = created.toObject();
    }
    const { userId, _id, __v, ...rest } = settings;
    res.status(200).json(rest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    let settings = await UserNotificationSettings.findOne({ userId: req.user._id });
    if (!settings) {
      settings = await UserNotificationSettings.create({
        userId: req.user._id,
        ...req.body,
      });
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    const { userId, _id, __v, ...rest } = settings.toObject();
    res.status(200).json(rest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
