import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import DateInput from '@/components/shared/DateInput.vue';

const mountInput = (modelValue = '2026-10-14') =>
  mount(DateInput, { props: { modelValue } });

const field = (wrapper: ReturnType<typeof mountInput>) =>
  wrapper.find('input').element as HTMLInputElement;

describe('DateInput', () => {
  it('renders the ISO value as YYYY/MM/DD', () => {
    const wrapper = mountInput();
    expect(field(wrapper).value).toBe('2026/10/14');
  });

  it('focuses the day segment', async () => {
    const wrapper = mountInput();
    await wrapper.find('input').trigger('focus');
    await flushPromises();

    const input = field(wrapper);
    expect(input.selectionStart).toBe(8);
    expect(input.selectionEnd).toBe(10);
  });

  it('updates the day when typing digits', async () => {
    const wrapper = mountInput();
    await wrapper.find('input').trigger('focus');
    await flushPromises();

    await wrapper.find('input').trigger('keydown', { key: '2' });
    await wrapper.find('input').trigger('keydown', { key: '5' });
    await flushPromises();

    expect(field(wrapper).value).toBe('2026/10/25');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['2026-10-25']);
  });

  it('moves to the month segment with ArrowLeft', async () => {
    const wrapper = mountInput();
    await wrapper.find('input').trigger('focus');
    await flushPromises();

    await wrapper.find('input').trigger('keydown', { key: 'ArrowLeft' });
    await wrapper.find('input').trigger('keydown', { key: '0' });
    await wrapper.find('input').trigger('keydown', { key: '3' });
    await flushPromises();

    expect(field(wrapper).value).toBe('2026/03/14');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['2026-03-14']);
  });

  it('clears the active segment on Backspace', async () => {
    const wrapper = mountInput();
    await wrapper.find('input').trigger('focus');
    await flushPromises();

    await wrapper.find('input').trigger('keydown', { key: 'Backspace' });
    await flushPromises();

    expect(field(wrapper).value).toBe('2026/10/');
  });
});
