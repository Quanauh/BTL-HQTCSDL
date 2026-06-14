const reports = require('./admin/reports');
const brands = require('./admin/brands');
const products = require('./admin/products');
const orders = require('./admin/orders');
const users = require('./admin/users');

module.exports = {
  ...reports,
  ...brands,
  ...products,
  ...orders,
  ...users
};
