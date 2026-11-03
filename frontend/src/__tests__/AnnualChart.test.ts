import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, h, Suspense } from 'vue';
import AnnualChart from '@/components/report/AnnualChart.vue';

const reportData = {
  income: [
    ['01 - Salary', 100, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ['02 - Refund', 25, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  outcome: [
    ['02 - Rent', 50, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ['03 - Food', 5, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  balance: ['-', 70, 155, 155, 155, 155, 155, 155, 155, 155, 155, 155, 155],
  netWorth: ['-', 2070, 2155, 2155, 2155, 2155, 2155, 2155, 2155, 2155, 2155, 2155, 2155],
  tax: ['-', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

// vue-chartjs components have no `name`, so they cannot be stubbed by key.
// Mock the module to keep chart.js from touching a canvas in jsdom.
vi.mock('vue-chartjs', () => ({
  Bar: {
    name: 'Bar',
    props: {
      data: { type: Object, required: true },
      options: { type: Object, default: () => ({}) },
    },
    render: () => null,
  },
}));

vi.mock('@/composable/useDataFetch', () => ({
  default: vi.fn(),
}));

import useDataFetch from '@/composable/useDataFetch';

const mockFetch = (data: any) => ({
  fetchData: vi.fn(() => ({
    isLoading: ref(false),
    data: ref(data),
    isError: ref(false),
    error: ref(null),
  })),
  invalidateQuery: vi.fn(),
});

const mountWithSuspense = (props: any = {}) =>
  mount(
    { render: () => h(Suspense, null, { default: () => h(AnnualChart, props) }) },
    { global: { stubs: { BaseSkeleton: true } } }
  );

describe('AnnualChart', () => {
  it('shows the year in the title', async () => {
    (useDataFetch as any).mockReturnValue(mockFetch({ year: 2025, data: reportData }));

    const wrapper = mountWithSuspense({ year: 2025 });
    await flushPromises();
    expect(wrapper.text()).toContain('Annual overview 2025');
  });

  it('feeds the chart with the report data', async () => {
    (useDataFetch as any).mockReturnValue(mockFetch({ year: 2025, data: reportData }));

    const wrapper = mountWithSuspense({ year: 2025 });
    await flushPromises();

    const chart = wrapper.findComponent({ name: 'Bar' });
    expect(chart.exists()).toBe(true);
    expect(chart.props('data').labels.length).toBe(12);
    // One consolidated series per operation, plus the balance line.
    expect(chart.props('data').datasets.map((d: any) => d.label)).toEqual([
      'Income',
      'Outcome',
      'Balance',
    ]);
  });

  it('consolidates every category into one series per operation', async () => {
    (useDataFetch as any).mockReturnValue(mockFetch({ year: 2025, data: reportData }));

    const wrapper = mountWithSuspense({ year: 2025 });
    await flushPromises();

    const chart = wrapper.findComponent({ name: 'Bar' });
    const income = chart.props('data').datasets.find((d: any) => d.label === 'Income');
    const outcome = chart.props('data').datasets.find((d: any) => d.label === 'Outcome');

    // Jan: 100 + 25; Feb: 200 + 25.
    expect(income.data.slice(0, 2)).toEqual([125, 225]);
    // Expenses are drawn below zero: Jan: -(50 + 5); Feb: -(60 + 10).
    expect(outcome.data.slice(0, 2)).toEqual([-55, -70]);
  });

  it('plots the lifetime net worth, not the monthly net', async () => {
    (useDataFetch as any).mockReturnValue(mockFetch({ year: 2025, data: reportData }));

    const wrapper = mountWithSuspense({ year: 2025 });
    await flushPromises();

    const chart = wrapper.findComponent({ name: 'Bar' });
    const balance = chart.props('data').datasets.find((d: any) => d.label === 'Balance');
    expect(balance.data).toEqual(reportData.netWorth.slice(1));
  });

  it('shows an empty state when the report is empty', async () => {
    (useDataFetch as any).mockReturnValue(mockFetch(null));

    const wrapper = mountWithSuspense({ year: 2025 });
    await flushPromises();

    expect(wrapper.text()).toContain('No data for 2025');
    expect(wrapper.findComponent({ name: 'Bar' }).exists()).toBe(false);
  });
});
