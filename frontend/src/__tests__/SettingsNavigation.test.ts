import { describe, it, expect } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import SettingsNavigation from '@/components/settings/SettingsNavigation.vue';

const mountNavigation = () =>
  mount(SettingsNavigation, {
    global: {
      stubs: {
        RouterView: true,
        RouterLink: RouterLinkStub,
      },
    },
  });

describe('SettingsNavigation', () => {
  it('should render the sections as top tabs', () => {
    const wrapper = mountNavigation();
    const nav = wrapper.find('nav');
    expect(nav.exists()).toBe(true);
    expect(nav.attributes('aria-label')).toBe('Settings sections');
  });

  it('should link to every settings section', () => {
    const wrapper = mountNavigation();
    const targets = wrapper
      .findAllComponents(RouterLinkStub)
      .map((link) => link.props('to'));

    expect(targets).toEqual([
      '/settings/groups',
      '/settings/wallets',
      '/settings/advanced',
    ]);
  });

  it('should not use the boxed side menu', () => {
    const wrapper = mountNavigation();
    expect(wrapper.find('.box').exists()).toBe(false);
    expect(wrapper.find('.col-3').exists()).toBe(false);
  });

  it('should render the active section below the tabs', () => {
    const wrapper = mountNavigation();
    expect(wrapper.findComponent({ name: 'RouterView' }).exists()).toBe(true);
  });
});
