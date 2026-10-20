import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, h, Suspense, defineComponent } from 'vue';
import ReportPage from '@/pages/ReportPage.vue';

const { reportData } = vi.hoisted(() => ({ reportData: { value: {} as any } }));

vi.mock('vue-chartjs', () => ({
  Bar: {
    name: 'Bar',
    props: {
      data: { type: Object, required: true },
      options: { type: Object, default: () => ({}) },
    },
    render: () => null,
  },
  Pie: {
    name: 'Pie',
    props: {
      data: { type: Object, required: true },
      options: { type: Object, default: () => ({}) },
    },
    render: () => null,
  },
}));

vi.mock('@/composable/useDataFetch', () => ({
  default: vi.fn(() => ({
    fetchData: vi.fn(() => ({
      isLoading: ref(false),
      isError: ref(false),
      data: ref(reportData.value),
      error: ref(null),
    })),
    invalidateQuery: vi.fn(),
  })),
}));

const BaseDropdownStub = defineComponent({
  name: 'BaseDropdown',
  props: {
    modelValue: { type: [String, Number], default: '' },
    options: { type: Array, default: () => [] },
    disabled: Boolean,
    fullWidth: Boolean,
  },
  render: () => h('div'),
});

const mountPage = () =>
  mount(
    { render: () => h(Suspense, null, { default: () => h(ReportPage) }) },
    {
      global: {
        stubs: {
          BaseDropdown: BaseDropdownStub,
          ProTip: true,
          ReportData: true,
        },
      },
    }
  );

describe('ReportPage', () => {
  beforeEach(() => {
    reportData.value = {};
  });

  it('renders the insights as boxes, not cards', async () => {
    const wrapper = mountPage();
    await flushPromises();

    const boxes = wrapper.findAll('.report-page__insights .box');
    expect(boxes).toHaveLength(4);
    expect(wrapper.findAll('.report-page__insights .card')).toHaveLength(0);
    expect(boxes[0].text()).toContain('Lifetime');
    expect(boxes[1].text()).toContain('This year');
  });

  it('shows lifetime income, expenses and balance in the first insight', async () => {
    reportData.value = {
      insights: { lifetime: { income: 6200, outcome: 2100 } },
    };

    const wrapper = mountPage();
    await flushPromises();

    const lifetime = wrapper.findAll('.report-page__insights .box')[0];
    expect(lifetime.text()).toContain('+ ￥6,200');
    expect(lifetime.text()).toContain('- ￥2,100');
    expect(lifetime.text()).toContain('￥4,100');
  });

  it('puts the year selector and print button in a control column on the right', async () => {
    const wrapper = mountPage();
    await flushPromises();

    const controls = wrapper.find('.report-page__controls');
    expect(controls.exists()).toBe(true);
    expect(controls.findComponent({ name: 'BaseDropdown' }).exists()).toBe(true);
    expect(controls.find('button').exists()).toBe(true);

    // The insights take the remaining width, to the left of the controls.
    expect(wrapper.find('.report-page__insights > .col-10').exists()).toBe(true);
    expect(wrapper.find('.report-page__insights > .col-2.report-page__controls').exists()).toBe(true);
  });

  it('gives the year selector and print button the same width', async () => {
    const wrapper = mountPage();
    await flushPromises();

    const controls = wrapper.findAll('.report-page__controls .report-page__control');
    expect(controls).toHaveLength(2);
  });

  it('plots the lifetime net worth instead of the monthly balance', async () => {
    const netWorth = ['-', 4100, 4200, 4300, 4400, 4500, 4600, 4700, 4800, 4900, 5000, 5100, 5200];
    reportData.value = {
      data: {
        balance: ['-', 3100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
        netWorth,
        income: [],
        outcome: [],
        tax: [],
      },
    };

    const wrapper = mountPage();
    await flushPromises();

    const chart = wrapper.findComponent({ name: 'Bar' });
    const line = chart.props('data').datasets.find((dataset: any) => dataset.label === 'Net worth');
    expect(line.data).toEqual(netWorth.slice(1));
    // `netWorth` is a line series only; it must not become a bar.
    expect(chart.props('data').datasets).toHaveLength(1);
  });

  it('puts net worth on the right-hand axis', async () => {
    reportData.value = {
      data: {
        netWorth: ['-', ...Array(12).fill(4100)],
        income: [],
        outcome: [],
      },
    };

    const wrapper = mountPage();
    await flushPromises();

    const chart = wrapper.findComponent({ name: 'Bar' });
    const line = chart.props('data').datasets.find((dataset: any) => dataset.label === 'Net worth');
    expect(line.yAxisID).toBe('y1');
    expect(chart.props('options').scales.y1.position).toBe('right');
    expect(chart.props('options').plugins.legend.position).toBe('top');
  });

  it('groups categories into a single income and a single expense series', async () => {
    const row = (label: string, jan: number, feb: number) => [label, jan, feb, ...Array(10).fill(0)];

    reportData.value = {
      data: {
        netWorth: ['-', ...Array(12).fill(4100)],
        income: [row('101 - Invoice', 100, 200), row('102 - Sales', 50, 25)],
        outcome: [row('14 - Food', 30, 10), row('23 - Rent', 60, 20)],
        balance: ['-', ...Array(12).fill(100)],
        tax: ['-', ...Array(12).fill(0)],
      },
    };

    const wrapper = mountPage();
    await flushPromises();

    const chart = wrapper.findComponent({ name: 'Bar' });
    const datasets = chart.props('data').datasets;

    expect(datasets.map((dataset: any) => dataset.label)).toEqual(['Income', 'Expenses', 'Net worth']);

    const income = datasets.find((dataset: any) => dataset.label === 'Income');
    const expenses = datasets.find((dataset: any) => dataset.label === 'Expenses');
    expect(income.data.slice(0, 2)).toEqual([150, 225]);
    // Expenses are drawn below zero.
    expect(expenses.data.slice(0, 2)).toEqual([-90, -30]);
  });

  it('puts a category pie in a smaller column beside the annual chart', async () => {
    reportData.value = {
      data: {
        netWorth: ['-', ...Array(12).fill(4100)],
        income: [],
        outcome: [],
      },
    };

    const wrapper = mountPage();
    await flushPromises();

    const charts = wrapper.find('.report-page__charts');
    expect(charts.exists()).toBe(true);
    expect(charts.find('.col-4.report-page__pie').exists()).toBe(true);
    expect(charts.find('.col-8.report-page__chart').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'Pie' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'Bar' }).exists()).toBe(true);
  });

  it('slices the pie by the yearly total of each category with activity', async () => {
    const row = (label: string, jan: number, feb: number) => [label, jan, feb, ...Array(10).fill(0)];

    reportData.value = {
      data: {
        netWorth: ['-', ...Array(12).fill(4100)],
        income: [row('101 - Invoice', 100, 200), row('102 - Sales', 0, 0)],
        outcome: [row('14 - Food', 30, 10)],
      },
    };

    const wrapper = mountPage();
    await flushPromises();

    const pie = wrapper.findComponent({ name: 'Pie' });
    expect(pie.props('data').labels).toEqual(['101 - Invoice', '14 - Food']);
    expect(pie.props('data').datasets[0].data).toEqual([300, 40]);
  });
});
