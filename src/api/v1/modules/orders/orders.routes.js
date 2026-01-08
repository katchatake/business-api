const express = require('express');
const ordersController = require('./orders.controller');
const { createOrderSchema } = require('./orders.validator');
const { validate } = require('../../../../middlewares/validator.middleware');
const { checkJwt, checkRoles } = require('../../../../middlewares/auth.middleware');

const router = express.Router();

// Define roles that can create orders
const ORDER_CREATORS = ['OWNER', 'MANAGER', 'CASHIER', 'WAITER'];

router.post(
  '/',
  checkJwt,
  checkRoles(...ORDER_CREATORS),
  validate(createOrderSchema, 'body'),
  ordersController.create
);

// Other routes like GET /, GET /:id would go here

module.exports = router;
