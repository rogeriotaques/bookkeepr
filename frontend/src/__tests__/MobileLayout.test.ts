import { describe, it, expect } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import MobileLayout from '@/components/layout/MobileLayout.vue';

describe('MobileLayout', () => {
  const mountLayout = () =>
    mount(MobileLayout, {
      global: {
        stubs: {
          RouterView: true,
          RouterLink: RouterLinkStub,
        },
      },
    });

  it('should render bottom navigation with 5 tabs', () => {
    const wrapper = mountLayout();
    const tabs = wrapper.findAllComponents(RouterLinkStub);
    expect(tabs.length).toBe(5);
  });

  it('should include Dashboard tab', () => {
    const wrapper = mountLayout();
    const links = wrapper.findAllComponents(RouterLinkStub);
    expect(links.some((l) => l.props('to') === '/')).toBe(true);
  });

  it('should include Entry tab', () => {
    const wrapper = mountLayout();
    const links = wrapper.findAllComponents(RouterLinkStub);
    expect(links.some((l) => l.props('to') === '/entry')).toBe(true);
  });

  it('should include History tab', () => {
    const wrapper = mountLayout();
    const links = wrapper.findAllComponents(RouterLinkStub);
    expect(links.some((l) => l.props('to') === '/history')).toBe(true);
  });

  it('should include Planning tab', () => {
    const wrapper = mountLayout();
    const links = wrapper.findAllComponents(RouterLinkStub);
    expect(links.some((l) => l.props('to') === '/planning')).toBe(true);
  });

  it('should include Settings tab', () => {
    const wrapper = mountLayout();
    const links = wrapper.findAllComponents(RouterLinkStub);
    expect(links.some((l) => l.props('to') === '/settings')).toBe(true);
  });
});
