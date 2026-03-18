const dashboardService = require('./dashboard.service');
const logger = require('../../../../utils/logger');

/**
 * Handles the request to get the sales summary.
 */
const getSalesSummary = async (req, res, next) => {
  try {
    const { businessId, branchId: userBranchId } = req.user;
    const { branchId: queryBranchId } = req.query;

    logger.info(
      `Controller: Received request for sales summary for business ${businessId}`
    );

    const summary = await dashboardService.getSalesSummary(
      businessId,
      userBranchId,
      queryBranchId
    );

    res.status(200).json({
      message: 'Sales summary retrieved successfully',
      data: summary,
    });
  } catch (error) {
    logger.error(`Error getting sales summary: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};

const getSalesByRanges = async (req, res, next) => {
  try {
    const { businessId, branchId: userBranchId } = req.user;
    let { branchId, startDate, endDate } = req.query;

    if (!branchId) {
      branchId = userBranchId;
    }

    if (!startDate || !endDate) {
      const today = new Date();
      startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();
    }

    const data = await dashboardService.getSalesByRanges({
      businessId,
      branchId,
      startDate,
      endDate,
    });

    res.json({ message: 'Sales by ranges retrieved successfully', data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalesSummary,
  getSalesByRanges,
};
