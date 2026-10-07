import { describe, expect, it } from 'vitest';
import {
  formatDayMonth,
  formatLongDate,
  formatPrice,
  formatShortDate,
  formatShortPrice,
  formatTime,
} from './format';

// Intl separates thousands with U+202F and the currency with U+00A0 (no line break inside).
const NBSP = '\u00a0';
const NNBSP = '\u202f';

describe('formatTime', () => {
  it('shows a UTC instant in Paris summer time (UTC+2)', () => {
    expect(formatTime('2026-10-12T09:00:00Z')).toBe('11:00');
  });

  it('shows a UTC instant in Paris winter time (UTC+1)', () => {
    expect(formatTime('2026-11-16T09:00:00Z')).toBe('10:00');
  });
});

describe('formatLongDate', () => {
  it('formats a calendar date (YYYY-MM-DD)', () => {
    expect(formatLongDate('2026-11-16')).toBe('lundi 16 novembre 2026');
  });

  it('formats the Paris day of a UTC instant', () => {
    expect(formatLongDate('2026-10-12T09:00:00Z')).toBe('lundi 12 octobre 2026');
    // 22:30 UTC is already the next day in Paris
    expect(formatLongDate('2026-10-12T22:30:00Z')).toBe('mardi 13 octobre 2026');
  });
});

describe('formatShortDate', () => {
  it('abbreviates weekday and month', () => {
    expect(formatShortDate('2026-11-16')).toBe('lun. 16 nov. 2026');
  });
});

describe('formatDayMonth', () => {
  it('drops the year', () => {
    expect(formatDayMonth('2026-10-12T09:00:00Z')).toBe('lun. 12 oct.');
  });
});

describe('formatPrice', () => {
  it('always shows two decimals', () => {
    expect(formatPrice(135)).toBe(`135,00${NBSP}€`);
    expect(formatPrice(1000)).toBe(`1${NNBSP}000,00${NBSP}€`);
  });
});

describe('formatShortPrice', () => {
  it('drops the decimals of a whole amount', () => {
    expect(formatShortPrice(45)).toBe(`45${NBSP}€`);
  });

  it('keeps two decimals otherwise', () => {
    expect(formatShortPrice(35.5)).toBe(`35,50${NBSP}€`);
  });
});
