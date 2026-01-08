const businessService = require('./businesses.service');
const logger = require('../../../../utils/logger');
const boom = require('@hapi/boom'); // Assuming boom is used for error handling

/**
 * Handles the request to register a new business.
 */
const register = async (req, res, next) => {
  try {
    const { body: registrationData } = req;

    logger.info('Controller: Received request to register a new business.');

    const result = await businessService.register(registrationData);

    res.status(201).json({
      message: 'Business registered successfully',
      data: result,
    });
  } catch (error) {
    logger.error(`Error registering business: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Handles the request to update an existing business.
 */
const update = async (req, res, next) => {
  try {
    const { id: businessId } = req.params;
    const { body: updateData } = req;

    logger.info(`Controller: Received request to update business with ID: ${businessId}`);

    // Ensure the businessId from the path matches any businessId in the body if present
    if (updateData.businessId && updateData.businessId !== parseInt(businessId, 10)) {
      throw boom.badRequest('Business ID in path and body do not match.');
    }

    const updatedBusiness = await businessService.updateBusiness(businessId, updateData);

    if (!updatedBusiness) {
      throw boom.notFound('Business not found.');
    }

    res.status(200).json({
      message: 'Business updated successfully',
      data: updatedBusiness,
    });
  } catch (error) {
    logger.error(`Error updating business: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

module.exports = {
  register,
  update, // Export the new update method
};
