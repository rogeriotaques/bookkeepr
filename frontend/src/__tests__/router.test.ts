import { describe, it, expect } from 'vitest';
import { routes } from '@/domain/router';

describe('Router', () => {
  it('should have a Dashboard route at /', () => {
    const route = routes.find((r) => r.path === '/');
    expect(route).toBeDefined();
    expect(route.name).toBe('Dashboard');
  });

  it('should have an Entry route at /entry', () => {
    const route = routes.find((r) => r.path === '/entry');
    expect(route).toBeDefined();
    expect(route.name).toBe('Entry');
  });

  it('should have a History route at /history', () => {
    const route = routes.find((r) => r.path === '/history');
    expect(route).toBeDefined();
    expect(route.name).toBe('History');
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

  it('should not have /report route anymore', () => {
    const route = routes.find((r) => r.path === '/report');
    expect(route).toBeUndefined();
  });
});
