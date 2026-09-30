import JoinRequest from '../models/JoinRequest.js';
import Organization from '../models/Organization.js';
import Member from '../models/Member.js';

// Submit Join Request (Public Applicant)
export const submitJoinRequest = async (req, res) => {
  try {
    const { name, email, inviteCode, preferredPlan, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required to request join.' });
    }

    // Default to first organization if inviteCode is not supplied
    let org = null;
    if (inviteCode) {
      org = await Organization.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
    }
    if (!org) {
      org = await Organization.findOne();
    }

    if (!org) {
      return res.status(404).json({ success: false, message: 'No active trading team organization found to join.' });
    }

    // Check if user is already an active member or has a pending request
    const existingMember = await Member.findOne({ orgId: org.id, email: email.toLowerCase() });
    if (existingMember && existingMember.status === 'Active') {
      return res.status(400).json({ success: false, message: 'You are already an active member of this trading team.' });
    }

    const newRequest = await JoinRequest.create({
      orgId: org.id,
      name,
      email: email.toLowerCase(),
      preferredPlan: preferredPlan || 'Pro Trader',
      message: message || '',
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: `Join request submitted to team ${org.name}! The admin will review and approve your access shortly.`,
      data: newRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Pending Join Requests (Admin Only)
export const getPendingJoinRequests = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    const filter = orgId ? { orgId, status: 'Pending' } : { status: 'Pending' };

    const requests = await JoinRequest.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve Join Request (Admin Only)
export const approveJoinRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await JoinRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Join request not found.' });
    }

    request.status = 'Approved';
    await request.save();

    // Create or Activate Member Record
    let member = await Member.findOne({ email: request.email });
    if (!member) {
      member = await Member.create({
        orgId: request.orgId,
        name: request.name,
        email: request.email,
        plan: request.preferredPlan || 'Pro Trader',
        status: 'Active',
        joinedDate: new Date(),
      });
    } else {
      member.status = 'Active';
      member.plan = request.preferredPlan || member.plan;
      const currentExpiry = new Date();
      currentExpiry.setDate(currentExpiry.getDate() + 30);
      member.expiresAt = currentExpiry;
      await member.save();
    }

    res.json({
      success: true,
      message: `Applicant ${request.name} approved! Access activated and Telegram VIP invite generated.`,
      data: member,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject Join Request (Admin Only)
export const rejectJoinRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await JoinRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Join request not found.' });
    }

    request.status = 'Rejected';
    await request.save();

    res.json({
      success: true,
      message: `Join request from ${request.name} rejected.`,
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
