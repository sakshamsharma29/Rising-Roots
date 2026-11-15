import mongoose from 'mongoose';
import User from './models/User.js';
import Member from './models/Member.js';
import Plan from './models/Plan.js';
import Trade from './models/Trade.js';
import JoinRequest from './models/JoinRequest.js';

async function viewDatabase() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/rising_roots');
    console.log('\n======================================================');
    console.log('       🗄️  RISING ROOTS DATABASE OVERVIEW             ');
    console.log('   Connection: mongodb://127.0.0.1:27017/rising_roots ');
    console.log('======================================================\n');

    // 1. Users
    const users = await User.find({}, 'name email role createdAt');
    console.log(`👤 USERS (${users.length} Registered Accounts):`);
    console.table(
      users.map((u) => ({
        ID: u._id.toString().slice(-6),
        Name: u.name,
        Email: u.email,
        Role: u.role,
      }))
    );

    // 2. Members
    const members = await Member.find({}, 'name email plan status joinedDate expiresAt');
    console.log(`\n👥 MEMBERS (${members.length} Subscribers):`);
    console.table(
      members.map((m) => ({
        ID: m._id.toString().slice(-6),
        Name: m.name,
        Email: m.email,
        Plan: m.plan,
        Status: m.status,
      }))
    );

    // 3. Plans
    const plans = await Plan.find({}, 'name price subscribers status');
    console.log(`\n💳 PRICING TIERS (${plans.length} Plans):`);
    console.table(
      plans.map((p) => ({
        ID: p._id.toString().slice(-6),
        Name: p.name,
        Price: p.price,
        Subscribers: p.subscribers,
        Status: p.status,
      }))
    );

    // 4. Trades
    const trades = await Trade.find({}, 'symbol assetType tradeType entryPrice exitPrice outcome');
    if (trades.length > 0) {
      console.log(`\n📈 TRADES JOURNAL (${trades.length} Trades):`);
      console.table(
        trades.slice(0, 5).map((t) => ({
          Symbol: t.symbol,
          Type: t.tradeType,
          Entry: t.entryPrice,
          Exit: t.exitPrice || 'OPEN',
          Outcome: t.outcome,
        }))
      );
    }

    // 5. Join Requests
    const reqs = await JoinRequest.find({}, 'name email preferredPlan status');
    if (reqs.length > 0) {
      console.log(`\n📩 JOIN REQUESTS (${reqs.length} Applications):`);
      console.table(
        reqs.map((r) => ({
          Name: r.name,
          Email: r.email,
          Plan: r.preferredPlan,
          Status: r.status,
        }))
      );
    }

    console.log('\n✓ Database query complete.\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database query error:', err.message);
    process.exit(1);
  }
}

viewDatabase();
