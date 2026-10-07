// Display formats of the app: every date and time is shown in Paris time, in French.
const TIME_ZONE = 'Europe/Paris';
const LOCALE = 'fr-FR';

const timeFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
});

/** `2026-10-12T09:00:00Z` → `11:00` (Paris time). */
export function formatTime(isoDateTime: string): string {
  return timeFormat.format(new Date(isoDateTime));
}
