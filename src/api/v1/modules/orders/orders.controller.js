const orderService = require('./orders.service');
const logger = require('../../../../utils/logger');

/**
 * Handles the request to create a new order.
 */
const create = async (req, res, next) => {
  try {
    const { body: orderData } = req;
    const { userId, businessId } = req.user;

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

module.exports = {
  create,
};
