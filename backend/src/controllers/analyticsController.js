export const getAnalytics = async (req, res) => {
  try {
    const analyticsData = {
      mrr: 240000,
      mrrGrowth: '+12.4%',
      renewalRate: '98%',
      churnRate: '2.1%',
      totalMembers: 1250,
      activeSubscribers: 982,
      monthlyRevenue: [
        { month: 'May', revenue: 180000 },
        { month: 'Jun', revenue: 195000 },
        { month: 'Jul', revenue: 210000 },
        { month: 'Aug', revenue: 228000 },
        { month: 'Sep', revenue: 240000 },
      ],
    };
    res.json({ success: true, data: analyticsData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
