const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// Protect all admin endpoints with adminAuth middleware
router.use(adminAuth);

// Analytics
router.get('/reports', adminController.getReports);

// Brand Management
router.get('/brands', adminController.getBrands);
router.post('/brands', adminController.createBrand);
router.put('/brands/:id', adminController.updateBrand);
router.delete('/brands/:id', adminController.deleteBrand);

// Product Management
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Order Management
router.get('/orders', adminController.getOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// User Management
router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
