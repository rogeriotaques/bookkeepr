import { describe, it, expect } from 'vitest';

describe('Component Reorganization', () => {
  it('should have EntryForm in transactions directory', async () => {
    const mod = await import('@/components/transactions/EntryForm.vue');
    expect(mod).toBeDefined();
    expect(mod.default).toBeDefined();
  });

  it('should have BalanceTable in transactions directory', async () => {
    const mod = await import('@/components/transactions/BalanceTable.vue');
    expect(mod).toBeDefined();
    expect(mod.default).toBeDefined();
  });

  it('should have BalanceFilterForm in transactions directory', async () => {
    const mod = await import('@/components/transactions/BalanceFilterForm.vue');
    expect(mod).toBeDefined();
    expect(mod.default).toBeDefined();
  });
});
