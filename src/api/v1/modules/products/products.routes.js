const express = require('express');
const productsController = require('./products.controller');
const { createProductSchema, listProductsSchema } = require('./products.validator');
const { validate } = require('../../../../middlewares/validator.middleware');
const authMiddleware = require('../../../../middlewares/auth.middleware');
const productMiddleware = require('./products.middleware');

const router = express.Router();

router.get(
  '/',
  authMiddleware.checkJwt,
  authMiddleware.checkRoles('OWNER', 'MANAGER', 'CASHIER', 'WAITER'),
  validate(listProductsSchema, 'query'),
  productsController.listProducts
);

router.post(
  '/',
  authMiddleware.checkJwt,
  authMiddleware.checkRoles('OWNER', 'MANAGER'),
  productMiddleware.checkProductPermissions,
  productMiddleware.checkProductTypeByBusinessStrategy,
  validate(createProductSchema, 'body'),
  productsController.createProduct
);

module.exports = router;


