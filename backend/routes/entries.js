/**
 * BOOKKEEPR
 * Entries routes
 */

const entriesController = require('@/controllers/entries.js');

const router = require('express').Router();

router.get('/', entriesController.getEntries);
router.get('/recorded-years', entriesController.getRecordedYears);
router.post('/', entriesController.saveEntry);
router.patch('/:id', entriesController.saveEntry);
router.delete('/:id', entriesController.deleteEntry);

module.exports = router;
