import { describe, it, expect } from 'vitest';

describe('App.vue', () => {
  it('should be importable', async () => {
    const App = await import('@/App.vue');
    expect(App).toBeDefined();
    expect(App.default).toBeDefined();
  });
});
