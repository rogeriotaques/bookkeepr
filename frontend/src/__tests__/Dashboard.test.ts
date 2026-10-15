import { describe, it, expect, vi } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import Dashboard from '@/components/layout/Dashboard.vue';

const { logoutMock } = vi.hoisted(() => ({ logoutMock: vi.fn() }));

vi.mock('@/composable/useState', () => ({
  useState: () => ({}),
  logout: logoutMock,
}));

describe('Dashboard', () => {
  const mountLayout = () =>
    mount(Dashboard, {
      global: {
        stubs: {
          RouterView: true,
          RouterLink: RouterLinkStub,
        },
      },
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

  it('should render the page content', () => {
    const wrapper = mountLayout();
    expect(wrapper.find('.dashboard__content').exists()).toBe(true);
  });

  it('should log out from the navigation', async () => {
    logoutMock.mockClear();
    const wrapper = mountLayout();

    const button = wrapper.find('[data-testid="nav-logout"]');
    expect(button.exists()).toBe(true);

    await button.trigger('click');
    expect(logoutMock).toHaveBeenCalled();
  });
});
