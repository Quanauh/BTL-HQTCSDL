const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// All product-related routes are public
router.get('/brands', productController.getBrands);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductDetail);

module.exports = router;
