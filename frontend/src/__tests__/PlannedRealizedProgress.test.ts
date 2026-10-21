import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PlannedRealizedProgress from '@/components/report/PlannedRealizedProgress.vue';

const mountProgress = (planned: any, realized: any) =>
  mount(PlannedRealizedProgress, {
    props: { planned, realized },
    global: { stubs: { BaseProgress: true } },
  });

describe('PlannedRealizedProgress', () => {
  it('formats thousands in the percentage', () => {
    const wrapper = mountProgress(
      { income: 100, expense: 100 },
      { income: 2352, expense: 176 }
    );

    expect(wrapper.text()).toContain('2,352%');
    expect(wrapper.text()).toContain('176%');
  });

  it('leaves percentages under a thousand unformatted', () => {
    const wrapper = mountProgress(
      { income: 100, expense: 100 },
      { income: 91, expense: 86 }
    );

    expect(wrapper.text()).toContain('91%');
    expect(wrapper.text()).toContain('86%');
  });

  it('shows zero when the plan is zero', () => {
    const wrapper = mountProgress(
      { income: 0, expense: 0 },
      { income: 500, expense: 0 }
    );

    expect(wrapper.text()).toContain('0%');
  });
});
