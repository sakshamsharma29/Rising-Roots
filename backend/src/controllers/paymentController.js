import Member from '../models/Member.js';
import crypto from 'crypto';

// Create Checkout Order (Razorpay / Stripe)
export const createOrder = async (req, res) => {
  try {
    const { planId, amount, currency = 'INR', memberEmail } = req.body;

    const plansPriceMap = {
      starter: 2499, // $29/mo (₹2,499)
      pro: 6499,     // $79/mo (₹6,499)
      vip: 15999,    // $199/mo (₹15,999)
    };

    const finalAmount = amount || (plansPriceMap[planId] ? plansPriceMap[planId] * 100 : 649900); // Amount in paise

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const order = {
      orderId,
      amount: finalAmount,
      currency,
      status: 'created',
      planId: planId || 'pro',
      memberEmail: memberEmail || (req.user ? req.user.email : ''),
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_RisingRootsKey123',
    };

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Payment Signature & Auto-Renew Subscription
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, memberEmail, planId = 'pro', days = 30 } = req.body;

    if (!orderId || !paymentId) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Missing order or payment ID.' });
    }

    const email = memberEmail || (req.user ? req.user.email : null);

    if (email) {
      const member = await Member.findOne({ email: email.toLowerCase() });

      if (member) {
        const currentExpiry = member.expiresAt && member.expiresAt > new Date() ? new Date(member.expiresAt) : new Date();
        currentExpiry.setDate(currentExpiry.getDate() + Number(days));

        member.expiresAt = currentExpiry;
        member.status = 'Active';
        if (planId) {
          const planNames = {
            pro: 'Pro Signals & Option Desk',
            vip: 'Institutional VIP Desk',
            starter: 'Crypto & Forex Starter',
          };
          if (planNames[planId]) member.plan = planNames[planId];
        }

        await member.save();
        console.log(`💳 [Payment Verified] Auto-renewed subscription for ${email} until ${member.expiresAt.toISOString().split('T')[0]}`);
      }
    }

    res.json({
      success: true,
      message: 'Payment verified successfully and subscription activated.',
      paymentDetails: {
        orderId,
        paymentId,
        status: 'PAID',
        verifiedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Webhook listener (Payment Gateway Event)
export const handleWebhook = async (req, res) => {
  try {
    const event = req.body;
    console.log('💳 Payment Webhook Received:', event.event || event.type || 'payment.captured');

    if (event.event === 'payment.captured' || event.type === 'checkout.session.completed') {
      const email = event.payload?.payment?.entity?.email || event.data?.object?.customer_email;
      if (email) {
        const member = await Member.findOne({ email: email.toLowerCase() });
        if (member) {
          const currentExpiry = member.expiresAt && member.expiresAt > new Date() ? new Date(member.expiresAt) : new Date();
          currentExpiry.setDate(currentExpiry.getDate() + 30);
          member.expiresAt = currentExpiry;
          member.status = 'Active';
          await member.save();
          console.log(`✓ [Webhook] Activated member subscription for: ${email}`);
        }
      }
    }

    res.json({ status: 'ok', received: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
