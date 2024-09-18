/**
 * BOOKKEEPR
 * Groups routes
 */

const router = require('express').Router();

const groupsController = require('@/controllers/groups.js');

router.get('/', groupsController.getGroups);
router.post('/', groupsController.saveGroup);
router.patch('/:id', groupsController.saveGroup);
router.delete('/:id', groupsController.deleteGroup);

module.exports = router;
