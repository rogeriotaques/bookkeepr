import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SettingsRow from '@/components/settings/SettingsRow.vue';
import CurrencySettings from '@/components/settings/advanced/CurrencySettings.vue';

describe('SettingsRow', () => {
  it('should put info on the left and control on the right', () => {
    const wrapper = mount(SettingsRow, {
      slots: {
        default: '<p>Info</p>',
        control: '<button>Action</button>',
      },
    });

    const info = wrapper.find('.settings-row__info');
    const control = wrapper.find('.settings-row__control');

    expect(info.text()).toBe('Info');
    expect(control.text()).toBe('Action');
    expect(info.element.nextElementSibling).toBe(control.element);
  });
});

describe('CurrencySettings layout', () => {
  it('should use the two column settings row instead of the 12 column grid', () => {
    const wrapper = mount(CurrencySettings, {
      props: {
        data: { currencyCode: 'JPY', currencyLocale: 'ja-JP' },
      },
    });

    expect(wrapper.find('.settings-row').exists()).toBe(true);
    expect(wrapper.find('.settings-row__control').findAll('input')).toHaveLength(2);
    expect(wrapper.find('.row').exists()).toBe(false);
    expect(wrapper.find('.col-8').exists()).toBe(false);
  });
});
