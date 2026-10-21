import { describe, it, expect } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import TransactionEntryPage from '@/pages/TransactionEntryPage.vue';
import TransactionHistoryPage from '@/pages/TransactionHistoryPage.vue';

describe('Placeholder Pages', () => {
  it('TransactionEntryPage is importable', async () => {
    const mod = await import('@/pages/TransactionEntryPage.vue');
    expect(mod).toBeDefined();
    expect(mod.default).toBeDefined();
  });

  it('TransactionHistoryPage is importable', async () => {
    const mod = await import('@/pages/TransactionHistoryPage.vue');
    expect(mod).toBeDefined();
    expect(mod.default).toBeDefined();
  });
});
