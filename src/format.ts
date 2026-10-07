// Display formats of the app: every date and time is shown in Paris time, in French.
// Date formatters accept a calendar date (`YYYY-MM-DD`, e.g. a date input value) or an
// ISO 8601 date-time from the API (shown on its Paris day).
const TIME_ZONE = 'Europe/Paris';
const LOCALE = 'fr-FR';

function parisFormat(options: Intl.DateTimeFormatOptions): (value: string) => string {
  const format = new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, ...options });
  // `YYYY-MM-DD` parses as UTC midnight, which is always the same day in Paris (UTC+1/+2).
  return (value) => format.format(new Date(value));
}

/** `2026-11-16` → `lundi 16 novembre 2026` */
export const formatLongDate = parisFormat({
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** `2026-11-16` → `lun. 16 nov. 2026` */
export const formatShortDate = parisFormat({
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/** `2026-10-12T09:00:00Z` → `lun. 12 oct.` */
export const formatDayMonth = parisFormat({ weekday: 'short', day: 'numeric', month: 'short' });

/** `2026-10-12T09:00:00Z` → `11:00` (Paris time). */
export const formatTime = parisFormat({ hour: '2-digit', minute: '2-digit' });

// Output keeps Intl's non-breaking spaces (U+202F for thousands, U+00A0 before `€`).
const priceFormat = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'EUR' });
const shortPriceFormat = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'EUR',
  trailingZeroDisplay: 'stripIfInteger',
});

/** `135` → `135,00 €` (lists, summaries). */
export function formatPrice(amount: number): string {
  return priceFormat.format(amount);
}

/** `45` → `45 €`, `35.5` → `35,50 €` (room cards). */
export function formatShortPrice(amount: number): string {
  return shortPriceFormat.format(amount);
}

/** A Paris wall-clock moment, as the app's date and time inputs hold it. */
export interface ParisDateTime {
  /** `YYYY-MM-DD` */
  date: string;
  /** `HH:MM` */
  time: string;
}

const wallClockFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

function parisWallClock(timestamp: number): ParisDateTime {
  const parts = wallClockFormat.formatToParts(timestamp);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';
  return {
    date: `${part('year')}-${part('month')}-${part('day')}`,
    time: `${part('hour')}:${part('minute')}`,
  };
}

/** Milliseconds to add to UTC to get Paris time at that instant (1 or 2 hours). */
function parisOffset(timestamp: number): number {
  const { date, time } = parisWallClock(timestamp);
  return Date.parse(`${date}T${time}Z`) - timestamp;
}

/**
 * Paris date and time (`HH:MM` or a slot's `HH:MM:SS`) → ISO UTC date-time in the API's
 * format: `('2026-10-25', '10:00')` → `2026-10-25T09:00:00Z`.
 */
export function parisToUtc(date: string, time: string): string {
  const wallClockAsUtc = Date.parse(`${date}T${time.slice(0, 5)}Z`);
  // The offset depends on the instant itself: guess with the wall clock, then correct.
  const guess = wallClockAsUtc - parisOffset(wallClockAsUtc);
  const timestamp = wallClockAsUtc - parisOffset(guess);
  return `${new Date(timestamp).toISOString().slice(0, 19)}Z`;
}

/** ISO UTC date-time → Paris date and time: `2026-10-12T09:00:00Z` → `2026-10-12`, `11:00`. */
export function utcToParis(isoDateTime: string): ParisDateTime {
  return parisWallClock(Date.parse(isoDateTime));
}
