import Member from '../models/Member.js';
import User from '../models/User.js';
import Broadcast from '../models/Broadcast.js';
import { sendBroadcastSignal } from '../services/telegramBot.js';

export const getMembers = async (req, res) => {
  try {
    const { search, status, sort = 'desc' } = req.query;

    // Auto-sync any registered users with role 'user' who are missing from Member collection
    try {
      const userList = await User.find({ role: 'user' });
      for (const u of userList) {
        const cleanEmail = u.email.toLowerCase().trim();
        const exists = await Member.findOne({ email: cleanEmail });
        if (!exists) {
          await Member.create({
            name: u.name,
            email: cleanEmail,
            plan: 'Pro Trader',
            status: 'Active',
            joinedDate: new Date(),
          });
        }
      }
    } catch (syncErr) {
      // Non-blocking sync error
    }

    const filter = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }, { plan: searchRegex }];
    }

    if (status && status !== 'All') {
      filter.status = new RegExp(`^${status}$`, 'i');
    }

    const sortOption = { createdAt: sort === 'asc' ? 1 : -1 };

    const members = await Member.find(filter).sort(sortOption);
    res.json({ success: true, count: members.length, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { name, email, plan, status } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await Member.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Member with this email already exists.' });
    }

    const newMember = await Member.create({
      name,
      email: cleanEmail,
      plan: plan || 'Pro Trader',
      status: status || 'Active',
      joinedDate: new Date(),
    });

    res.status(201).json({ success: true, data: newMember });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, plan, status } = req.body;

    const updated = await Member.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase().trim() }),
        ...(plan && { plan }),
        ...(status && { status }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Member.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }
    res.json({ success: true, message: 'Member deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleMemberStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Member.findById(id);

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    const newStatus = member.status === 'Active' ? 'Expired' : 'Active';
    member.status = newStatus;
    await member.save();

    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const total = await Member.countDocuments();
    const active = await Member.countDocuments({ status: /^Active$/i });
    const expired = await Member.countDocuments({ status: /^Expired$/i });

    res.json({
      success: true,
      data: {
        totalMembers: total,
        activeMembers: active,
        expiredMembers: expired,
        monthlyRevenue: 240000,
        renewalRate: '98%',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const broadcastAnnouncement = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    const broadcast = await Broadcast.create({ message });
    await sendBroadcastSignal(message);

    res.json({ success: true, message: 'Broadcast sent successfully.', data: broadcast });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
