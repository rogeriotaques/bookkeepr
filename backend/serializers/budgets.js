exports.serializeBudget = (budget) => budget;

exports.serializeBudgetItems = (items) => items;

exports.serializeBudgetWithItems = ({ budget, items }) => ({
  budget: exports.serializeBudget(budget),
  items: exports.serializeBudgetItems(items),
});
