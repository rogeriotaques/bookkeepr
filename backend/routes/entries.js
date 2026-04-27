/**
 * BOOKKEEPR
 * Entries routes
 */

const router = require('express').Router();

const { validate, isRequired, isString, isNumber, isValidDate, isValidAmount } = require('@/middleware/validate');
const entriesController = require('@/controllers/entries.js');

const entryValidation = {
  date: [isRequired('Invalid date'), isValidDate('Invalid date')],
  description: [isRequired('Missing description'), isString(255, 'Description too long')],
  amount: [isValidAmount('Invalid amount')],
  group: [isRequired('Invalid group ID'), isNumber('Invalid group ID')],
  wallet: [isRequired('Invalid wallet ID'), isNumber('Invalid wallet ID')],
};

router.get('/recorded-years', entriesController.getRecordedYears);
router.get('/', entriesController.getEntries);
router.post('/', validate(entryValidation), entriesController.saveEntry);
router.patch('/:id', validate(entryValidation), entriesController.saveEntry);
router.delete('/:id', entriesController.deleteEntry);

module.exports = router;
