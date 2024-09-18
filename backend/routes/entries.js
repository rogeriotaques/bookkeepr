/**
 * BOOKKEEPR
 * Entries routes
 */

const router = require('express').Router();

const entriesController = require('@/controllers/entries.js');

router.get('/', entriesController.getEntries);
router.get('/recorded-years', entriesController.getRecordedYears);
router.post('/', entriesController.saveEntry);
router.patch('/:id', entriesController.saveEntry);
router.delete('/:id', entriesController.deleteEntry);

module.exports = router;
