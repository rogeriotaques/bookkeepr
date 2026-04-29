import { describe, it, expect } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import DashboardPage from '@/pages/DashboardPage.vue';
import TransactionEntryPage from '@/pages/TransactionEntryPage.vue';
import TransactionHistoryPage from '@/pages/TransactionHistoryPage.vue';
import PlanningPage from '@/pages/PlanningPage.vue';

describe('Placeholder Pages', () => {
  it('DashboardPage renders without error', () => {
    const wrapper = mount(DashboardPage, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    });
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain("You're doing great!");
  });

  it('TransactionEntryPage renders without error', () => {
    const wrapper = mount(TransactionEntryPage, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    });
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('Transaction');
  });

  it('TransactionHistoryPage renders without error', () => {
    const wrapper = mount(TransactionHistoryPage, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    });
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('History');
  });

  it('PlanningPage renders without error', () => {
    const wrapper = mount(PlanningPage);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('Planning');
  });
});
