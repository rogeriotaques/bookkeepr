import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import InsightPanel from '@/components/report/InsightPanel.vue';

const insight = {
  title: "You're doing great!",
  subtitle: 'You kept ¥ 3,200 this month.',
};

describe('InsightPanel', () => {
  it('renders the insight title and subtitle', () => {
    const wrapper = mount(InsightPanel, {
      props: { insight, loading: false, error: false },
    });

    expect(wrapper.find('h1').text()).toBe(insight.title);
    expect(wrapper.find('p').text()).toBe(insight.subtitle);
  });

  it('renders a skeleton while loading and hides it from assistive tech', () => {
    const wrapper = mount(InsightPanel, {
      props: { insight: null, loading: true, error: false },
      global: { stubs: { BaseSkeleton: true } },
    });

    const skeleton = wrapper.find('.insight-panel__loading');
    expect(skeleton.exists()).toBe(true);
    expect(skeleton.attributes('aria-hidden')).toBe('true');
    expect(wrapper.find('h1').exists()).toBe(false);
  });

  it('shows neutral copy on error, never praise', () => {
    const wrapper = mount(InsightPanel, {
      props: { insight: null, loading: false, error: true },
    });

    expect(wrapper.text()).toContain('Insight unavailable');
    expect(wrapper.text()).toContain('Refresh to try again.');
    expect(wrapper.text()).not.toContain("You're doing great!");
  });

  it('shows neutral copy when the response has no insight', () => {
    const wrapper = mount(InsightPanel, {
      props: { insight: null, loading: false, error: false },
    });

    expect(wrapper.text()).toContain('Insight unavailable');
  });
});
