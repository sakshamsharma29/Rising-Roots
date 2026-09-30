import Member from '../models/Member.js';

// Automated background task to check and expire overdue subscriptions
export const checkAndExpireSubscriptions = async () => {
  try {
    const now = new Date();
    const result = await Member.updateMany(
      { status: 'Active', expiresAt: { $lt: now } },
      { $set: { status: 'Expired' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`⏰ [Subscription Task] Marked ${result.modifiedCount} overdue subscriptions as Expired.`);
    }
  } catch (err) {
    console.error('❌ [Subscription Task Error]:', err.message);
  }
};

// Admin Action: Manually Renew or Extend Member Subscription
export const renewMemberSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 30, plan } = req.body;

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    const currentExpiry = member.expiresAt && member.expiresAt > new Date() ? new Date(member.expiresAt) : new Date();
    currentExpiry.setDate(currentExpiry.getDate() + Number(days));

    member.expiresAt = currentExpiry;
    member.status = 'Active';
    if (plan) member.plan = plan;

    await member.save();

    res.json({
      success: true,
      message: `Subscription extended by ${days} days until ${member.expiresAt.toISOString().split('T')[0]}.`,
      data: member,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get members expiring within N days (default 7 days)
export const getExpiringMembers = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Number(days));

    const expiringMembers = await Member.find({
      status: 'Active',
      expiresAt: { $gte: now, $lte: futureDate },
    }).sort({ expiresAt: 1 });

    const expiredMembers = await Member.find({ status: 'Expired' }).sort({ expiresAt: -1 });

    res.json({
      success: true,
      data: {
        expiringSoon: expiringMembers,
        expired: expiredMembers,
        expiringSoonCount: expiringMembers.length,
        expiredCount: expiredMembers.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
