import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppFooter from '@/components/navigation/AppFooter.vue';

describe('AppFooter', () => {
  it('should stack its three items by default', () => {
    const wrapper = mount(AppFooter);

    expect(wrapper.classes()).not.toContain('app_footer--inline');
    expect(wrapper.find('.app_footer__copyright').text()).toContain('Abtz Labs');
    expect(wrapper.find('.app_footer__brand').text()).toContain('BookKeepr');
    expect(wrapper.find('.app_footer__help').find('a').attributes('href')).toBe('mailto:hello@abtz.co');
  });

  it('should offer the inline layout for the app shell', () => {
    const wrapper = mount(AppFooter, { props: { inline: true } });

    expect(wrapper.classes()).toContain('app_footer--inline');
    // Copyright, then the help link, then the branding, as laid out on the row.
    const items = wrapper.findAll('p');
    expect(items.map((item) => item.classes()[0])).toEqual([
      'app_footer__copyright',
      'app_footer__brand',
      'app_footer__help',
    ]);
  });
});
