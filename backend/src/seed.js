import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from './db.js';
import User from './models/User.js';
import Member from './models/Member.js';
import Plan from './models/Plan.js';
import Organization from './models/Organization.js';

dotenv.config();

const seed = async () => {
  await connectDB();

  console.log('🌱 Seeding multi-tenant database...');

  // Drop old unique index on members.email if it exists
  try {
    await Member.collection.dropIndex('email_1');
    console.log('  ✓ Dropped legacy global unique email index on members');
  } catch (err) {
    // Index may not exist or already dropped
  }

  // 1. Admin user
  const adminEmail = 'admin@risingroots.com';
  let adminUser = await User.findOne({ email: adminEmail });
  if (!adminUser) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('admin123', salt);
    adminUser = await User.create({
      name: 'Admin Trader',
      email: adminEmail,
      passwordHash: hash,
      role: 'admin',
    });
    console.log('  ✓ Created admin user (admin@risingroots.com / admin123)');
  }

  // 2. Default Organization
  let org = await Organization.findOne({ inviteCode: 'RR-ALPHA-2026' });
  if (!org) {
    org = await Organization.create({
      name: 'Rising Roots Alpha',
      ownerId: adminUser.id,
      inviteCode: 'RR-ALPHA-2026',
      slug: 'rising-roots',
      branding: { primaryColor: '#10b981' },
    });
    console.log('  ✓ Created default Organization (Rising Roots Alpha / Code: RR-ALPHA-2026)');
  }

  // Associate Admin with orgId
  if (!adminUser.orgId) {
    adminUser.orgId = org.id;
    await adminUser.save();
  }

  // Update any existing unassigned members with orgId
  await Member.updateMany({ orgId: null }, { $set: { orgId: org.id } });
  await Plan.updateMany({ orgId: null }, { $set: { orgId: org.id } });

  // 3. Sample members
  const memberCount = await Member.countDocuments({ orgId: org.id });
  if (memberCount === 0) {
    await Member.create([
      { orgId: org.id, name: 'Alice Smith', email: 'alice@example.com', plan: 'Pro Trader', status: 'Active', joinedDate: new Date('2026-08-12') },
      { orgId: org.id, name: 'Bob Johnson', email: 'bob@example.com', plan: 'Community Pass', status: 'Active', joinedDate: new Date('2026-08-20') },
      { orgId: org.id, name: 'Charlie Brown', email: 'charlie@example.com', plan: 'VIP Signals', status: 'Expired', joinedDate: new Date('2026-07-01') },
      { orgId: org.id, name: 'Diana Prince', email: 'diana@example.com', plan: 'Pro Trader', status: 'Active', joinedDate: new Date('2026-09-02') },
      { orgId: org.id, name: 'Ethan Hunt', email: 'ethan@example.com', plan: 'VIP Signals', status: 'Active', joinedDate: new Date('2026-09-10') },
    ]);
    console.log('  ✓ Created 5 sample members for Team Alpha');
  }

  // 4. Sample plans
  const planCount = await Plan.countDocuments({ orgId: org.id });
  if (planCount === 0) {
    await Plan.create([
      {
        _id: 'pro',
        orgId: org.id,
        name: 'Pro Trader',
        price: '₹2,499/mo',
        subscribers: 620,
        status: 'Active',
        features: ['Daily Trading Signals', 'Live Stream Access', 'Telegram VIP Group', 'Weekly Q&A'],
      },
      {
        _id: 'vip',
        orgId: org.id,
        name: 'VIP Signals & Mentorship',
        price: '₹4,999/mo',
        subscribers: 362,
        status: 'Active',
        features: ['1-on-1 Mentorship', 'Options Scalping Signals', 'Algo Trading Bot Access', 'Priority Support'],
      },
      {
        _id: 'starter',
        orgId: org.id,
        name: 'Community Pass',
        price: '₹999/mo',
        subscribers: 268,
        status: 'Active',
        features: ['Discord Access', 'Daily Market Briefing', 'Educational Content'],
      },
    ]);
    console.log('  ✓ Created 3 sample plans for Team Alpha');
  }

  console.log('✓ Seeding complete.');
  process.exit(0);
};

seed();
