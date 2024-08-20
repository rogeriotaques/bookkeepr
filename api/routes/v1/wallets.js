/**
 * BOOKKEEPR
 * Wallets routes
 */

const walletsController = require('@/controllers/wallets.js');

const router = require('express').Router();

router.get('/', walletsController.getWallets);
router.post('/', walletsController.saveWallet);
router.patch('/:id', walletsController.saveWallet);
router.delete('/:id', walletsController.deleteWallet);

module.exports = router;
