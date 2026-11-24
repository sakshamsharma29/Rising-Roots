import QueryMessage from '../models/QueryMessage.js';

// 1. Submit Query (Public Endpoint)
export const submitQuery = async (req, res) => {
  try {
    const { name, email, phone, telegram, subject, marketInterest, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone number, and query message are required.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const query = await QueryMessage.create({
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      telegram: telegram ? telegram.trim() : '',
      subject: subject || 'General Query',
      marketInterest: marketInterest || 'Crypto & Forex',
      message: message.trim(),
      status: 'New',
    });

    res.status(201).json({
      success: true,
      message: 'Your query has been submitted successfully! Our desk team will connect with you via WhatsApp or Email within 2 hours.',
      data: query,
    });
  } catch (err) {
    console.error('Error submitting query:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to submit query. Please try again or message our Telegram desk.',
    });
  }
};

// 2. Get All Queries (Admin Protected)
export const getAllQueries = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const queries = await QueryMessage.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: queries.length,
      data: queries,
    });
  } catch (err) {
    console.error('Error fetching queries:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch user queries.' });
  }
};

// 3. Update Query Status / Add Notes (Admin Protected)
export const updateQueryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const query = await QueryMessage.findById(id);
    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found.' });
    }

    if (status) query.status = status;
    if (adminNotes !== undefined) query.adminNotes = adminNotes;

    await query.save();

    res.json({
      success: true,
      message: 'Query updated successfully.',
      data: query,
    });
  } catch (err) {
    console.error('Error updating query:', err);
    res.status(500).json({ success: false, message: 'Failed to update query.' });
  }
};
