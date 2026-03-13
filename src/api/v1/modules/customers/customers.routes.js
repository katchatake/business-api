const express = require('express');
const {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('./customers.controller');
const {
  createCustomerSchema,
  updateCustomerSchema,
  getCustomerSchema,
} = require('./customers.validator');
const { validate } = require('../../../../middlewares/validator.middleware');
const { checkJwt, checkRoles } = require('../../../../middlewares/auth.middleware');

const router = express.Router();

// Apply JWT check and role check to all customer routes
router.use(checkJwt, checkRoles('OWNER', 'MANAGER', 'CASHIER', 'WAITER'));

router.get('/', listCustomers);

router.get('/:id', validate(getCustomerSchema, 'params'), getCustomer);

router.post('/', validate(createCustomerSchema, 'body'), createCustomer);

router.patch(
  '/:id',
  validate(getCustomerSchema, 'params'),
  validate(updateCustomerSchema, 'body'),
  updateCustomer
);

router.delete('/:id', validate(getCustomerSchema, 'params'), deleteCustomer);

module.exports = router;
