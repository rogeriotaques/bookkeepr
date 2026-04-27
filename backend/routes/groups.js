/**
 * BOOKKEEPR
 * Groups routes
 */

const router = require('express').Router();

const { ENTRY_OPERATIONS } = require('@/constants');
const { validate, isRequired, isString, isNumber, isOneOf } = require('@/middleware/validate');
const groupsController = require('@/controllers/groups.js');

const groupValidation = {
  code: [isRequired('Invalid code'), isNumber('Invalid code')],
  name: [isRequired('Missing name'), isString(60, 'Name too long')],
  operation: [isRequired('Missing operation'), isOneOf(Object.values(ENTRY_OPERATIONS), 'Missing operation')],
  active: [isRequired('Invalid active flag'), isOneOf([0, 1], 'Invalid active flag')],
};

router.get('/', groupsController.getGroups);
router.post('/', validate(groupValidation), groupsController.saveGroup);
router.patch('/:id', validate(groupValidation), groupsController.saveGroup);
router.delete('/:id', groupsController.deleteGroup);

module.exports = router;
