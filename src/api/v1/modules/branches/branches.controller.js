const branchService = require('./branches.service');
const logger = require('../../../../utils/logger');

/**
 * Handles the request to list branches for a business.
 */
const list = async (req, res, next) => {
  try {
    const { businessId } = req.user;

    logger.info(`Controller: Received request to list branches for business ${businessId}`);

    const branches = await branchService.listByBusiness(businessId);

    res.status(200).json({
      message: 'Branches listed successfully',
      data: branches,
    });
  } catch (error) {
    logger.error(`Error listing branches: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

module.exports = {
  list,
};
