import { describe, expect, it } from 'vitest';
import { estimatePrice } from './pricing';

describe('estimatePrice', () => {
  it('multiplies the hourly price by the booked duration', () => {
    // 15:00 → 18:00 in Paris (UTC+1 in November)
    expect(estimatePrice(45, '2026-11-16T14:00:00Z', '2026-11-16T17:00:00Z')).toBe(135);
  });

  it('bills a partial hour pro rata', () => {
    expect(estimatePrice(40, '2026-11-16T14:00:00Z', '2026-11-16T15:30:00Z')).toBe(60);
  });
});
