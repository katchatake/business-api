const businessTypesService = require('./business-types.service');
const logger = require('../../../../utils/logger');

/**
 * Handles the request to create a new business type.
 */
const create = async (req, res, next) => {
  try {
    const { body: businessTypeData } = req;

    logger.info('Controller: Received request to create a new business type.');

    const newBusinessType = await businessTypesService.create(businessTypeData);

    res.status(201).json({
      message: 'Business type created successfully',
      data: newBusinessType,
    });
  } catch (error) {
    logger.error(`Error creating business type: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Handles the request to get all business types.
 */
const getAll = async (req, res, next) => {
  try {
    logger.info('Controller: Received request to get all business types.');
    const businessTypes = await businessTypesService.getAll();
    res.status(200).json(businessTypes);
  } catch (error) {
    logger.error(`Error getting all business types: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Handles the request to get a business type by its ID.
 */
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info(`Controller: Received request to get business type with ID: ${id}`);
    const businessType = await businessTypesService.getById(id);
    res.status(200).json(businessType);
  } catch (error) {
    logger.error(`Error getting business type by ID: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

module.exports = {
  create,
  getAll,
  getById,
};
