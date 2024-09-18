/**
 * BOOKKEEPR
 * Wallets routes
 */

const router = require('express').Router();

const walletsController = require('@/controllers/wallets.js');

router.get('/', walletsController.getWallets);
router.post('/', walletsController.saveWallet);
router.patch('/:id', walletsController.saveWallet);
router.delete('/:id', walletsController.deleteWallet);

module.exports = router;
