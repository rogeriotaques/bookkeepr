import { describe, it, expect } from 'vitest';

describe('Frontend Test Infrastructure', () => {
  it('should run vitest in jsdom environment', () => {
    expect(typeof document).toBe('object');
    expect(typeof window).toBe('object');
  });
});
