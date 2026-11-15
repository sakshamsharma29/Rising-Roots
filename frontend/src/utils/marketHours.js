/**
 * Indian Market Hours Utility (NSE & BSE)
 * 
 * Rules:
 * - Trading Days: Monday to Friday (Saturday & Sunday are closed)
 * - Timezone: Indian Standard Time (IST - UTC+5:30)
 * - Regular Trading Session: 09:15 AM to 03:30 PM IST (09:15 - 15:30)
 * - Closing Session: 03:30 PM to 03:40 PM IST (15:30 - 15:40)
 * - Pre-Market Session: 09:00 AM to 09:15 AM IST (09:00 - 09:15)
 * - After Market (AMO): When market is closed (weekends & outside 09:15-15:40)
 */

export function getIndianMarketStatus() {
  const now = new Date();

  // Convert to Indian Standard Time (IST)
  const utcMillis = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utcMillis + (3600000 * 5.5));

  const dayOfWeek = istTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // Minutes from midnight IST:
  // 09:00 AM = 540 min
  // 09:15 AM = 555 min
  // 03:30 PM = 930 min (15:30)
  // 03:40 PM = 940 min (15:40)

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = dayNames[dayOfWeek];

  let isOpen = false;
  let session = 'closed'; // 'live' | 'closing' | 'pre-open' | 'weekend' | 'post-market'
  let statusText = 'MARKET CLOSED';
  let badgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  let dotClass = 'bg-rose-500';
  let bannerMessage = '';
  let timingLabel = 'Mon – Fri, 09:15 AM – 03:40 PM IST';

  if (isWeekend) {
    isOpen = false;
    session = 'weekend';
    statusText = `MARKET CLOSED (${currentDayName.toUpperCase()})`;
    badgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    dotClass = 'bg-amber-400';
    bannerMessage = `${currentDayName} Weekend • NSE & BSE are closed. Trading resumes Monday at 09:15 AM IST.`;
  } else if (totalMinutes >= 555 && totalMinutes < 930) {
    // 09:15 AM to 03:30 PM
    isOpen = true;
    session = 'live';
    statusText = 'NSE/BSE LIVE';
    badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    dotClass = 'bg-emerald-400 animate-ping';
    bannerMessage = 'Live Trading Session Active (09:15 AM - 03:30 PM IST). Real-time ticks active.';
  } else if (totalMinutes >= 930 && totalMinutes < 940) {
    // 03:30 PM to 03:40 PM
    isOpen = false;
    session = 'closing';
    statusText = 'CLOSING SESSION';
    badgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    dotClass = 'bg-amber-400 animate-pulse';
    bannerMessage = 'Market Closing Session (03:30 - 03:40 PM IST). Post-market VWAP calculation.';
  } else if (totalMinutes >= 540 && totalMinutes < 555) {
    // 09:00 AM to 09:15 AM
    isOpen = false;
    session = 'pre-open';
    statusText = 'PRE-MARKET';
    badgeClass = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    dotClass = 'bg-blue-400';
    bannerMessage = 'Pre-Open Session Active (09:00 - 09:15 AM IST). Order discovery in progress.';
  } else {
    // Weekday outside trading hours
    isOpen = false;
    session = 'post-market';
    statusText = 'MARKET CLOSED';
    badgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    dotClass = 'bg-rose-500';
    if (totalMinutes < 540) {
      bannerMessage = 'Pre-Market • Market opens today at 09:15 AM IST.';
    } else {
      bannerMessage = 'Post-Market (AMO Open) • Regular trading resumes next market day at 09:15 AM IST.';
    }
  }

  // Format IST clock string (e.g. "07:45:20 PM IST")
  const istTimeString = istTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }) + ' IST';

  return {
    isOpen,
    session,
    statusText,
    badgeClass,
    dotClass,
    bannerMessage,
    timingLabel,
    istTimeString,
    currentDayName,
    isWeekend,
  };
}
