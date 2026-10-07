import { describe, expect, it } from 'vitest';
import { formatTime } from './format';

describe('formatTime', () => {
  it('shows a UTC instant in Paris summer time (UTC+2)', () => {
    expect(formatTime('2026-10-12T09:00:00Z')).toBe('11:00');
  });

  it('shows a UTC instant in Paris winter time (UTC+1)', () => {
    expect(formatTime('2026-11-16T09:00:00Z')).toBe('10:00');
  });
});
