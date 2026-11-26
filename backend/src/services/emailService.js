import nodemailer from 'nodemailer';

/**
 * Dedicated Application Email Service for Rising Roots
 * Handles automated transactional emails:
 * - Welcome & KYC submission receipts
 * - KYC approval and rejection notifications
 * - Contact query confirmations to users
 * - Instant administrative alert dispatches
 */

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_USER = process.env.SMTP_USER || process.env.APP_EMAIL || '';
const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || '';
const EMAIL_FROM = process.env.EMAIL_FROM || (SMTP_USER ? `"Rising Roots Desk" <${SMTP_USER}>` : '"Rising Roots Desk" <notifications@risingroots.com>');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@risingroots.com';
const APP_URL = process.env.APP_URL || 'https://rising-roots.onrender.com';

let transporter = null;

if (SMTP_USER && SMTP_PASS) {
  try {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for 465, false for 587
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    console.log(`[Email Service] Initialized dedicated SMTP transport via ${SMTP_HOST}:${SMTP_PORT} (${SMTP_USER})`);
  } catch (err) {
    console.warn('[Email Service] Failed to initialize SMTP transport, running in simulation mode:', err.message);
    transporter = null;
  }
} else {
  console.log('[Email Service] No SMTP_USER/SMTP_PASS found in env. Running in simulation mode (emails will be logged to console).');
}

/**
 * Helper to build the branded HTML wrapper
 */
