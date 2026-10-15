import { describe, it, expect } from 'vitest';
import { routes } from '@/domain/router';

describe('Router', () => {
  it('should have a Dashboard route at /', () => {
    const route = routes.find((r) => r.path === '/');
    expect(route).toBeDefined();
    expect(route.name).toBe('Dashboard');
  });

  it('should have a Transactions route at /transactions', () => {
    const route = routes.find((r) => r.path === '/transactions');
    expect(route).toBeDefined();
    expect(route.name).toBe('Transactions');
  });

  it('should redirect the retired /entry and /history routes', () => {
    expect(routes.find((r) => r.path === '/entry')?.redirect).toBe('/transactions');
    expect(routes.find((r) => r.path === '/history')?.redirect).toBe('/transactions');
  });

  it('should have a Planning route at /planning', () => {
    const route = routes.find((r) => r.path === '/planning');
    expect(route).toBeDefined();
    expect(route.name).toBe('Planning');
  });

  it('should keep Settings routes', () => {
    const route = routes.find((r) => r.path === '/settings');
    expect(route).toBeDefined();
    expect(route.children).toBeDefined();
    expect(route.children.length).toBeGreaterThanOrEqual(3);
  });

  it('should have a Report route at /report', () => {
    const route = routes.find((r) => r.path === '/report');
    expect(route).toBeDefined();
    expect(route.name).toBe('Report');
  });
});
