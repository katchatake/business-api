const businessTypeService = require('./business-types.service');
const logger = require('../../../../utils/logger');

/**
 * Handles the request to create a new business type.
 */
const create = async (req, res, next) => {
  try {
    const { body: businessTypeData } = req;

    logger.info('Controller: Received request to create a new business type.');

    const newBusinessType = await businessTypeService.create(businessTypeData);

    res.status(201).json({
      message: 'Business type created successfully',
      data: newBusinessType,
    });
  } catch (error) {
    logger.error(`Error creating business type: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

module.exports = {
  create,
};
