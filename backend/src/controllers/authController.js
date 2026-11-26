import User from '../models/User.js';
import Member from '../models/Member.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rising_roots_secret_key_2026';

export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      city,
      state,
      tradingExperience,
      idType,
      idNumber,
      idDocumentUrl,
      idDocumentBackUrl,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    
    // Security enforcement: ONLY the dedicated admin email can ever have 'admin' privileges
    const dedicatedAdminEmail = (process.env.ADMIN_EMAIL || 'admin@risingroots.com').toLowerCase().trim();
    const userRole = cleanEmail === dedicatedAdminEmail ? 'admin' : 'user';

    const kycState = (idNumber || idDocumentUrl) ? 'Pending' : 'Not Submitted';

    const newUser = await User.create({
      name,
      email: cleanEmail,
      passwordHash,
      role: userRole,
      phone: phone || '',
      city: city || '',
      state: state || '',
      tradingExperience: tradingExperience || 'Intermediate',
      idType: idType || 'PAN Card',
      idNumber: (idNumber || '').toUpperCase().trim(),
      idDocumentUrl: idDocumentUrl || '',
      idDocumentBackUrl: idDocumentBackUrl || '',
      kycStatus: kycState,
      kycSubmittedAt: new Date(),
    });

    // Always create a Member record for any user role
    if (userRole === 'user') {
      const checkMember = await Member.findOne({ email: cleanEmail });
      if (!checkMember) {
        await Member.create({
          name,
          email: cleanEmail,
          phone: phone || '',
          city: city || '',
          state: state || '',
          tradingExperience: tradingExperience || 'Intermediate',
          plan: 'Pro Trader',
          status: 'Active',
          idType: idType || 'PAN Card',
          idNumber: (idNumber || '').toUpperCase().trim(),
          idDocumentUrl: idDocumentUrl || '',
          idDocumentBackUrl: idDocumentBackUrl || '',
          kycStatus: kycState,
          kycSubmittedAt: new Date(),
          joinedDate: new Date(),
        });
      }
    }

    const payload = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      city: newUser.city,
      idType: newUser.idType,
      idNumber: newUser.idNumber,
      kycStatus: newUser.kycStatus,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ success: true, token, user: payload });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    // Auto-provision member if not found in User model (e.g. seeded member or testing member)
    const dedicatedAdminEmail = (process.env.ADMIN_EMAIL || 'admin@risingroots.com').toLowerCase().trim();
    if (!user) {
      // Do not auto-create admin with incorrect password
      if (cleanEmail === dedicatedAdminEmail) {
        return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
      }

      // Check if user exists in Member collection or auto-create
      const member = await Member.findOne({ email: cleanEmail });
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);

      user = await User.create({
        name: member ? member.name : cleanEmail.split('@')[0],
        email: cleanEmail,
        passwordHash,
        role: 'user',
      });

      if (!member) {
        await Member.create({
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          plan: 'Pro Trader',
          status: 'Active',
          joinedDate: new Date(),
        });
      }
    } else {
      const isMatch = bcrypt.compareSync(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }
    }

    // Ensure member record exists for any user with role 'user'
    if (user.role === 'user') {
      const checkMember = await Member.findOne({ email: user.email.toLowerCase() });
      if (!checkMember) {
        await Member.create({
          name: user.name,
          email: user.email.toLowerCase(),
          plan: 'Pro Trader',
          status: 'Active',
          joinedDate: new Date(),
        });
      }
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      city: user.city || '',
      idType: user.idType || 'PAN Card',
      idNumber: user.idNumber || '',
      kycStatus: user.kycStatus || 'Not Submitted',
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({ success: true, token, user: payload });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitKyc = async (req, res) => {
  try {
    const { email, idType, idNumber, idDocumentUrl, idDocumentBackUrl } = req.body;
    const userEmail = (email || (req.user && req.user.email) || '').toLowerCase().trim();

    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'User email is required.' });
    }
    if (!idNumber) {
      return res.status(400).json({ success: false, message: 'Government ID number is required.' });
    }

    const updateData = {
      idType: idType || 'PAN Card',
      idNumber: (idNumber || '').toUpperCase().trim(),
      idDocumentUrl: idDocumentUrl || '',
      idDocumentBackUrl: idDocumentBackUrl || '',
      kycStatus: 'Pending',
      kycSubmittedAt: new Date(),
      kycRejectionReason: '',
    };

    const user = await User.findOneAndUpdate({ email: userEmail }, updateData, { new: true });
    await Member.findOneAndUpdate({ email: userEmail }, updateData);

    res.json({
      success: true,
      message: 'Government ID proof submitted successfully. Pending compliance verification.',
      user: {
        id: user ? user.id : undefined,
        name: user ? user.name : '',
        email: userEmail,
        kycStatus: 'Pending',
        idType: updateData.idType,
        idNumber: updateData.idNumber,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
