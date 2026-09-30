import Organization from '../models/Organization.js';
import User from '../models/User.js';

// Get team organization by Invite Code or Slug (Public)
export const getOrgByCodeOrSlug = async (req, res) => {
  try {
    const { code, slug } = req.query;

    if (!code && !slug) {
      return res.status(400).json({ success: false, message: 'Invite code or team slug is required.' });
    }

    const filter = {};
    if (code) filter.inviteCode = code.trim().toUpperCase();
    if (slug) filter.slug = slug.trim().toLowerCase();

    const org = await Organization.findOne(filter).populate('ownerId', 'name email');

    if (!org) {
      return res.status(404).json({ success: false, message: 'Team Organization not found with this code or URL.' });
    }

    res.json({ success: true, data: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new Team Organization (Admin)
export const createOrganization = async (req, res) => {
  try {
    const { name, inviteCode, slug, primaryColor } = req.body;
    const ownerId = req.user.id;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Team Organization Name is required.' });
    }

    const cleanInviteCode = inviteCode ? inviteCode.trim().toUpperCase() : `RR-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const cleanSlug = slug ? slug.trim().toLowerCase() : name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const existingCode = await Organization.findOne({ inviteCode: cleanInviteCode });
    if (existingCode) {
      return res.status(400).json({ success: false, message: 'Invite code is already in use by another team.' });
    }

    const newOrg = await Organization.create({
      name,
      ownerId,
      inviteCode: cleanInviteCode,
      slug: cleanSlug,
      branding: { primaryColor: primaryColor || '#10b981' },
    });

    // Update Admin user record with orgId
    await User.findByIdAndUpdate(ownerId, { orgId: newOrg.id });

    res.status(201).json({ success: true, data: newOrg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
