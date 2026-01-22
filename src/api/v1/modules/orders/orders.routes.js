const express = require('express');
const ordersController = require('./orders.controller');
const { createOrderSchema, listOrdersSchema } = require('./orders.validator'); // Added listOrdersSchema
const { validate } = require('../../../../middlewares/validator.middleware');
const { checkJwt, checkRoles } = require('../../../../middlewares/auth.middleware');

const router = express.Router();

// Define roles that can create orders
const ORDER_CREATORS = ['OWNER', 'MANAGER', 'CASHIER', 'WAITER'];
const ORDER_VIEWERS = ['OWNER', 'MANAGER', 'CASHIER']; // Roles that can view orders

router.post(
  '/',
  checkJwt,
  checkRoles(...ORDER_CREATORS),
  validate(createOrderSchema, 'body'),
  ordersController.create
);

router.get(
  '/',
  checkJwt,
  checkRoles(...ORDER_VIEWERS),
  validate(listOrdersSchema, 'query'),
  ordersController.listOrders
);

// Other routes like GET /:id would go here

module.exports = router;
