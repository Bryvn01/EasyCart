import { formatPrice, formatPriceWithCurrency, formatPriceLocale } from '../formatPrice';

describe('formatPrice', () => {
  it('should format valid number with 2 decimal places', () => {
    expect(formatPrice(100)).toBe('100.00');
    expect(formatPrice(99.99)).toBe('99.99');
    expect(formatPrice(1234.567)).toBe('1234.57');
  });

  it('should format string numbers correctly', () => {
    expect(formatPrice('100')).toBe('100.00');
    expect(formatPrice('99.99')).toBe('99.99');
    expect(formatPrice('1234.567')).toBe('1234.57');
  });

  it('should handle floating point precision issues', () => {
    // 0.1 + 0.2 = 0.30000000000000004 in JavaScript
    expect(formatPrice(0.1 + 0.2)).toBe('0.30');
    expect(formatPrice(10.1 * 3)).toBe('30.30');
  });

  it('should handle null, undefined, and empty values', () => {
    expect(formatPrice(null)).toBe('0.00');
    expect(formatPrice(undefined)).toBe('0.00');
    expect(formatPrice('')).toBe('0.00');
  });

  it('should handle NaN values', () => {
    expect(formatPrice('invalid')).toBe('0.00');
    expect(formatPrice(NaN)).toBe('0.00');
  });

  it('should handle custom decimal places', () => {
    expect(formatPrice(100, 0)).toBe('100');
    expect(formatPrice(100.567, 1)).toBe('100.6');
    expect(formatPrice(100.567, 3)).toBe('100.567');
  });

  it('should handle zero correctly', () => {
    expect(formatPrice(0)).toBe('0.00');
    expect(formatPrice('0')).toBe('0.00');
  });

  it('should handle negative numbers', () => {
    expect(formatPrice(-100)).toBe('-100.00');
    expect(formatPrice(-99.99)).toBe('-99.99');
  });

  it('should handle very large numbers', () => {
    expect(formatPrice(1000000)).toBe('1000000.00');
    expect(formatPrice(1234567.89)).toBe('1234567.89');
  });
});

describe('formatPriceWithCurrency', () => {
  it('should format price with KSh currency symbol', () => {
    expect(formatPriceWithCurrency(100)).toBe('KSh 100.00');
    expect(formatPriceWithCurrency(99.99)).toBe('KSh 99.99');
  });

  it('should handle null and undefined', () => {
    expect(formatPriceWithCurrency(null)).toBe('KSh 0.00');
    expect(formatPriceWithCurrency(undefined)).toBe('KSh 0.00');
  });
});

describe('formatPriceLocale', () => {
  it('should format price with thousands separators', () => {
    expect(formatPriceLocale(1000)).toBe('1,000.00');
    expect(formatPriceLocale(1000000)).toBe('1,000,000.00');
  });

  it('should format decimals correctly', () => {
    expect(formatPriceLocale(1234.56)).toBe('1,234.56');
    expect(formatPriceLocale(100.1)).toBe('100.10');
  });

  it('should handle null and undefined', () => {
    expect(formatPriceLocale(null)).toBe('0.00');
    expect(formatPriceLocale(undefined)).toBe('0.00');
  });

  it('should handle string numbers', () => {
    expect(formatPriceLocale('1000')).toBe('1,000.00');
    expect(formatPriceLocale('1234.56')).toBe('1,234.56');
  });
});
