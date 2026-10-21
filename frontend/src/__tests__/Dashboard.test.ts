import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, RouterLinkStub, flushPromises } from '@vue/test-utils';
import Dashboard from '@/components/layout/Dashboard.vue';
import { resetHotkeys } from '@/composable/useHotkeys';

const { logoutMock } = vi.hoisted(() => ({ logoutMock: vi.fn() }));

vi.mock('@/composable/useState', () => ({
  useState: () => ({}),
  logout: logoutMock,
}));

describe('Dashboard', () => {
  let mounted: ReturnType<typeof mount> | undefined;

  const mountLayout = () => {
    mounted = mount(Dashboard, {
      global: {
        stubs: {
          RouterView: true,
          RouterLink: RouterLinkStub,
        },
      },
    });

    return mounted;
  };

  afterEach(() => {
    mounted?.unmount();
    mounted = undefined;
    resetHotkeys();
    document.body.innerHTML = '';
  });

  it('should render navigation with 5 tabs', () => {
    const wrapper = mountLayout();
    const tabs = wrapper.findAllComponents(RouterLinkStub);
    expect(tabs.length).toBe(5);
  });

  it('should include Dashboard tab', () => {
    const wrapper = mountLayout();
    const links = wrapper.findAllComponents(RouterLinkStub);
    expect(links.some((l) => l.props('to') === '/')).toBe(true);
  });

  it('should include a single Transactions tab', () => {
    const wrapper = mountLayout();
    const links = wrapper.findAllComponents(RouterLinkStub);
    const transactions = links.filter((l) => l.props('to') === '/transactions');

    expect(transactions.length).toBe(1);
    expect(links.some((l) => l.props('to') === '/entry')).toBe(false);
    expect(links.some((l) => l.props('to') === '/history')).toBe(false);
  });

  it('should include Planning tab', () => {
    const wrapper = mountLayout();
    const links = wrapper.findAllComponents(RouterLinkStub);
    expect(links.some((l) => l.props('to') === '/planning')).toBe(true);
  });

  it('should include Report tab', () => {
    const wrapper = mountLayout();
    const links = wrapper.findAllComponents(RouterLinkStub);
    expect(links.some((l) => l.props('to') === '/report')).toBe(true);
  });

  it('should include Settings tab', () => {
    const wrapper = mountLayout();
    const links = wrapper.findAllComponents(RouterLinkStub);
    expect(links.some((l) => l.props('to') === '/settings')).toBe(true);
  });

  it('should render the app footer below the content', () => {
    const wrapper = mountLayout();

    expect(wrapper.find('.dashboard__footer').exists()).toBe(true);
    expect(wrapper.find('.app_footer--inline').exists()).toBe(true);
  });

  it('should render the page content', () => {
    const wrapper = mountLayout();
    expect(wrapper.find('.dashboard__content').exists()).toBe(true);
  });

  it('asks for confirmation before logging out', async () => {
    logoutMock.mockClear();
    const wrapper = mountLayout();

    const button = wrapper.find('[data-testid="nav-logout"]');
    expect(button.exists()).toBe(true);

    await button.trigger('click');
    await flushPromises();

    expect(logoutMock).not.toHaveBeenCalled();
    expect(document.querySelector('.base-confirm-modal')).not.toBeNull();

    const confirm = document.querySelector(
      '.base-confirm-modal .card__link--danger'
    ) as HTMLButtonElement;
    confirm.click();
    await flushPromises();

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it('opens the shortcut panel with ?', async () => {
    mountLayout();
    await flushPromises();

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: '?', bubbles: true, cancelable: true })
    );
    await flushPromises();

    expect(document.querySelector('.shortcut-help')).not.toBeNull();
    expect(document.body.textContent).toContain('Keyboard shortcuts');
    expect(document.body.textContent).toContain('g d');
  });

  it('opens the shortcut panel from the navbar', async () => {
    const wrapper = mountLayout();
    await flushPromises();

    const button = wrapper.find('[data-testid="nav-shortcuts"]');
    expect(button.exists()).toBe(true);
    expect(button.attributes('aria-label')).toBe('Keyboard shortcuts');

    await button.trigger('click');
    await flushPromises();

    expect(document.querySelector('.shortcut-help')).not.toBeNull();
  });
});
