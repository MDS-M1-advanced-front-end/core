const MS_PER_HOUR = 3_600_000;

/**
 * Price shown before booking: hourly price × duration, pro rata for a partial hour.
 * Contract anomaly #7: the API gives no price before POST /reservations; the
 * `totalAmount` it returns afterwards is the reference.
 *
 * @param startAt ISO 8601 date-time, e.g. `2026-11-16T14:00:00Z`
 * @param endAt ISO 8601 date-time, after `startAt`
 */
export function estimatePrice(pricePerHour: number, startAt: string, endAt: string): number {
  const hours = (Date.parse(endAt) - Date.parse(startAt)) / MS_PER_HOUR;
  return pricePerHour * hours;
}
