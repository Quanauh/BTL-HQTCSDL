const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

// All order routes require a logged-in customer
router.use(auth);

router.post('/', orderController.placeOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderDetail);

module.exports = router;
