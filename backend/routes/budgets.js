/**
 * BOOKKEEPR
 * Budgets routes
 */

const router = require('express').Router();
const budgetsController = require('@/controllers/budgets');

router.get('/', budgetsController.getBudget);
router.post('/', budgetsController.createBudget);
router.put('/:id', budgetsController.updateBudget);
router.delete('/:id', budgetsController.deleteBudget);

module.exports = router;
