/**
 * BOOKKEEPR
 * Wallets routes
 */

const router = require('express').Router();

const { validate, isRequired, isString, isOneOf } = require('@/middleware/validate');
const walletsController = require('@/controllers/wallets.js');

const walletValidation = {
  name: [isRequired('Missing name'), isString(60, 'Name too long')],
  active: [isRequired('Invalid active flag'), isOneOf([0, 1], 'Invalid active flag')],
};

router.get('/', walletsController.getWallets);
router.post('/', validate(walletValidation), walletsController.saveWallet);
router.patch('/:id', validate(walletValidation), walletsController.saveWallet);
router.delete('/:id', walletsController.deleteWallet);

module.exports = router;
