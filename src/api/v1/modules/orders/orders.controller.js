const orderService = require('./orders.service');
const logger = require('../../../../utils/logger');

/**
 * Handles the request to create a new order.
 */
const create = async (req, res, next) => {
  try {
    const { body: orderData } = req;
    const { userId, businessId } = req.user;

    console.log(req.user)
    logger.info(`Controller: Received request to create order for business ${businessId}`);

    const newOrder = await orderService.create(orderData, { userId, businessId });

    res.status(201).json({
      message: 'Order created successfully',
      data: newOrder,
    });
  } catch (error) {
    logger.error(`Error creating order: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Handles the request to list orders for a business.
 */
const listOrders = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const filters = req.query; // Query parameters for filtering

    logger.info(`Controller: Received request to list orders for business ${businessId} with filters: ${JSON.stringify(filters)}`);

    const orders = await orderService.listOrders(businessId, filters);

    res.status(200).json({
      message: 'Orders listed successfully',
      data: orders,
    });
  } catch (error) {
    logger.error(`Error listing orders: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

module.exports = {
  create,
  listOrders,
};
