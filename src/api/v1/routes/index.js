const express = require('express');
const authRouter = require('../modules/auth/auth.routes');
const usersRouter = require('../modules/users/users.routes');
const productsRouter = require('../modules/products/products.routes');
const businessTypesRouter = require('../modules/business-types/business-types.routes');
const businessesRouter = require('../modules/businesses/businesses.routes');
const appointmentsRouter = require('../modules/appointments/appointments.routes');
const branchesRouter = require('../modules/branches/branches.routes');
const promotionsRouter = require('../modules/promotions/promotions.routes');
const ordersRouter = require('../modules/orders/orders.routes');
const inventoryRouter = require('../modules/inventory/inventory.routes'); // New import

const router = express.Router();

// Montar los routers de los diferentes módulos
router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/products', productsRouter);
router.use('/business-types', businessTypesRouter);
router.use('/businesses', businessesRouter);
router.use('/appointments', appointmentsRouter);
router.use('/branches', branchesRouter);
router.use('/promotions', promotionsRouter);
router.use('/orders', ordersRouter);
router.use('/inventory', inventoryRouter); // New route

module.exports = router;

