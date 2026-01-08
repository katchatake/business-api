const promotionService = require('./promotions.service');
const logger = require('../../../../utils/logger');

/**
 * Handles the request to create a new promotion.
 */
const create = async (req, res, next) => {
  try {
    const { body: promotionData } = req;
    const { businessId } = req.user;

    logger.info(`Controller: Received request to create promotion for business ${businessId}`);

    const newPromotion = await promotionService.create(promotionData, businessId);

    res.status(201).json({
      message: 'Promotion created successfully',
      data: newPromotion,
    });
  } catch (error) {
    logger.error(`Error creating promotion: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Handles the request to list promotions for a business.
 */
const list = async (req, res, next) => {
  try {
    const { businessId } = req.user;

    logger.info(`Controller: Received request to list promotions for business ${businessId}`);

    const promotions = await promotionService.listByBusiness(businessId);

    res.status(200).json({
      message: 'Promotions listed successfully',
      data: promotions,
    });
  } catch (error) {
    logger.error(`Error listing promotions: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

module.exports = {
  create,
  list,
};
