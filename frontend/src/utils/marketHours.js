/**
 * Global Market Hours Utility for Crypto & Forex
 * 
 * Rules:
 * - Crypto Market: Trades 24/7/365 without interruption. Always LIVE.
 * - Forex Market: Trades 24 hours a day, 5 days a week.
 *   - Opens: Sunday 22:00 UTC (5:00 PM EST / Sydney Open)
 *   - Closes: Friday 22:00 UTC (5:00 PM EST / New York Close)
 *   - Major Sessions (UTC):
 *     - Sydney: 21:00 - 06:00 UTC
 *     - Tokyo: 00:00 - 09:00 UTC
 *     - London: 08:00 - 17:00 UTC
 *     - New York: 13:00 - 22:00 UTC
 */

export function getGlobalMarketStatus() {
  const now = new Date();

  // UTC calculations
  const utcDay = now.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const totalUtcMinutes = utcHours * 60 + utcMinutes;

  // Forex is closed from Friday 22:00 UTC to Sunday 22:00 UTC
  let isForexOpen = true;
  let forexSessionLabel = 'Global Trading';

  if (utcDay === 6) {
    // Saturday: all day closed
    isForexOpen = false;
    forexSessionLabel = 'Weekend Closed';
  } else if (utcDay === 5 && totalUtcMinutes >= 1320) {
    // Friday after 22:00 UTC (1320 mins)
    isForexOpen = false;
    forexSessionLabel = 'Weekend Closed';
  } else if (utcDay === 0 && totalUtcMinutes < 1320) {
    // Sunday before 22:00 UTC
    isForexOpen = false;
    forexSessionLabel = 'Weekend Closed';
  }

  // Active Sessions detection
  const activeSessions = [];
  if (isForexOpen) {
    // London: 08:00 - 17:00 UTC (480 - 1020)
    if (totalUtcMinutes >= 480 && totalUtcMinutes < 1020) activeSessions.push('London');
    // New York: 13:00 - 22:00 UTC (780 - 1320)
    if (totalUtcMinutes >= 780 && totalUtcMinutes < 1320) activeSessions.push('New York');
    // Tokyo: 00:00 - 09:00 UTC (0 - 540)
    if (totalUtcMinutes >= 0 && totalUtcMinutes < 540) activeSessions.push('Tokyo');
    // Sydney: 21:00 - 06:00 UTC (1260 - 1440 or 0 - 360)
    if (totalUtcMinutes >= 1260 || totalUtcMinutes < 360) activeSessions.push('Sydney');

    if (activeSessions.length > 0) {
      forexSessionLabel = activeSessions.join(' + ') + ' Session';
    }
  }

  // Clocks
  const utcTimeString = now.toLocaleTimeString('en-US', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }) + ' UTC';

  const localTimeString = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return {
    crypto: {
      isOpen: true,
      statusText: 'CRYPTO 24/7 LIVE',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dotClass: 'bg-emerald-400 animate-pulse',
      schedule: '24 Hours / 7 Days Non-Stop',
    },
    forex: {
      isOpen: isForexOpen,
      statusText: isForexOpen ? `FOREX LIVE (${forexSessionLabel})` : 'FOREX WEEKEND CLOSED',
      badgeClass: isForexOpen
        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
        : 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dotClass: isForexOpen ? 'bg-blue-400 animate-pulse' : 'bg-amber-400',
      activeSessions,
      sessionLabel: forexSessionLabel,
      schedule: '24/5 (Sun 22:00 UTC – Fri 22:00 UTC)',
    },
    utcTimeString,
    localTimeString,
    // Top-level helpers for backward compatibility
    isOpen: true, // Crypto is always open
    statusText: isForexOpen ? `CRYPTO & FOREX LIVE • ${forexSessionLabel}` : 'CRYPTO 24/7 LIVE • FOREX WEEKEND',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400 animate-pulse',
    timingLabel: 'Crypto: 24/7 | Forex: 24/5 UTC',
  };
}

// Backwards compatibility alias
export const getIndianMarketStatus = getGlobalMarketStatus;
