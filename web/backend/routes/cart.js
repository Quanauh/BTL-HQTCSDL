const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');

// All cart routes require a logged-in customer
router.use(auth);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/', cartController.updateQuantity);
router.delete('/:id', cartController.removeFromCart);

module.exports = router;
