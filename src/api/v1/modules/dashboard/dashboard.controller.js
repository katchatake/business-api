const dashboardService = require('./dashboard.service');
const logger = require('../../../../utils/logger');

/**
 * Handles the request to get the sales summary.
 */
const getSalesSummary = async (req, res, next) => {
  try {
    const { businessId, branchId: userBranchId } = req.user;
    const { branchId: queryBranchId } = req.query;

    logger.info(`Controller: Received request for sales summary for business ${businessId}`);

    const summary = await dashboardService.getSalesSummary(businessId, userBranchId, queryBranchId);

    res.status(200).json({
      message: 'Sales summary retrieved successfully',
      data: summary,
    });
  } catch (error) {
    logger.error(`Error getting sales summary: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

module.exports = {
  getSalesSummary,
};
