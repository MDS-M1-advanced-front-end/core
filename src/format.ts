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
