import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PlannedRealizedTable from '@/components/report/PlannedRealizedTable.vue';

const NEGATIVE = 'planned-realized-table__value--negative';
const POSITIVE = 'planned-realized-table__value--positive';

const mountTable = (planned: any, realized: any) =>
  mount(PlannedRealizedTable, { props: { planned, realized } });

// Rows are Income (0), Expenses (1), Balance (2); the Realized cell is the
// second `td` in each row.
const realizedCell = (wrapper: any, row: number) => wrapper.findAll('tbody tr')[row].findAll('td')[1];

describe('PlannedRealizedTable', () => {
  describe('income', () => {
    it('marks realized red when it is below planned', () => {
      const wrapper = mountTable({ income: 1000, expense: 0 }, { income: 900, expense: 0 });
      expect(realizedCell(wrapper, 0).classes()).toContain(NEGATIVE);
    });

    it('marks realized green when it is above planned', () => {
      const wrapper = mountTable({ income: 1000, expense: 0 }, { income: 1100, expense: 0 });
      expect(realizedCell(wrapper, 0).classes()).toContain(POSITIVE);
    });

    it('leaves realized plain when it equals planned', () => {
      const wrapper = mountTable({ income: 1000, expense: 0 }, { income: 1000, expense: 0 });
      expect(realizedCell(wrapper, 0).classes()).not.toContain(NEGATIVE);
      expect(realizedCell(wrapper, 0).classes()).not.toContain(POSITIVE);
    });
  });

  describe('expenses', () => {
    it('marks realized red when it is above planned', () => {
      const wrapper = mountTable({ income: 0, expense: 400 }, { income: 0, expense: 500 });
      expect(realizedCell(wrapper, 1).classes()).toContain(NEGATIVE);
    });

    it('marks realized green when it is below planned', () => {
      const wrapper = mountTable({ income: 0, expense: 400 }, { income: 0, expense: 300 });
      expect(realizedCell(wrapper, 1).classes()).toContain(POSITIVE);
    });

    it('leaves realized plain when it equals planned', () => {
      const wrapper = mountTable({ income: 0, expense: 400 }, { income: 0, expense: 400 });
      expect(realizedCell(wrapper, 1).classes()).not.toContain(NEGATIVE);
      expect(realizedCell(wrapper, 1).classes()).not.toContain(POSITIVE);
    });
  });

  describe('balance', () => {
    // Planned balance: 1000 - 400 = 600.
    it('marks realized red when it is below planned', () => {
      const wrapper = mountTable({ income: 1000, expense: 400 }, { income: 500, expense: 400 });
      expect(realizedCell(wrapper, 2).classes()).toContain(NEGATIVE);
    });

    it('marks realized green when it is above planned', () => {
      const wrapper = mountTable({ income: 1000, expense: 400 }, { income: 1600, expense: 400 });
      expect(realizedCell(wrapper, 2).classes()).toContain(POSITIVE);
    });

    it('leaves realized plain when it equals planned', () => {
      const wrapper = mountTable({ income: 1000, expense: 400 }, { income: 1000, expense: 400 });
      expect(realizedCell(wrapper, 2).classes()).not.toContain(NEGATIVE);
      expect(realizedCell(wrapper, 2).classes()).not.toContain(POSITIVE);
    });
  });
});
