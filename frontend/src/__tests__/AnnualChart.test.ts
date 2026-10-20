import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, h, Suspense } from 'vue';
import AnnualChart from '@/components/report/AnnualChart.vue';

const reportData = {
  income: [['01 - Salary', 100, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
  outcome: [['02 - Rent', 50, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
  balance: ['-', 50, 140, 140, 140, 140, 140, 140, 140, 140, 140, 140, 140],
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
    // One line (balance) + income + outcome series.
    expect(chart.props('data').datasets.length).toBe(3);
  });

  it('plots the cumulative annual balance, not the monthly net', async () => {
    (useDataFetch as any).mockReturnValue(mockFetch({ year: 2025, data: reportData }));

    const wrapper = mountWithSuspense({ year: 2025 });
    await flushPromises();

    const chart = wrapper.findComponent({ name: 'Bar' });
    const balance = chart.props('data').datasets.find((d: any) => d.label === 'Balance');
    expect(balance.data).toEqual([50, 190, 330, 470, 610, 750, 890, 1030, 1170, 1310, 1450, 1590]);
  });

  it('shows an empty state when the report is empty', async () => {
    (useDataFetch as any).mockReturnValue(mockFetch(null));

    const wrapper = mountWithSuspense({ year: 2025 });
    await flushPromises();

    expect(wrapper.text()).toContain('No data for 2025');
    expect(wrapper.findComponent({ name: 'Bar' }).exists()).toBe(false);
  });
});
