/**
 * BOOKKEEPR
 * Groups routes
 */

const groupsController = require('@/controllers/groups.js');

const router = require('express').Router();

router.get('/', groupsController.getGroups);
router.post('/', groupsController.saveGroup);
router.patch('/:id', groupsController.saveGroup);
router.delete('/:id', groupsController.deleteGroup);

module.exports = router;
