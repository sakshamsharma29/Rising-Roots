// Telegram Bot Integration Service
export async function sendBroadcastSignal(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!token || !channelId) {
    console.log('📢 [Telegram Service] Simulated Broadcast:', message);
    return { success: true, simulated: true };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId,
        text: `🚀 RISING ROOTS ALERT:\n\n${message}`,
        parse_mode: 'HTML',
      }),
    });
    const data = await res.json();
    return { success: data.ok, data };
  } catch (err) {
    console.error('❌ [Telegram Service] Error sending message:', err.message);
    return { success: false, error: err.message };
  }
}

export async function generateInviteLink(memberEmail) {
  return `https://t.me/+RisingRootsVIP_${Buffer.from(memberEmail).toString('base64').substring(0, 8)}`;
}