const buildBrandedEmailHtml = ({ title, preheader, badge, badgeColor, contentHtml, ctaText, ctaUrl }) => {
  const primaryColor = badgeColor || '#10b981'; // Emerald default
  const actionButton = ctaText && ctaUrl ? `
    <div style="margin: 32px 0 24px 0; text-align: center;">
      <a href="${ctaUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; letter-spacing: 0.05em; text-transform: uppercase; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);">
        ${ctaText} &rarr;
      </a>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; line-height: 1.6;">
  <div style="display: none; font-size: 1px; color: #0b0f17; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader || title}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b0f17; min-height: 100vh; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" max-width="600" style="max-width: 600px; background-color: #111827; border: 1px solid #1f2937; border-radius: 14px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- Header Bar -->
          <tr>
            <td style="background: linear-gradient(180deg, #161e2e 0%, #111827 100%); padding: 28px 32px; border-bottom: 1px solid #1f2937; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="display: flex; align-items: center;">
                      <div style="font-size: 20px; font-weight: 900; letter-spacing: 0.08em; color: #ffffff; text-transform: uppercase;">
                        RISING<span style="color: #10b981;">ROOTS</span>
                      </div>
                    </div>
                    <div style="font-size: 11px; letter-spacing: 0.15em; color: #94a3b8; text-transform: uppercase; margin-top: 2px;">
                      Institutional Derivatives Desk
                    </div>
                  </td>
                  ${badge ? `
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: ${primaryColor}; background-color: rgba(16, 185, 129, 0.12); border: 1px solid ${primaryColor}40; border-radius: 9999px;">
                      ${badge}
                    </span>
                  </td>` : ''}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                ${title}
              </h1>
              
              <div style="color: #cbd5e1; font-size: 15px; line-height: 1.7;">
                ${contentHtml}
              </div>

              ${actionButton}
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="background-color: #0d131f; padding: 20px 32px; border-top: 1px solid #1f2937; font-size: 12px; color: #64748b; line-height: 1.6;">
              <strong style="color: #94a3b8;">Trading Desk Security:</strong>
              Rising Roots administrators will never ask for your private password or 2FA seed phrase. All institutional updates are signed and dispatched strictly through this dedicated application email.
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0b0f17; padding: 24px 32px; text-align: center; border-top: 1px solid #1a2233; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 8px 0;">
                &copy; ${new Date().getFullYear()} Rising Roots Desk. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                Dedicated Application Mailer &bull; <a href="${APP_URL}" style="color: #10b981; text-decoration: none;">Launch Web Terminal</a> &bull; FIU-IND Compliant
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Universal safe send email method
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    console.warn('[Email Service] Send aborted: No recipient specified.');
    return { success: false, reason: 'No recipient' };
  }

  // If live transporter configured, send via SMTP
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: EMAIL_FROM,
        to,
        subject,
        text: text || subject,
        html,
      });
      console.log(`[Email Service] Dispatched email to ${to} (MessageId: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[Email Service] SMTP Transmission Error to ${to}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  // Graceful simulation fallback
  console.log('------------------------------------------------------------');
  console.log(`[EMAIL SIMULATION] Outbound dispatch from dedicated app email:`);
  console.log(`From:    ${EMAIL_FROM}`);
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('------------------------------------------------------------');
  return { success: true, simulated: true };
};

/**
 * 1. User Registration & KYC Received Notification
 */
export const sendWelcomeEmail = async ({ to, name, idType, idNumber, role }) => {
  const contentHtml = `
    <p>Dear <strong>${name}</strong>,</p>
    <p>Welcome to <strong>Rising Roots Institutional Desk</strong>. Your application account has been successfully initialized.</p>
    
    <div style="background-color: #1a2234; border: 1px solid #2d3748; border-radius: 8px; padding: 18px; margin: 20px 0;">
      <div style="font-weight: 700; color: #f8fafc; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
        Account & Verification Summary
      </div>
      <table style="width: 100%; font-size: 13px; color: #cbd5e1;">
        <tr>
          <td style="padding: 4px 0; color: #94a3b8; width: 140px;">Desk Role:</td>
          <td style="font-weight: 600; color: #10b981;">${role === 'admin' ? 'Desk Administrator' : 'Standard Trader'}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #94a3b8;">Email Address:</td>
          <td style="font-weight: 600; color: #f1f5f9;">${to}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #94a3b8;">Identity Verification:</td>
          <td style="font-weight: 600; color: #f59e0b;">Pending Audit (${idType || 'Document'} submitted)</td>
        </tr>
      </table>
    </div>

    <p>Our compliance team is currently reviewing your uploaded ID proof against FIU-IND compliance standards. You will receive an automated notification as soon as verification is finalized.</p>
    <p>In the meantime, you may access the portal to review market analytics, options volatility monitors, and historical desk track records.</p>
  `;

  const html = buildBrandedEmailHtml({
    title: 'Welcome to Rising Roots Trading Desk',
    preheader: 'Your account is ready and KYC documents are under review.',
    badge: 'Registration Confirmed',
    badgeColor: '#10b981',
    contentHtml,
    ctaText: 'Access Trading Terminal',
    ctaUrl: `${APP_URL}/login`,
  });

  return sendEmail({
    to,
    subject: 'Welcome to Rising Roots — KYC Documents Received',
    html,
    text: `Welcome to Rising Roots, ${name}. Your account is created and your KYC is under review. Access terminal: ${APP_URL}/login`,
  });
};

/**
 * 2. KYC Approved Notification
 */
export const sendKycApprovedEmail = async ({ to, name, idType }) => {
  const contentHtml = `
    <p>Dear <strong>${name}</strong>,</p>
    <p>We are pleased to inform you that your <strong>${idType || 'Government ID'}</strong> verification has been <strong style="color: #10b981;">officially verified and approved</strong> by our desk compliance officers.</p>
    
    <div style="background-color: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 18px; margin: 20px 0;">
      <div style="display: flex; align-items: center; color: #10b981; font-weight: 700; font-size: 15px; margin-bottom: 6px;">
        &#10003; Verification Complete &bull; Verified Member
      </div>
      <p style="margin: 0; font-size: 13px; color: #cbd5e1;">
        Your profile is fully compliant under SEBI / FIU-IND risk and identity guidelines. Full execution terminal permissions are unlocked.
      </p>
    </div>

    <p>You can now log in to review live Delta Exchange institutional flows, historical trade records, and verified execution setups.</p>
  `;

  const html = buildBrandedEmailHtml({
    title: 'KYC Verification Approved',
    preheader: 'Your identity documents have been approved by Rising Roots compliance.',
    badge: 'KYC Verified',
    badgeColor: '#10b981',
    contentHtml,
    ctaText: 'Open Member Dashboard',
    ctaUrl: `${APP_URL}/dashboard`,
  });

  return sendEmail({
    to,
    subject: 'KYC Verification Approved — Rising Roots Desk',
    html,
    text: `Congratulations ${name}, your KYC has been verified. Open dashboard: ${APP_URL}/dashboard`,
  });
};

/**
 * 3. KYC Rejected Notification
 */
export const sendKycRejectedEmail = async ({ to, name, idType, reason }) => {
  const rejectionReason = reason || 'Document image was blurry, truncated, or did not match registered details.';

  const contentHtml = `
    <p>Dear <strong>${name}</strong>,</p>
    <p>During the review of your <strong>${idType || 'Government ID'}</strong>, our compliance team encountered an issue and was unable to complete verification.</p>
    
    <div style="background-color: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 18px; margin: 20px 0;">
      <div style="color: #ef4444; font-weight: 700; font-size: 14px; margin-bottom: 6px; text-transform: uppercase;">
        Reason for Rejection:
      </div>
      <p style="margin: 0; font-size: 14px; color: #fca5a5; font-style: italic;">
        "${rejectionReason}"
      </p>
    </div>

    <p><strong>Next Steps:</strong> Please log in to your account, navigate to your <strong>Profile & KYC</strong> tab, and upload a clear, high-resolution original document copy (PNG, JPG, or PDF).</p>
    <p>Once re-submitted, our team will re-audit your submission within 2 to 4 business hours.</p>
  `;

  const html = buildBrandedEmailHtml({
    title: 'KYC Verification Action Required',
    preheader: 'Action required on your Rising Roots identity submission.',
    badge: 'Resubmission Required',
    badgeColor: '#ef4444',
    contentHtml,
    ctaText: 'Update KYC Document',
    ctaUrl: `${APP_URL}/profile`,
  });

  return sendEmail({
    to,
    subject: 'Action Required: KYC Verification Update — Rising Roots Desk',
    html,
    text: `Notice for ${name}: Your KYC requires re-submission. Reason: ${rejectionReason}. Update document: ${APP_URL}/profile`,
  });
};

/**
 * 4. User Query Confirmation (Sent to User)
 */
export const sendQueryConfirmationEmail = async ({ to, name, subject }) => {
  const contentHtml = `
    <p>Dear <strong>${name}</strong>,</p>
    <p>Thank you for getting in touch with <strong>Rising Roots Trading Desk</strong>.</p>
    <p>We have safely received your inquiry regarding <strong>"${subject || 'General Desk Consultation'}"</strong>.</p>
    
    <div style="background-color: #1a2234; border: 1px solid #2d3748; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <div style="color: #38bdf8; font-weight: 700; font-size: 13px; text-transform: uppercase; margin-bottom: 6px;">
        Desk Turnaround Standard
      </div>
      <p style="margin: 0; font-size: 13px; color: #cbd5e1;">
        Our team reviews inquiries on a rolling basis. Devendra Singh Rajput or Anil Daksh's team will connect with you via WhatsApp or Email within 2 hours during market operational cycles.
      </p>
    </div>

    <p>If your matter is urgent regarding active derivatives execution, please ping our desk directly on our verified communication channels.</p>
  `;

  const html = buildBrandedEmailHtml({
    title: 'Inquiry Received — Rising Roots Desk',
    preheader: 'We have received your query and our team will connect shortly.',
    badge: 'Ticket Logged',
    badgeColor: '#38bdf8',
    contentHtml,
    ctaText: 'Visit Rising Roots Desk',
    ctaUrl: APP_URL,
  });

  return sendEmail({
    to,
    subject: `Inquiry Received: ${subject || 'Rising Roots Trading Desk'}`,
    html,
    text: `Hello ${name}, we received your inquiry regarding ${subject}. Our desk will reply within 2 hours.`,
  });
};

/**
 * 5. Admin Notification Alert (Dispatched to ADMIN_EMAIL)
 */
export const sendAdminAlertEmail = async ({ alertType, title, detailsHtml }) => {
  const adminRecipient = ADMIN_EMAIL;
  if (!adminRecipient) return;

  const contentHtml = `
    <p>Desk Administrator,</p>
    <p>An automated operational event has been logged on the <strong>Rising Roots Terminal</strong>:</p>
    
    <div style="background-color: #1a2234; border: 1px solid #334155; border-radius: 8px; padding: 20px; margin: 20px 0;">
      ${detailsHtml}
    </div>

    <p style="font-size: 13px; color: #94a3b8;">
      Please access the Admin Portal to review, verify documents, or reply to queries.
    </p>
  `;

  const html = buildBrandedEmailHtml({
    title: title || 'Rising Roots Desk Alert',
    preheader: `Admin Alert: ${alertType || 'System Event'}`,
    badge: alertType || 'Admin Alert',
    badgeColor: '#f59e0b',
    contentHtml,
    ctaText: 'Open Admin Portal',
    ctaUrl: `${APP_URL}/members`,
  });

  return sendEmail({
    to: adminRecipient,
    subject: `[Desk Alert] ${title || alertType || 'New Operational Event'}`,
    html,
    text: `Admin Alert: ${title}. Open portal: ${APP_URL}/members`,
  });
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendKycApprovedEmail,
  sendKycRejectedEmail,
  sendQueryConfirmationEmail,
  sendAdminAlertEmail,
};
